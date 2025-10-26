const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// --- Configure your DB Connection ---
const dbConfig = {
    host: '127.0.0.1', // Or 'localhost'
    user: 'root',
    password: '1007031029M', // Your MySQL password
    database: 'Notas' // Your database name
};

async function crearAdmin() {
    // --- Choose your admin details ---
    const usuarioAdmin = 'admin'; 
    const passwordPlano = 'admin123'; // The password you'll type to log in
    const nombreAdmin = 'Administrador Principal';
    const tipoAdmin = 'Admin';

    // 1. Hash the password
    const salt = await bcrypt.genSalt(10); // Generates "salt" for security
    const passwordHash = await bcrypt.hash(passwordPlano, salt); // Creates the hash

    // 2. Connect to DB and insert the user
    let connection; // Declare connection outside try block
    try {
        connection = await mysql.createConnection(dbConfig);
        const sql = `
            INSERT INTO usuarios (Usuario, Password, Nombre_Usuario, Tipo) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE Password=VALUES(Password), Nombre_Usuario=VALUES(Nombre_Usuario), Tipo=VALUES(Tipo); 
            -- ON DUPLICATE updates if user 'admin' already exists
        `;

        await connection.execute(sql, [usuarioAdmin, passwordHash, nombreAdmin, tipoAdmin]);
        console.log(`¡Usuario '${usuarioAdmin}' creado/actualizado con éxito!`);
        // console.log('Password Hash:', passwordHash); // Optional: See the hash
    } catch (error) {
        console.error('Error al crear usuario:', error.message);
    } finally {
         if (connection) await connection.end(); // Always close connection
    }
}

crearAdmin(); // Run the function