const sql = require("../config/db");
const { promisify } = require('util');
const moment = require('moment-timezone');

const query = promisify(sql.query).bind(sql);

const AuthToken = {};

// Helper function to format date as YYYY-MM-DD HH:MM:SS
function formatDate(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Create a new auth token
AuthToken.create = async (UniqueId, userId, token, expiresAt) => {
    try {
        const createdAt = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');  // Current timestamp in IST

        await query(`
        INSERT INTO auth_tokens (UniqueId, userId, token, createdAt, expiresAt)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        token = VALUES(token), createdAt = VALUES(createdAt), expiresAt = VALUES(expiresAt)
        `, [UniqueId, userId, token, createdAt, expiresAt]);
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

AuthToken.removeToken = async (token) => {
    try {
        await query(
            `DELETE FROM auth_tokens WHERE token = ?`,
            [token]
        );
    } catch (error) {
        console.error("Error removing token:", error);
        throw new Error("Database error during token removal");
    }
};

AuthToken.removeExpiredTokens = async (userId) => {
    try {
        await query(`
            DELETE FROM auth_tokens 
            WHERE userId = ? AND expiresAt < NOW()
        `, [userId]);
    } catch (error) {
        console.error("Error removing expired tokens:", error);
        throw new Error("Token cleanup failed");
    }
};

module.exports = AuthToken;