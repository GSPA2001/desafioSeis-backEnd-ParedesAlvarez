// Configuracion de .env
import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import handlebars from 'express-handlebars'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import { __dirname, PORT } from './utils.js'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import FileStore from 'session-file-store'
import MongoStore from 'connect-mongo'

import productsRouter from './routes/products.routes.js'
import cartsRouter from './routes/carts.routes.js'
import viewsRouter from './routes/views.routes.js'
import messageModel from './dao/models/messages.model.js'
import usersRouter from './routes/users.routes.js'
import sessionsRouter from './routes/sessions.routes.js'

// Configuración de express
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser('secretKeyAbc123'))

//MongoDB URL desde .env
const mongoose_URL = process.env.MONGOOSE_URI
// Nombre de la base de datos en MongoDB
const mongoDBName = 'ecommerce'

const fileStorage = FileStore(session)
    app.use(session({
        store: MongoStore.create({ mongoUrl: mongoose_URL, mongoOptions: {}, ttl: 60, clearInterval: 5000 }), // MONGODB
        secret: 'secretKeyAbc123',
        resave: false,
        saveUninitialized: false
    }))

app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))

// Configuración de rutas
app.get('/', (req,res) => res.render('index', { name: 'Tutor' }))
app.use('/home', viewsRouter)
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/products', viewsRouter)
app.use('/login', usersRouter)
app.use('/users', usersRouter)
app.use('/logout', sessionsRouter)


// Configuración de Mongoose
mongoose.set('strictQuery', false)

// Conexión a MongoDB y inicio servidor
mongoose.connect(mongoose_URL, {dbName: mongoDBName})
.then(() => {
    console.log('MongoDB connected 🔌')
    const httpServer = app.listen(PORT, () => console.log(`Listening ...✅`))

    // Configuración de socket.io
    const io = new Server(httpServer)

    app.set('socketio', io)

    io.on('connection', async socket => {
        console.log('Successful connection 🚀')
        socket.on('productList', data => {
            io.emit('updatedProducts', data)
        })
        
        let messages = (await messageModel.find()) || [];
        
        socket.broadcast.emit('alerta');
        socket.emit('logs', messages);
        /*socket.on('message', data => {
            messages.push(data)
            messageModel.create(messages)
            io.emit('logs', messages)
        })*/
        socket.on('message', async (data) => {
            const newMessage = await messageModel.create(data);
            io.emit('logs', [newMessage]);  // Emitir solo el nuevo mensaje
        });
    })
}) 
.catch(e => console.error('Error to connect 🚨🚨🚨', e))