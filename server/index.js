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
const mainRouter = express.Router();

// Same-domain CORS is much faster
app.use(cors({
    credentials: true,
    origin: true
}));

// Stripe Webhook (Keep this above express.json)
app.post('/api/order/webhook', express.raw({ type: 'application/json' }), webhookStripe);

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(helmet({
    crossOriginResourcePolicy: false
}))

const PORT = process.env.PORT || 8000

// Add back the /api prefix because Vercel rewrites don't strip the path,
// and we need it to match both locally (via Vite proxy) and in production.
mainRouter.use('/user', userRouter);
mainRouter.use('/category', categoryRouter);
mainRouter.use('/file', uploadRouter);
mainRouter.use('/sub-category', subCategoryRouter);
mainRouter.use('/product', productRouter);
mainRouter.use('/cart', cartRouter);
mainRouter.use('/order', orderRouter);

app.use('/api', mainRouter);

// Home route for the API specifically
app.get("/api/api-status", (req, res) => {
    res.json({ message: "Backend API is running" });
});

// Database & Export
// We call connectDB but don't 'await' it here so the server starts faster
connectDB();

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log('Local Server running on', PORT);
    });
}

export default app;