const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'trb_super_secure_jwt_secret_key_colombo_2026_royal_bakery';

/**
 * High Security JWT Authentication Guard Middleware
 * Validates bearer token and populates req.user
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <TOKEN>

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required. Please log in to your counter session.'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            const isExpired = err.name === 'TokenExpiredError';
            return res.status(403).json({
                success: false,
                error: isExpired ? 'Session expired. Please log in again.' : 'Invalid session token.',
                is_expired: isExpired
            });
        }

        req.user = decodedUser;
        next();
    });
}

/**
 * Role-Based Access Control (RBAC) Guard
 * @param {Array<string>} allowedRoles e.g. ['Admin', 'Supervisor']
 */
function requireRole(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized.' });
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.user_role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`
            });
        }

        next();
    };
}

module.exports = {
    JWT_SECRET,
    authenticateToken,
    requireRole
};

