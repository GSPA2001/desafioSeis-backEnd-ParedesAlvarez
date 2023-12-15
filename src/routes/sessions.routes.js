import { Router } from 'express';
import userModel from '../dao/models/user.model.js';

const router = Router();

// Middleware de autenticación
const auth = async (req, res, next) => {
    try {
        if (req.session.user) {
            next();
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
            // Almacenar información del usuario en la sesión
            req.session.user = {
                _id: user._id,
                email: user.email,
                role: user.email === 'adminCoder@coder.com' ? 'admin' : 'usuario',
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

export default router;