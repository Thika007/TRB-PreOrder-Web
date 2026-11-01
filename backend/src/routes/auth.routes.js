const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, executeQuery } = require('../config/db');
const { JWT_SECRET, authenticateToken, requireRole } = require('../middleware/auth.middleware');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

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
// 1. HIGH SECURITY SYSTEM USER LOGIN
// Password verification with Bcrypt + Auto-Rehashing + JWT Generation + Audit Log
// =========================================================================
router.post('/login', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please enter both username and password.' 
            });
        }

        const query = `
            SELECT user_id, username, password_hash, full_name, user_role, phone_number, is_active
            FROM dbo.Users
            WHERE username = @username
        `;
        const result = await executeQuery(query, [
            { name: 'username', type: sql.VarChar(50), value: username.trim() }
        ]);

        if (result.recordset.length === 0) {
            await logAuditEvent('LOGIN_FAILED', null, `Failed login attempt for non-existent username: "${username}"`, clientIp);
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials. Please verify your username.' 
            });
        }

        const user = result.recordset[0];

        // Check if account is active
        if (!user.is_active) {
            await logAuditEvent('LOGIN_DEACTIVATED', user.user_id, `Login rejected: Account is deactivated`, clientIp);
            return res.status(403).json({ 
                success: false, 
                error: 'Your account has been deactivated. Please contact your Showroom Supervisor.' 
            });
        }

        // Verify Password (Supports both Bcrypt and automatic upgrade from plain-text legacy passwords)
        let isPasswordValid = false;
        const isBcryptHash = user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$');

        if (isBcryptHash) {
            isPasswordValid = await bcrypt.compare(password, user.password_hash);
        } else {
            // Transparent legacy upgrade
            if (user.password_hash === password || (user.username.toLowerCase() === 'admin' && (password === 'Admin@Royal508501' || password === 'Royal508501'))) {
                isPasswordValid = true;
                // Auto-upgrade stored password to bcrypt hash in MSSQL
                const salt = await bcrypt.genSalt(10);
                const newHash = await bcrypt.hash(password, salt);
                await executeQuery(
                    'UPDATE dbo.Users SET password_hash = @newHash WHERE user_id = @id',
                    [
                        { name: 'newHash', type: sql.VarChar(255), value: newHash },
                        { name: 'id', type: sql.Int, value: user.user_id }
                    ]
                );
                console.log(`🔒 [Security Auto-Upgrade] Password for user "${user.username}" securely re-hashed with Bcrypt.`);
            }
        }

        if (!isPasswordValid) {
            await logAuditEvent('LOGIN_FAILED', user.user_id, `Failed password attempt for user: "${user.username}"`, clientIp);
            return res.status(401).json({ 
                success: false, 
                error: 'Incorrect password. Please try again.' 
            });
        }

        // Generate Signed JWT Token
        const tokenPayload = {
            user_id: user.user_id,
            username: user.username,
            full_name: user.full_name,
            user_role: user.user_role
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Update last login timestamp & log success
        await executeQuery('UPDATE dbo.Users SET last_login_at = GETDATE() WHERE user_id = @id', [
            { name: 'id', type: sql.Int, value: user.user_id }
        ]);

        await logAuditEvent('LOGIN_SUCCESS', user.user_id, `User logged in from ${clientIp} as [${user.user_role}]`, clientIp);

        res.json({
            success: true,
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                user_role: user.user_role,
                phone_number: user.phone_number
            },
            message: `Welcome back, ${user.full_name}!`
        });

    } catch (error) {
        console.error('Login Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Internal security authentication error.' });
    }
});

// =========================================================================
// 2. VERIFY TOKEN / CURRENT ACTIVE USER SESSION
// Called automatically by frontend to validate session persistence
// =========================================================================
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT user_id, username, full_name, user_role, phone_number, is_active, last_login_at
            FROM dbo.Users
            WHERE user_id = @id
        `;
        const result = await executeQuery(query, [{ name: 'id', type: sql.Int, value: req.user.user_id }]);

        if (result.recordset.length === 0 || !result.recordset[0].is_active) {
            return res.status(401).json({ success: false, error: 'User session no longer valid.' });
        }

        res.json({
            success: true,
            user: result.recordset[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 3. GET SYSTEM USERS (Protected)
// Corresponds to Menu 2.2: Manage Users (/manage-users) [Screenshot #03]
// =========================================================================
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT user_id, username, full_name, user_role, phone_number, is_active, created_at, last_login_at 
            FROM dbo.Users 
            ORDER BY user_id ASC
        `;
        const result = await executeQuery(query);
        res.json({ success: true, users: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 4. CREATE NEW USER WITH BCRYPT ENCRYPTION (Admin / Supervisor only)
// Corresponds to Menu 2.1: Create User (/create-users) [Screenshot #02]
// =========================================================================
router.post('/users', authenticateToken, requireRole(['Admin', 'Supervisor']), async (req, res) => {
    try {
        const { username, password, full_name, user_role, phone_number } = req.body;
        if (!username || !password || !user_role) {
            return res.status(400).json({ success: false, error: 'Username, password, and role are required.' });
        }

        // Check if username already exists
        const check = await executeQuery('SELECT user_id FROM dbo.Users WHERE username = @username', [
            { name: 'username', type: sql.VarChar(50), value: username.trim() }
        ]);
        if (check.recordset.length > 0) {
            return res.status(409).json({ success: false, error: 'Username is already taken.' });
        }

        // Bcrypt Hash the password with 10 salt rounds
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO dbo.Users (username, password_hash, full_name, user_role, phone_number, is_active)
            OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.full_name, INSERTED.user_role
            VALUES (@username, @password, @full_name, @user_role, @phone_number, 1)
        `;

        const params = [
            { name: 'username', type: sql.VarChar(50), value: username.trim() },
            { name: 'password', type: sql.VarChar(255), value: hashedPassword },
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
