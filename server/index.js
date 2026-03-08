import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.route.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import orderRouter from './route/order.route.js'
import { webhookStripe } from './controllers/order.controller.js'

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174"
].filter(Boolean);

app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}))

// Stripe Webhook needs the raw body
app.post('/api/order/webhook', express.raw({ type: 'application/json' }), webhookStripe);

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(helmet({
    crossOriginResourcePolicy: false
}))

const PORT = process.env.PORT || 8000

app.get("/", (request, response) => {
    /// server to client side
    response.json({
        message: "Server is running " + PORT
    })

})

app.use('/api/user', userRouter)
app.use('/api/category', categoryRouter)
app.use('/api/file', uploadRouter)
app.use('/api/sub-category', subCategoryRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('Server is running', PORT)
    })
})

