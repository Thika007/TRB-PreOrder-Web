const express = require('express');
const router = express.Router();
const { sql, executeQuery } = require('../config/db');

// =========================================================================
// 1. CHEF PRODUCTION DAILY WORKSHEET
// Corresponds to Menu 4: Chef Reports (/reports_cheff - "Order Reports") [Screenshot #13]
// =========================================================================
router.get('/chef-worksheet', async (req, res) => {
    try {
        const { date, chef } = req.query;
        let query = `
            SELECT * 
            FROM dbo.vw_ChefProductionWorksheet
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            query += ` AND delivery_date = @date`;
            params.push({ name: 'date', type: sql.Date, value: date });
        } else {
            // Default to today and upcoming
            query += ` AND delivery_date >= CAST(GETDATE() AS DATE)`;
        }

        if (chef && chef !== 'All') {
            query += ` AND assigned_chef = @chef`;
            params.push({ name: 'chef', type: sql.NVarChar(100), value: chef });
        }

        query += ` ORDER BY delivery_date ASC, delivery_time ASC`;
        const result = await executeQuery(query, params);

        res.json({
            success: true,
            count: result.recordset.length,
            worksheet: result.recordset
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 2. TODAY'S DELIVERY & COLLECTION DISPATCH SHEET
// Corresponds to Menu 5: Delivery (/delivery - "Today's Delivery Reports") [Screenshot #21]
// =========================================================================
router.get('/delivery-sheet', async (req, res) => {
    try {
        const { date = new Date().toISOString().slice(0, 10), type } = req.query;
        let query = `
            SELECT * 
            FROM dbo.vw_TodayDeliverySheet
            WHERE delivery_date = @date
        `;
        const params = [{ name: 'date', type: sql.Date, value: date }];

        if (type && type !== 'All') {
            query += ` AND delivery_type = @type`;
            params.push({ name: 'type', type: sql.VarChar(30), value: type });
        }

        query += ` ORDER BY delivery_time ASC`;
        const result = await executeQuery(query, params);

        res.json({
            success: true,
            date,
            count: result.recordset.length,
            deliveries: result.recordset
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 3. UPDATE KITCHEN PRODUCTION STATUS
// =========================================================================
router.put('/status/:productionId', async (req, res) => {
    try {
        const { productionId } = req.params;
        const { status, remarks } = req.body; // 'Queued', 'In Oven', 'Decorating', 'Finished'

        const updateQuery = `
            UPDATE dbo.KitchenProduction
            SET production_status = @status,
                remarks = @remarks,
                completed_at = CASE WHEN @status = 'Finished' THEN GETDATE() ELSE completed_at END
            WHERE production_id = @productionId
        `;

        const params = [
            { name: 'productionId', type: sql.Int, value: productionId },
            { name: 'status', type: sql.VarChar(30), value: status },
            { name: 'remarks', type: sql.NVarChar(500), value: remarks || null }
        ];

        await executeQuery(updateQuery, params);
        res.json({ success: true, message: `Kitchen item updated to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

