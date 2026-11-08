const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { sql, executeQuery } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Helper to record audit logs
async function logAuditEvent(actionType, userId, description, ipAddress) {
    try {
        const query = `
            INSERT INTO dbo.AuditLogs (action_type, user_id, description, ip_address, log_time)
            VALUES (@actionType, @userId, @description, @ipAddress, GETDATE())
        `;
        const params = [
            { name: 'actionType', type: sql.VarChar(50), value: actionType },
            { name: 'userId', type: sql.Int, value: userId || null },
            { name: 'description', type: sql.NVarChar(sql.MAX), value: description },
            { name: 'ipAddress', type: sql.VarChar(50), value: ipAddress || '127.0.0.1' }
        ];
        await executeQuery(query, params);
    } catch (err) {
        console.error('Audit Log Error:', err.message);
    }
}

// =========================================================================
// 1. GET ALL SYSTEM USERS
// Corresponds to Menu 2.2: Manage Users (/manage-users)
// =========================================================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                user_id, 
                username, 
                full_name, 
                user_role, 
                phone_number, 
                is_active, 
                created_at, 
                last_login_at 
            FROM dbo.Users 
            ORDER BY user_id ASC
        `;
        const result = await executeQuery(query);
        res.json({
            success: true,
            total: result.recordset.length,
            users: result.recordset
        });
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve system users: ' + error.message });
    }
});

// =========================================================================
// 2. CREATE NEW USER (High Security with Bcrypt & Audit Logging)
// Corresponds to Menu 2.1: Create User (/create-users)
// =========================================================================
router.post('/', authenticateToken, async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    try {
        const { username, password, confirm_password, user_role, full_name, phone_number } = req.body;

        // 1. Validate required fields
        if (!username || !username.trim()) {
            return res.status(400).json({ success: false, error: 'User Name is required.' });
        }
        if (!password) {
            return res.status(400).json({ success: false, error: 'Password is required.' });
        }
        if (!user_role || user_role === 'Select Level') {
            return res.status(400).json({ success: false, error: 'Please select a valid User Type / Level.' });
        }

        // 2. Validate password match if confirm_password is provided
        if (confirm_password !== undefined && password !== confirm_password) {
            return res.status(400).json({ success: false, error: 'Password and Confirm Password do not match.' });
        }

        if (password.length < 4) {
            return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long.' });
        }

        const cleanUsername = username.trim();

        // 3. Check for existing username (Case-insensitive)
        const checkQuery = `SELECT user_id FROM dbo.Users WHERE LOWER(username) = LOWER(@username)`;
        const checkResult = await executeQuery(checkQuery, [
            { name: 'username', type: sql.VarChar(50), value: cleanUsername }
        ]);

        if (checkResult.recordset.length > 0) {
            return res.status(409).json({ 
                success: false, 
                error: `Username "${cleanUsername}" is already taken. Please choose another name.` 
            });
        }

        // 4. Hash password with Bcrypt (10 salt rounds)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Standardize full name
        const displayName = full_name && full_name.trim() ? full_name.trim() : cleanUsername;

        // 5. Insert new user record into dbo.Users
        const insertQuery = `
            INSERT INTO dbo.Users (
                username, 
                password_hash, 
                full_name, 
                user_role, 
                phone_number, 
                is_active, 
                created_at
            )
            OUTPUT 
                INSERTED.user_id, 
                INSERTED.username, 
                INSERTED.full_name, 
                INSERTED.user_role, 
                INSERTED.phone_number, 
                INSERTED.is_active, 
                INSERTED.created_at
            VALUES (
                @username, 
                @password_hash, 
                @full_name, 
                @user_role, 
                @phone_number, 
                1, 
                GETDATE()
            )
        `;

        const params = [
            { name: 'username', type: sql.VarChar(50), value: cleanUsername },
            { name: 'password_hash', type: sql.VarChar(255), value: passwordHash },
            { name: 'full_name', type: sql.NVarChar(100), value: displayName },
            { name: 'user_role', type: sql.VarChar(30), value: user_role },
            { name: 'phone_number', type: sql.VarChar(20), value: phone_number || null }
        ];

        const result = await executeQuery(insertQuery, params);
        const newUser = result.recordset[0];

        // 6. Record security audit log
        await logAuditEvent(
            'USER_CREATED', 
            req.user?.user_id || null, 
            `User "${cleanUsername}" created with role [${user_role}] by ${req.user?.username || 'System'}`, 
            clientIp
        );

        console.log(`✅ [User Management] New user registered: ${cleanUsername} [${user_role}]`);

        res.status(201).json({
            success: true,
            message: `User "${cleanUsername}" successfully created as ${user_role}.`,
            user: newUser
        });

    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ success: false, error: 'Database insertion error: ' + error.message });
    }
});

// =========================================================================
// 3. TOGGLE USER ACTIVE STATUS (Activate / Deactivate)
// =========================================================================
router.put('/:id/status', authenticateToken, requireRole(['Admin', 'Supervisor']), async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const { is_active } = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        // Prevent deactivating own account
        if (req.user?.user_id === userId && !is_active) {
            return res.status(400).json({ success: false, error: 'You cannot deactivate your own administrative account.' });
        }

        const query = `
            UPDATE dbo.Users 
            SET is_active = @is_active 
            WHERE user_id = @id
        `;
        await executeQuery(query, [
            { name: 'is_active', type: sql.Bit, value: is_active ? 1 : 0 },
            { name: 'id', type: sql.Int, value: userId }
        ]);

        res.json({ success: true, message: `User status successfully updated.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 4. DELETE / DEACTIVATE USER
// =========================================================================
router.delete('/:id', authenticateToken, requireRole(['Admin']), async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);

        if (req.user?.user_id === userId) {
            return res.status(400).json({ success: false, error: 'You cannot delete your own administrative account.' });
        }

        // Check if user has associated orders or transactions
        const orderCheck = await executeQuery('SELECT COUNT(*) AS cnt FROM dbo.Orders WHERE created_by_user_id = @id', [
            { name: 'id', type: sql.Int, value: userId }
        ]);

        if (orderCheck.recordset[0].cnt > 0) {
            // Soft delete (deactivate) to preserve audit integrity
            await executeQuery('UPDATE dbo.Users SET is_active = 0 WHERE user_id = @id', [
                { name: 'id', type: sql.Int, value: userId }
            ]);
            return res.json({ 
                success: true, 
                message: 'User has historical counter orders. Account deactivated to preserve financial audit trail.' 
            });
        }

        // Hard delete if no orders placed
        await executeQuery('DELETE FROM dbo.Users WHERE user_id = @id', [
            { name: 'id', type: sql.Int, value: userId }
        ]);

        res.json({ success: true, message: 'User permanently removed.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
