const jwt = require('jsonwebtoken');
const { User } = require('../db.js');

const verificaUsuario = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        const verificaToken = async (req, res) => {
            try {
                // El middleware ya verificó el token, solo necesitamos devolver el usuario
                const user = req.user; // Asumiendo que el middleware coloca el usuario en req.user
                
                if (!user) {
                    return res.status(401).json({ success: false, message: "Usuario no encontrado" });
                }
        
                res.status(200).json({ 
                    success: true,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        admin: user.admin,
                        status: user.status,
                        // otros campos necesarios
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = { verificaUsuario };