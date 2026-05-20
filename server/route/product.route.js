import { Router } from 'express'
import { createProductController, getProductController, updateProductController, deleteProductController, getProductsByCategoryController, getLowStockCountController } from '../controllers/product.controller.js'
import auth from '../middleware/auth.js' // Assuming there is an auth middleware

const productRouter = Router()

productRouter.post('/create', auth, createProductController)
productRouter.get('/get', getProductController)
productRouter.put('/update', auth, updateProductController)
productRouter.delete('/delete', auth, deleteProductController)
productRouter.post('/get-products-by-category', getProductsByCategoryController)
productRouter.get('/low-stock-count', auth, getLowStockCountController)

export default productRouter
