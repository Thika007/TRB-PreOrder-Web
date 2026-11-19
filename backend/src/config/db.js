const sql = require('mssql');
require('./envLoader');

let lastConnectionDiagnostics = {
    status: 'pending',
    timestamp: new Date().toISOString(),
    config: null,
    error: null,
    diagnosis: null
};

/**
 * Validates and parses Database Connection Configuration strictly from process.env
 * Eliminates silent dev defaults to avoid masquerading missing credentials.
 */
function getDbConfig() {
    const rawServerInput = process.env.DB_SERVER;
    const rawUserInput = process.env.DB_USER;
    const rawPasswordInput = process.env.DB_PASSWORD;
    const rawDbInput = process.env.DB_NAME;
    const rawPortInput = process.env.DB_PORT;

    // Report configuration omissions explicitly
    const missingKeys = [];
    if (!rawServerInput) missingKeys.push('DB_SERVER');
    if (!rawUserInput) missingKeys.push('DB_USER');
    if (!rawPasswordInput) missingKeys.push('DB_PASSWORD');
    if (!rawDbInput) missingKeys.push('DB_NAME');

    if (missingKeys.length > 0) {
        console.error(`⚠️ [MSSQL Config Warning] Missing critical database parameters in .env: [${missingKeys.join(', ')}]`);
        console.error(`   Please check 'backend/.env' and configure all required parameters.`);
    }

    let rawServer = (rawServerInput || '127.0.0.1').trim();
    let instanceName = null;
    let explicitPort = rawPortInput ? parseInt(rawPortInput, 10) : undefined;

    // Handle backslashes in instance names e.g. ".\SQLEXPRESS", "localhost\SQLEXPRESS", "127.0.0.1\SQLEXPRESS"
    if (rawServer.includes('\\')) {
        const parts = rawServer.split('\\');
        rawServer = parts[0].trim();
        instanceName = parts[1].trim();
    }

    // Replace Windows local machine aliases with loopback IP to avoid DNS resolution failure
    if (rawServer === '.' || rawServer === '(local)' || rawServer.toLowerCase() === 'localhost') {
        rawServer = '127.0.0.1';
    }

    const config = {
        user: rawUserInput || '',
        password: rawPasswordInput || '',
        server: rawServer,
        database: rawDbInput || 'TRB_PreOrder_DB',
        requestTimeout: 120000,
        connectionTimeout: 30000,
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: true,
            enableArithAbort: true,
            cryptoCredentialsDetails: {
                minVersion: 'TLSv1'
            }
        },
        pool: {
            max: 25,
            min: 2,
            idleTimeoutMillis: 30000
        }
    };

    if (instanceName) {
        config.options.instanceName = instanceName;
        // When connecting to a named instance (like SQLEXPRESS), SQL Server uses dynamic ports.
        // Only set static port if explicitly configured to a non-standard port other than 1433.
        if (explicitPort && explicitPort !== 1433) {
            config.port = explicitPort;
        }
    } else {
        config.port = explicitPort || 1433;
    }

    return config;
}

/**
 * Diagnoses SQL Server errors and returns pinpoint human-readable causes and fixes
 */
function diagnoseDbError(err, config) {
    const msg = (err && err.message) ? err.message : String(err);
    const code = (err && err.code) ? err.code : '';

    if (msg.includes('Login failed for user') || code === 'ELOGIN') {
        return {
            category: 'AUTHENTICATION_FAILED',
            title: 'SQL Server Authentication Failed',
            summary: `Authentication failed for user '${config.user}' on server '${config.server}'.`,
            causes: [
                `The password in 'backend/.env' (DB_PASSWORD) does not match the SQL user's password.`,
                `'Mixed Mode Authentication' (SQL Server and Windows Authentication mode) is NOT enabled in SQL Server.`,
                `The SQL account '${config.user}' is disabled or locked in SQL Server.`
            ],
            fixes: [
                `Open 'backend/.env' in Notepad and verify DB_USER and DB_PASSWORD.`,
                `In SSMS: Right-click Server Name -> Properties -> Security -> Select 'SQL Server and Windows Authentication mode' -> Click OK -> Restart SQL Server service.`,
                `In SSMS: Security -> Logins -> Right-click '${config.user}' -> Properties -> Status -> Set 'Login: Enabled' and uncheck 'Enforce password expiration'.`
            ]
        };
    }

    if (msg.includes('Could not open a connection') || code === 'ESOCKET' || code === 'ECONNREFUSED' || msg.includes('Failed to connect to')) {
        return {
            category: 'TCP_CONNECTION_REFUSED',
            title: 'SQL Server Connection Refused (TCP/IP Closed)',
            summary: `Could not establish a TCP connection to SQL Server at [${config.server}:${config.port || 'Dynamic Instance'}].`,
            causes: [
                `SQL Server Windows Service is NOT running.`,
                `TCP/IP Protocol is DISABLED in SQL Server Configuration Manager (very common in SQL Express).`,
                `If using a named instance (e.g. SQLEXPRESS), 'SQL Server Browser' service is STOPPED.`,
                `Windows Firewall is blocking inbound connections on port 1433 / dynamic ports.`
            ],
            fixes: [
                `Open 'services.msc' -> Ensure 'SQL Server (MSSQLSERVER)' or 'SQL Server (SQLEXPRESS)' status is 'Running'.`,
                `Open 'SQL Server Configuration Manager' -> SQL Server Network Configuration -> Protocols for SQLEXPRESS -> Double-click 'TCP/IP' -> Set 'Enabled: Yes' -> Restart SQL Server service.`,
                `If using SQLEXPRESS: In 'services.msc' -> Start 'SQL Server Browser' service and set Startup Type to 'Automatic'.`,
                `Verify Windows Firewall allows inbound TCP traffic on port 1433.`
            ]
        };
    }

    if (msg.includes('timeout') || code === 'ETIMEOUT') {
        return {
            category: 'CONNECTION_TIMEOUT',
            title: 'SQL Server Connection Timed Out',
            summary: `The connection attempt to [${config.server}] timed out after 30 seconds.`,
            causes: [
                `The server IP address or hostname '${config.server}' is unreachable or firewalled.`,
                `For SQLEXPRESS instance, 'SQL Server Browser' service is not running to resolve the dynamic port.`
            ],
            fixes: [
                `Verify the server IP or host in 'backend/.env' (DB_SERVER). Use '127.0.0.1' for local server.`,
                `Start the 'SQL Server Browser' service in Windows Services (services.msc).`
            ]
        };
    }

    if (msg.includes('Cannot open database') || msg.includes('does not exist')) {
        return {
            category: 'DATABASE_NOT_FOUND',
            title: 'Target Database Not Found',
            summary: `Database '${config.database}' was not found on SQL Server instance [${config.server}].`,
            causes: [
                `The database schema has not been deployed yet.`,
                `The database name in DB_NAME has a typo.`
            ],
            fixes: [
                `Run 'database/setup_database.bat' to create [${config.database}] with all required tables automatically.`,
                `Open SSMS and verify that [${config.database}] is listed under Databases.`
            ]
        };
    }

    return {
        category: 'GENERAL_ERROR',
        title: 'SQL Connection Error',
        summary: msg,
        causes: ['An unexpected error occurred during database pool initialization.'],
        fixes: ['Review the full stack trace and verify network and credentials.']
    };
}

