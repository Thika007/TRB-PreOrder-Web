const express = require('express');
const router = express.Router();
const { sql, executeQuery } = require('../config/db');

// =========================================================================
// 1. SYSTEM USER LOGIN
// Corresponds to Menu 1: User Login (/index)
// =========================================================================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required.' });
        }

        const query = `
            SELECT user_id, username, password_hash, full_name, user_role, is_active
            FROM dbo.Users
            WHERE username = @username
        `;
        const result = await executeQuery(query, [{ name: 'username', type: sql.VarChar(50), value: username.trim() }]);

        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid username or password.' });
        }

        const user = result.recordset[0];
        if (!user.is_active) {
            return res.status(403).json({ success: false, error: 'User account is deactivated. Contact Admin.' });
        }

        // Verify password
        if (user.password_hash !== password) {
            return res.status(401).json({ success: false, error: 'Invalid username or password.' });
        }

        // Update last login timestamp
        await executeQuery('UPDATE dbo.Users SET last_login_at = GETDATE() WHERE user_id = @id', [
            { name: 'id', type: sql.Int, value: user.user_id }
        ]);

        res.json({
            success: true,
            user: {
                user_id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                user_role: user.user_role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 2. GET SYSTEM USERS
// Corresponds to Menu 2.2: Manage Users (/manage-users) [Screenshot #03]
// =========================================================================
router.get('/users', async (req, res) => {
    try {
        const query = `SELECT user_id, username, full_name, user_role, phone_number, is_active, created_at, last_login_at FROM dbo.Users ORDER BY user_id ASC`;
        const result = await executeQuery(query);
        res.json({ success: true, users: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 3. CREATE SYSTEM USER
// Corresponds to Menu 2.1: Create User (/create-users) [Screenshot #02]
// =========================================================================
router.post('/users', async (req, res) => {
    try {
        const { username, password, full_name, user_role, phone_number } = req.body;
        if (!username || !password || !user_role) {
            return res.status(400).json({ success: false, error: 'Username, password, and user role are required.' });
        }

        const query = `
            INSERT INTO dbo.Users (username, password_hash, full_name, user_role, phone_number, is_active)
            OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.user_role
            VALUES (@username, @password, @full_name, @user_role, @phone_number, 1)
        `;

        const params = [
            { name: 'username', type: sql.VarChar(50), value: username.trim() },
            { name: 'password', type: sql.VarChar(255), value: password },
            { name: 'full_name', type: sql.NVarChar(100), value: full_name || username },
            { name: 'user_role', type: sql.VarChar(30), value: user_role },
            { name: 'phone_number', type: sql.VarChar(20), value: phone_number || null }
        ];

        const result = await executeQuery(query, params);
        res.status(201).json({ success: true, user: result.recordset[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

