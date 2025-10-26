const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { protect } = require('./authMiddleware');
// --- Configuración ---
const app = express();
const PORT = process.env.PORT || 3001; // Render usará process.env.PORT// El backend correrá en el puerto 3001
const JWT_SECRET = 'Practicando aplicacion web con react y node js'; // Clave secreta para JWT

// Configuración de la Base de Datos
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '1007031029M', // Tu contraseña de MySQL
    database: 'notas'
};

// --- Middlewares ---
// Permite que React (en otro puerto) haga peticiones
app.use(cors()); 
// Permite al servidor entender JSON enviado desde el frontend
app.use(express.json()); 

// --- Rutas (Endpoints) ---

// Ruta de "Hola Mundo" para probar
app.get('/api', (req, res) => {
    res.json({ message: '¡API de WebNotas funcionando!' });
});

// Ruta de Login
app.post('/api/login', async (req, res) => {
    try {
        const { Usuario, Password } = req.body;

        // 1. Conectar a la BD
        const connection = await mysql.createConnection(dbConfig);

        // 2. Buscar al usuario
        const sql = "SELECT * FROM usuarios WHERE Usuario = ?";
        const [rows] = await connection.execute(sql, [Usuario]);

        if (rows.length === 0) {
            // Usuario no encontrado
            await connection.end();
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        const user = rows[0];

        // 3. Verificar la contraseña
        const passwordEsValida = await bcrypt.compare(Password, user.password);

        if (!passwordEsValida) {
            // Contraseña incorrecta
            await connection.end();
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        // 4. ¡Éxito! Crear un Token (JWT)
        const tokenPayload = {
            id: user.Id_Usuario,
            usuario: user.Usuario,
            tipo: user.Tipo
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

        // 5. Enviar el token y los datos del usuario al frontend
        res.json({
            message: 'Login exitoso',
            token: token,
            usuario: {
                nombre: user.Nombre_Usuario,
                tipo: user.Tipo
            }
        });

        await connection.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Ruta para obtener la lista de alumnos/usuarios
app.get('/api/alumnos', protect, async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Obtener la información esencial de los usuarios
        const sql = "SELECT Id_Usuario, Usuario, Nombre_Usuario, Tipo FROM usuarios";
        const [rows] = await connection.execute(sql);
        
        res.json({
            alumnos: rows
        });

    } catch (error) {
        console.error("Error al obtener alumnos:", error);
        res.status(500).json({ message: 'Error en el servidor al obtener datos de alumnos.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});