const sql = require("../config/db");
const { promisify } = require('util');

// Convert query to use promises
const query = promisify(sql.query).bind(sql);

const User = {};


// User.findbyEmail = async (email) => {
//     console.log('hello')
//     const result = await sql.query(`SELECT * FROM USERS WHERE email = '${email}'`);
//     console.log('hi');
//     if (result === null) {
//         return 0;
//     } else {
//         return result.recordset[0];
//     }
// };



User.findbyEmail = async (email) => {
    console.log('hello');
    try {
        console.log(`SELECT * FROM USERS WHERE email = '${email}'`);
        const rows = await query(`SELECT * FROM USERS WHERE email = '${email}'`);
        console.log('hi');
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
};

// INSERT INTO USERS (id, username, password, email)

User.create = async (userDetails) => {

    const { email, password, username } = userDetails;

    /*
    const result = await sql.query`
    INSERT INTO USERS (id, password, email, created_at)
    VALUES (NEWID(), ${username}, ${password}, ${email}, GETDATE())
    SELECT SCOPE_IDENTITY() as id;
    `; */

    // Fetch the maximum current ID from the users table
    try {
        const result1 = await query('SELECT MAX(id) AS max_id FROM users');
        const maxId = result1[0].max_id || 0; // If there are no users, maxId will be null, so default to 0
        console.log(maxId);

        // Generate the new ID by incrementing the maximum ID
        const newId = maxId + 1;

        const result = await query(
            `INSERT INTO users (id, email, password, username) VALUES ('${newId}', '${email}', '${password}', '${username}')`
            // [newId, email, password, username]
        );

        return newId;

    } catch (err) {
        return res.error("Error creating user:", err); 
    }
};

module.exports = User;
