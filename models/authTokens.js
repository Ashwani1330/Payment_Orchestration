// const {sql} = require("../config/db");

// const AuthToken = {};

// AuthToken.create = async (userId, token, expiresAt) => {
//     await sql.query`
//     INSERT INTO auth_tokens(UniqueId, userId, token, createdAt, expiresAt)
//     VALUES (NEW(), ${userId}, ${token}, GETDATE(), ${expiresAt})
//     `;
// };

// AuthToken.create = async(token) => {
//     const result = await sql.query`SELECT * FROM auth_tokens WHERE token = ${token}`;
//     return result.recordset[0];
// };

// module.exports = AuthToken;

const { sql } = require("../config/db");

const AuthToken = {};

// Create a new auth token
AuthToken.create = async (UniqueId, userId, token, expiresAt) => {
    try {
        await sql.query`
        INSERT INTO auth_tokens (UniqueId, userId, token, createdAt, expiresAt)
        VALUES (${UniqueId}, ${userId}, ${token}, GETDATE(), ${expiresAt})
        `;
    } catch (error) {
        console.error("Error creating auth token:", error);
        throw new Error("Database error");
    }
};

// Find an auth token by the token string
AuthToken.findByToken = async (token) => {  // Renamed from 'create' to 'findByToken'
    try {
        const result = await sql.query`
        SELECT * FROM auth_tokens WHERE token = ${token}
        `;
        return result.recordset[0];
    } catch (error) {
        console.error("Error fetching auth token:", error);
        throw new Error("Database error");
    }
};

module.exports = AuthToken;