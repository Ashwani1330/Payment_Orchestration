const sql = require("../config/db");
const { promisify } = require('util');

const query = promisify(sql.query).bind(sql);

const AuthToken = {};

// Helper function to format date as YYYY-MM-DD HH:MM:SS
function formatDate(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Create a new auth token
AuthToken.create = async (UniqueId, userId, token, expiresAt) => {
    try {
        await query(`
        INSERT INTO auth_tokens (UniqueId, userId, token, createdAt, expiresAt)
        VALUES ('${UniqueId}', '${userId}', '${token}', NOW(), '${formatDate(expiresAt)}')
        ON DUPLICATE KEY UPDATE
        token = VALUES(token), createdAt = VALUES(createdAt), expiresAt = VALUES(expiresAt)
        `);
    } catch (error) {
        console.error("Error creating auth token:", error);
        throw new Error("Database error");
    }
};

AuthToken.findByToken = async (token) => {
    try {
        const result = await query(`
            SELECT * FROM auth_tokens WHERE token = ?
        `, [token]);
        
        return result[0];
    } catch (error) {
        console.error("Error fetching auth token:", error);
        throw new Error("Database error");
    }
};


module.exports = AuthToken;