const express = require('express');
const router = express.Router();
const { sql, executeQuery } = require('../config/db');

// =========================================================================
// 1. GET ALL GREETINGS
// =========================================================================
router.get('/', async (req, res) => {
    try {
        const result = await executeQuery(`
            SELECT greeting_id, greeting_text, is_active, created_at
            FROM dbo.Greetings
            WHERE is_active = 1
            ORDER BY greeting_id ASC
        `);
        res.json({
            success: true,
            greetings: result.recordset
        });
    } catch (error) {
        console.error('Fetch Greetings Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 2. ADD NEW GREETING VALUE
// =========================================================================
router.post('/', async (req, res) => {
    try {
        const { greeting_text } = req.body;
        const text = greeting_text ? greeting_text.trim() : '';

        if (!text) {
            return res.status(400).json({ success: false, error: 'Greeting text is required.' });
        }

        // Check duplicate (case-insensitive)
        const check = await executeQuery(
            'SELECT greeting_id, greeting_text, is_active FROM dbo.Greetings WHERE LOWER(greeting_text) = LOWER(@text)',
            [{ name: 'text', type: sql.NVarChar(150), value: text }]
        );

        if (check.recordset.length > 0) {
            const existing = check.recordset[0];
            if (!existing.is_active) {
                await executeQuery(
                    'UPDATE dbo.Greetings SET is_active = 1 WHERE greeting_id = @id',
                    [{ name: 'id', type: sql.Int, value: existing.greeting_id }]
                );
                return res.status(200).json({
                    success: true,
                    greeting: { greeting_id: existing.greeting_id, greeting_text: existing.greeting_text, is_active: 1 }
                });
            }
            return res.status(409).json({
                success: false,
                error: 'This greeting already exists in the list.'
            });
        }

        const insertRes = await executeQuery(
            `INSERT INTO dbo.Greetings (greeting_text, is_active, created_at)
             OUTPUT INSERTED.greeting_id, INSERTED.greeting_text, INSERTED.is_active
             VALUES (@text, 1, GETDATE())`,
            [{ name: 'text', type: sql.NVarChar(150), value: text }]
        );

        res.status(201).json({
            success: true,
            greeting: insertRes.recordset[0]
        });
    } catch (error) {
        console.error('Create Greeting Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 3. DELETE / DEACTIVATE GREETING VALUE
// =========================================================================
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Invalid greeting ID.' });
        }

        await executeQuery(
            'DELETE FROM dbo.Greetings WHERE greeting_id = @id',
            [{ name: 'id', type: sql.Int, value: id }]
        );

        res.json({ success: true, message: 'Greeting removed successfully.' });
    } catch (error) {
        console.error('Delete Greeting Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
