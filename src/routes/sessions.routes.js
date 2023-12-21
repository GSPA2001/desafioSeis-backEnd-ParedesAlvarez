import { Router } from 'express';
import userModel from '../dao/models/user.model.js';

const router = Router();

// Middleware de autenticación
const auth = (req, res, next) => {
    try {
        if (req.session.user) {
            if (req.session.user.role === 'admin') {
                next();
            } else {
                res.status(403).send({ status: 'ERR', data: 'Usuario no admin' });
            }
        } else {
            res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
};

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar al usuario en la base de datos
        const user = await userModel.findOne({ email, password }).lean();

        if (user) {
            // Asignar el rol según la lógica requerida
            const role = email === 'adminCoder@coder.com' ? 'admin' : 'usuario';

            // Almacenar información del usuario en la sesión
            req.session.user = {
                _id: user._id,
                email: user.email,
                role: role,
            };

            // Redireccionar a la vista de productos
            res.redirect('/products');
        } else {
            res.status(401).send({ status: 'ERR', data: 'Credenciales inválidas' });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});

// Ruta para cerrar sesión
router.get('/logout', async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({ status: 'ERR', data: err.message });
            } else {
                res.redirect('/login'); // Cambiado a '/login'
            }
        });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});

// Ruta protegida para mostrar datos del usuario
router.get('/profile', auth, async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: req.session.user });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});

// Ruta de registro
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, username, email, age, password } = req.body;

        // Verificamos si ya existe un usuario con el mismo correo
        const usuarioExistente = await User.findOne({ email });

        if (usuarioExistente) {
            return res.status(400).json({ status: 'ERR', data: 'El correo ya está registrado.' });
        }

        // Crear un nuevo usuario
        const newUser = new User({
            first_name,
            last_name,
            username,
            email,
            age,
            password,
        });

        // Guardamos el nuevo usuario en la base de datos
        await newUser.save();

        res.status(200).json({ status: 'OK', data: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: 'ERR', data: 'Error interno del servidor.' });
    }
});

export default router;