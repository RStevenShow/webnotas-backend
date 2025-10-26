const jwt = require('jsonwebtoken');


const JWT_SECRET = 'Practicando aplicacion web con react y node js'; 

exports.protect = (req, res, next) => {
    let token;
    // 1. Obtener el token del encabezado (Header de Autorización)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Extrae el token de la cadena 'Bearer <token>'
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        // 2. Verificar el token usando la clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Adjuntar la información del usuario a la solicitud (req.user)
        req.user = decoded; 
        next(); // Permitir que la solicitud pase a la siguiente función (la ruta)
    } catch (err) {
        return res.status(401).json({ message: 'Token no válido o expirado.' });
    }
};