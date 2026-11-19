require('./config/envLoader');
const express = require('express');
const cors = require('cors');
const { getPool, executeQuery, getLastDiagnostics } = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const kitchenRoutes = require('./routes/kitchen.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ========================================================
// SERVE STATIC PRODUCTION FRONTEND (dist) & SPA ROUTING
// ========================================================
const path = require('path');
const fs = require('fs');

const exeDir = path.dirname(process.execPath);
const cwd = process.cwd();

const distCandidates = [
    path.join(exeDir, '../dist'),
    path.join(exeDir, 'dist'),
    path.join(cwd, 'dist'),
    path.join(cwd, '../dist'),
    path.join(__dirname, '../../dist'),
    path.join(__dirname, '../dist'),
    path.join(__dirname, '../../frontend/dist'),
    path.join(__dirname, '../../Client_Delivery/dist')
];

let activeDistPath = null;
for (const dPath of distCandidates) {
    if (fs.existsSync(dPath) && fs.existsSync(path.join(dPath, 'index.html'))) {
        activeDistPath = path.resolve(dPath);
        console.log(`📦 [TRB POS] Serving static production build from: ${activeDistPath}`);
        app.use(express.static(activeDistPath));
        break;
    }
}

// ========================================================
// HEALTH CHECK & DATABASE CONNECTIVITY TEST ROUTE
// ========================================================
app.get('/api/health', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT 
                GETDATE() AS server_time,
                DB_NAME() AS current_database,
                @@VERSION AS sql_server_version
        `);
        
        res.status(200).json({
            status: 'online',
            service: 'The Royal Bakery Pre-Order System Backend API',
            database_status: 'Connected',
            db_info: result.recordset[0],
            diagnostics: getLastDiagnostics()
        });
    } catch (error) {
        res.status(500).json({
            status: 'degraded',
            service: 'The Royal Bakery Pre-Order System Backend API',
            database_status: 'Disconnected',
            error: error.message,
            diagnostics: getLastDiagnostics()
        });
    }
});

// ========================================================
// SPA WILDCARD ROUTING / FALLBACK
// ========================================================
if (activeDistPath) {
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API endpoint not found', path: req.path });
        }
        res.sendFile(path.join(activeDistPath, 'index.html'));
    });
} else {
    console.warn('⚠️ [TRB POS] Frontend dist folder not found. Running in API-only mode.');
    app.get('/', (req, res) => {
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>The Royal Bakery - POS Server</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 60px 20px; background: #faf9f6; color: #333; }
                    .card { max-width: 550px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 5px solid #d97706; }
                    h1 { color: #800020; margin-bottom: 8px; font-size: 24px; }
                    .badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-bottom: 20px; }
                    a { color: #d97706; text-decoration: none; font-weight: 600; }
                    p { font-size: 14px; line-height: 1.6; color: #666; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>THE ROYAL BAKERY (EST. 1906)</h1>
                    <div class="badge">● Backend API Server Running</div>
                    <p>The backend API is online and responding on port <strong>${PORT}</strong>.</p>
                    <p><a href="/api/health" target="_blank">View Live Database Health Status (/api/health) ➔</a></p>
                    <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
                    <p style="color:#b45309; font-size:13px;">
                        <strong>Frontend Web UI Notice:</strong><br/>
                        The production 'dist' folder was not detected next to the backend folder.
                        Please ensure the <code>dist/</code> folder is located next to <code>backend/</code>.
                    </p>
                </div>
            </body>
            </html>
        `);
    });
}

// ========================================================
// CLI DIAGNOSTIC MODE (--test-db)
// ========================================================
if (process.argv.includes('--test-db')) {
    console.log(`====================================================`);
    console.log(`🔍 [DIAGNOSTIC TEST] Testing SQL Server Connection...`);
    console.log(`====================================================`);
    (async () => {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                SELECT 
                    GETDATE() AS server_time,
                    DB_NAME() AS current_database,
                    @@VERSION AS sql_server_version
            `);
            const row = result.recordset[0];
            console.log(`\n================================================================================`);
            console.log(`🎉 [TEST PASSED] DATABASE CONNECTION IS 100% SUCCESSFUL!`);
            console.log(`--------------------------------------------------------------------------------`);
            console.log(`   Connected Database : ${row.current_database}`);
            console.log(`   SQL Server Version : ${row.sql_server_version.split('\n')[0]}`);
            console.log(`   Server Timestamp   : ${row.server_time}`);
            console.log(`================================================================================`);
            console.log(`✅ System is fully ready to process pre-orders, kitchen sheets, and bills.`);
            process.exit(0);
        } catch (err) {
            console.error(`\n❌ [TEST FAILED] Could not establish connection to SQL Server.`);
            console.error(`   Please review the troubleshooting steps printed above.`);
            process.exit(1);
        }
    })();
    return;
}

// ========================================================
// START SERVER
// ========================================================
app.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(`🚀 [TRB Backend API] Running on http://localhost:${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Customers API: http://localhost:${PORT}/api/customers`);
    console.log(`   Products API: http://localhost:${PORT}/api/products`);
    console.log(`   Orders API: http://localhost:${PORT}/api/orders`);
    console.log(`   Kitchen API: http://localhost:${PORT}/api/kitchen/chef-worksheet`);
    console.log(`====================================================`);
    
    try {
        await getPool();
    } catch (err) {
        console.warn('⚠️ Initial DB connect failed. Server will retry when requests arrive.');
    }
});

module.exports = app;
