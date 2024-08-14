const { sql } = require("../config/db");

const User = {};

User.findbyEmail = async (email) => {
    const result = await sql.query`SELECT * FROM USERS WHERE email = ${email}`;
    return result.recordset[0];
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
    const result = await sql.query('SELECT MAX(id) AS max_id FROM users');
    const maxId = result[0].max_id || 0; // If there are no users, maxId will be null, so default to 0

    // Generate the new ID by incrementing the maximum ID
    const newId = maxId + 1;


    await sql.query(
        'INSERT INTO users (id, email, password, username) VALUES (?, ?, ?, ?)',
        [newId, email, password, username]
    );


    return newId;
};

module.exports = User;
