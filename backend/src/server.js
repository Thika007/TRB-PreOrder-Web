const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getPool, executeQuery } = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const kitchenRoutes = require('./routes/kitchen.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kitchen', kitchenRoutes);

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
            db_info: result.recordset[0]
        });
    } catch (error) {
        res.status(500).json({
            status: 'degraded',
            database_status: 'Disconnected',
            error: error.message
        });
    }
});

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
