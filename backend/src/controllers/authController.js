// backend/src/controllers/authController.js
import db from "../config/db.js";

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
        }

        // Buscar usuario en BD
        const [users] = await db.query(
            'SELECT id, username, password, role FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }

        const user = users[0];

        // Verificar contraseña (texto plano por ahora, idealmente usar bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Login exitoso
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.role === 'admin' ? 'Administrador' : 'Secretaria',
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        if (!userId || !newPassword) {
            return res.status(400).json({ message: "ID de usuario y nueva contraseña son requeridos" });
        }

        if (newPassword.length < 4) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 4 caracteres" });
        }

        const [result] = await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [newPassword, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({
            success: true,
            message: "Contraseña actualizada correctamente"
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: "Error al cambiar contraseña" });
    }
};

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, role FROM users ORDER BY username'
        );
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};
