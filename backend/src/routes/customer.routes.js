const express = require('express');
const router = express.Router();
const { sql, executeQuery } = require('../config/db');

// =========================================================================
// 1. FAST COUNTER SEARCH (Sub-15ms Phone / Name Autocomplete)
// Matches Counter Order Intake search (/add-order)
// =========================================================================
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q ? req.query.q.trim() : '';
        if (!query || query.length < 2) {
            return res.json({ success: true, customers: [] });
        }

        const sqlQuery = `
            SELECT TOP 15 
                customer_id, 
                title, 
                first_name, 
                last_name, 
                mobile, 
                landline, 
                delivery_address, 
                email, 
                city
            FROM dbo.Customers
            WHERE mobile LIKE @searchParam + '%' 
               OR mobile LIKE '%' + @searchParam + '%'
               OR first_name LIKE @searchParam + '%'
            ORDER BY customer_id DESC
        `;

        const params = [
            { name: 'searchParam', type: sql.NVarChar(100), value: query }
        ];

        const result = await executeQuery(sqlQuery, params);
        res.json({
            success: true,
            count: result.recordset.length,
            customers: result.recordset
        });
    } catch (error) {
        console.error('Customer Search Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 2. GET ALL CUSTOMERS (Paginated)
// Matches Menu 2.6: Customer List (/customer_list) [Screenshot #07]
// =========================================================================
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const offset = (page - 1) * limit;
        const search = req.query.search ? req.query.search.trim() : '';

        let whereClause = '';
        const params = [
            { name: 'offset', type: sql.Int, value: offset },
            { name: 'limit', type: sql.Int, value: limit }
        ];

        if (search) {
            whereClause = `WHERE mobile LIKE @search + '%' OR first_name LIKE @search + '%' OR delivery_address LIKE '%' + @search + '%'`;
            params.push({ name: 'search', type: sql.NVarChar(100), value: search });
        }

        const dataQuery = `
            SELECT 
                customer_id, 
                title, 
                first_name, 
                last_name, 
                mobile, 
                landline, 
                delivery_address, 
                email, 
                created_at
            FROM dbo.Customers
            ${whereClause}
            ORDER BY customer_id DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

            SELECT COUNT(*) AS total_count FROM dbo.Customers ${whereClause};
        `;

        const result = await executeQuery(dataQuery, params);
        const customers = result.recordsets[0];
        const totalCount = result.recordsets[1][0].total_count;

        res.json({
            success: true,
            total: totalCount,
            page,
            limit,
            customers
        });
    } catch (error) {
        console.error('Customer List Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 3. CREATE / QUICK ADD CUSTOMER
// Used both in /customer_list and inline within /add-order modal
// =========================================================================
router.post('/', async (req, res) => {
    try {
        const { title, first_name, last_name, mobile, landline, delivery_address, email, notes } = req.body;

        if (!first_name || !mobile) {
            return res.status(400).json({ success: false, error: 'First Name and Mobile number are required.' });
        }

        // Check if customer with same mobile already exists
        const checkQuery = `SELECT customer_id, first_name, mobile FROM dbo.Customers WHERE mobile = @mobile`;
        const checkRes = await executeQuery(checkQuery, [{ name: 'mobile', type: sql.VarChar(20), value: mobile.trim() }]);

        if (checkRes.recordset.length > 0) {
            return res.status(409).json({
                success: false,
                is_duplicate: true,
                message: 'Customer with this mobile number already exists.',
                existing_customer: checkRes.recordset[0]
            });
        }

        const insertQuery = `
            INSERT INTO dbo.Customers (title, first_name, last_name, mobile, landline, delivery_address, email, notes)
            OUTPUT INSERTED.customer_id, INSERTED.first_name, INSERTED.mobile
            VALUES (@title, @first_name, @last_name, @mobile, @landline, @delivery_address, @email, @notes)
        `;

        const params = [
            { name: 'title', type: sql.VarChar(10), value: title || 'Mr' },
            { name: 'first_name', type: sql.NVarChar(100), value: first_name.trim() },
            { name: 'last_name', type: sql.NVarChar(100), value: last_name ? last_name.trim() : null },
            { name: 'mobile', type: sql.VarChar(20), value: mobile.trim() },
            { name: 'landline', type: sql.VarChar(20), value: landline ? landline.trim() : null },
            { name: 'delivery_address', type: sql.NVarChar(500), value: delivery_address || null },
            { name: 'email', type: sql.VarChar(100), value: email || null },
            { name: 'notes', type: sql.NVarChar(500), value: notes || null }
        ];

        const insertRes = await executeQuery(insertQuery, params);
        res.status(201).json({
            success: true,
            customer: insertRes.recordset[0]
        });
    } catch (error) {
        console.error('Create Customer Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

