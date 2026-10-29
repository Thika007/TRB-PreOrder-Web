const { getPool, executeQuery } = require('./config/db');

async function testConnection() {
    console.log('🔄 Attempting to connect to Microsoft SQL Server...');
    try {
        const pool = await getPool();
        const res = await pool.request().query('SELECT @@SERVERNAME AS server_name, DB_NAME() AS current_db, GETDATE() AS db_time');
        console.log('✅ Connection SUCCESSFUL!');
        console.log('📊 Server Info:', res.recordset[0]);
    } catch (err) {
        console.error('❌ Connection Failed with error:');
        console.error('   ', err.message);
        console.log('\n💡 Tip: Check backend/.env to ensure DB_SERVER, DB_USER, DB_PASSWORD, and DB_NAME match your local SQL Server instance.');
    } finally {
        process.exit(0);
    }
}

testConnection();

