const sql = require('mssql');
require('dotenv').config();

// SQL Server Connection Configuration matching TRB environment standards
const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'sqladmin',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'TRB_PreOrder_DB',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
    requestTimeout: 120000,
    connectionTimeout: 30000,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // false for local, true for Azure
        trustServerCertificate: true,
        enableArithAbort: true,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        }
    },
    pool: {
        max: 25,                        // High throughput for multiple counter terminals
        min: 2,
        idleTimeoutMillis: 30000
    }
};

let poolPromise = null;

/**
 * Get or initialize the singleton MSSQL Connection Pool
 */
async function getPool() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(dbConfig)
            .connect()
            .then(pool => {
                console.log(`✅ [MSSQL Pool] Connected successfully to database: "${dbConfig.database}" on [${dbConfig.server}] as [${dbConfig.user}]`);
                return pool;
            })
            .catch(err => {
                console.error(`❌ [MSSQL Pool] Database connection failed to [${dbConfig.server}]:`, err.message);
                poolPromise = null; // Reset so next query attempt can retry
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
    dbConfig,
    getPool,
    executeQuery
};