let poolPromise = null;

/**
 * Get or initialize the singleton MSSQL Connection Pool
 */
async function getPool() {
    if (!poolPromise) {
        const activeConfig = getDbConfig();
        const serverDisplay = activeConfig.options.instanceName
            ? `${activeConfig.server}\\${activeConfig.options.instanceName}`
            : `${activeConfig.server}:${activeConfig.port || 1433}`;

        console.log(`🔌 [MSSQL Connect] Attempting connection to: [${serverDisplay}] | Database: "${activeConfig.database}" | User: "${activeConfig.user}"`);
        
        lastConnectionDiagnostics.status = 'connecting';
        lastConnectionDiagnostics.timestamp = new Date().toISOString();
        lastConnectionDiagnostics.config = {
            server: activeConfig.server,
            instance: activeConfig.options.instanceName || null,
            port: activeConfig.port || 'Dynamic',
            database: activeConfig.database,
            user: activeConfig.user
        };

        poolPromise = new sql.ConnectionPool(activeConfig)
            .connect()
            .then(pool => {
                console.log(`====================================================`);
                console.log(`✅ [MSSQL Pool] CONNECTED SUCCESSFULLY!`);
                console.log(`   Database : ${activeConfig.database}`);
                console.log(`   Server   : ${serverDisplay}`);
                console.log(`   User     : ${activeConfig.user}`);
                console.log(`====================================================`);
                
                lastConnectionDiagnostics.status = 'connected';
                lastConnectionDiagnostics.error = null;
                lastConnectionDiagnostics.diagnosis = null;
                return pool;
            })
            .catch(err => {
                const diagnosis = diagnoseDbError(err, activeConfig);

                console.error(`================================================================================`);
                console.error(`❌ [DATABASE ERROR] ${diagnosis.title.toUpperCase()}`);
                console.error(`--------------------------------------------------------------------------------`);
                console.error(`Target:   ${serverDisplay} | Database: "${activeConfig.database}" | User: "${activeConfig.user}"`);
                console.error(`Summary:  ${diagnosis.summary}`);
                console.error(`Raw Msg:  ${err.message}`);
                console.error(`--------------------------------------------------------------------------------`);
                console.error(`Probable Causes:`);
                diagnosis.causes.forEach((c, idx) => console.error(`  ${idx + 1}. ${c}`));
                console.error(`--------------------------------------------------------------------------------`);
                console.error(`How to Fix:`);
                diagnosis.fixes.forEach((f, idx) => console.error(`  👉 ${f}`));
                console.error(`================================================================================`);

                lastConnectionDiagnostics.status = 'failed';
                lastConnectionDiagnostics.error = err.message;
                lastConnectionDiagnostics.diagnosis = diagnosis;

                poolPromise = null; // Reset so subsequent queries attempt reconnection
                throw err;
            });
    }
    return poolPromise;
}

/**
 * Execute parameterized query safely
 * @param {string} queryText - T-SQL query
 * @param {Array<{name: string, type: any, value: any}>} params - Input parameters
 */
async function executeQuery(queryText, params = []) {
    const pool = await getPool();
    const request = pool.request();

    if (Array.isArray(params)) {
        params.forEach(param => {
            request.input(param.name, param.type, param.value);
        });
    }

    return await request.query(queryText);
}

module.exports = {
    sql,
    getDbConfig,
    getPool,
    executeQuery,
    diagnoseDbError,
    getLastDiagnostics: () => lastConnectionDiagnostics
};
