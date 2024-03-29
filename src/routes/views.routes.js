import { Router } from 'express';
import { productManager } from '../dao/fsManagers/productManager.js'
import productModel from '../dao/models/products.model.js';
import messageModel from '../dao/models/messages.model.js';
import cartModel from '../dao/models/carts.model.js';

const router = Router()

// Ruta para renderizar la página principal
router.get('/', async (req, res) => {
    try {
        const allProducts = await productModel.find().lean().exec();
        console.log(allProducts.map(item => item._id));
        res.render('home', { allProducts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', error: err.message });
    }
})

// Ruta para la página de productos en tiempo real
router.get('/realTimeProducts', async (req, res) => {
    try {
        const allProducts = await productManager.getProducts()
        res.render('realTimeProducts', { allProducts })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
})

// Nueva ruta para mostrar todos los productos con paginación
/*router.get('/products', async (req, res) => {
    try {
      // Obtener todos los productos desde la base de datos (usando mongoose)
      const allProducts = await productModel.find().lean().exec();
  
      // Renderizar la vista 'products.handlebars' con la lista de productos
      res.render('products', { allProducts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', error: err.message });
    }
  })*/
router.get('/products', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Puedes ajustar el límite de productos por página según tus necesidades y se ve reflejado en http://localhost:8080/home/products

    try {
        const allProducts = await productModel.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .exec();

        if (req.session.user) {
            const user = req.session.user;
            const welcomeMessage = `Bienvenido, ${user.email} (${user.role})`;

            res.render('products', { allProducts, currentPage: page, welcomeMessage });
        } else {
            res.render('products', { allProducts, currentPage: page });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', error: err.message });
    }
});

// Ruta para la página de carts en tiempo real
router.get('/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartModel.findById(cartId).populate('products.product').lean().exec();

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.render('cart', { cart });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', error: err.message });
    }
});

// Ruta login
router.get('/login', async (req, res) => {
    // Si el usuario tiene sesión activa, no volvemos a mostrar el login,
    // directamente redireccionamos al perfil.
    if (req.session.user) {
        res.redirect('/profile')
    } else {
        res.render('login', { error: req.query.error || '' })
    }
})

// Ruta profile
router.get('/profile', async (req, res) => {
    // Si el usuario tiene sesión activa, mostramos su perfil
    if (req.session.user) {
        res.render('profile', { user: req.session.user })
    } else {
        // sino volvemos al login
        res.redirect('/home/login')
    }
})

//Ruta register
router.get('/register', async (req, res) => {
    res.render('register', {})
})

// Ruta para la página de chat
router.get('/chat', async (req, res) => {
    try {
        const messages = await messageModel.find().lean().exec();
        res.render('chat', { messages });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', error: err.message });
    }
})

//
router.get('/users', async (req, res) => {
    try {
        const users = await manager.getUsers();
        res.render('users', { success: true, data: users });
    } catch (err) {
        res.status(500).send({ success: false, error: err.message });
    }
});

export default router