const {getUserById} = require("../controllers/usersController.js")

// Middleware para verificar si el usuario es administrador
const verifyAdmin = async (req, res, next) => {
  console.log("verificando admin en midleware")
    try {
      const userId = req.body.userId; // Suponiendo que el ID del usuario está en el cuerpo de la petición
      const userEmail = req.body.email;
  
      console.log("VERIFY", userId, userEmail)
  
      const user = await getUserById(userId);
  
      if (!user || user.email !== userEmail || !user.admin) {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden realizar esta acción.' });
      }
  
      next();
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar permisos de administrador' });
    }
  };
  
  module.exports= {verifyAdmin};