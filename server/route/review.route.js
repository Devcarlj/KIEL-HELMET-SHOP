import { Router } from "express";
import { addReview, getProductReviews, editReview, deleteReview, getUserReviews } from "../controllers/review.controller.js";
import auth from "../middleware/auth.js";

const reviewRouter = Router();

reviewRouter.post('/add', auth, addReview);
reviewRouter.get('/product/:productId', getProductReviews);
reviewRouter.put('/:reviewId', auth, editReview);
reviewRouter.delete('/:reviewId', auth, deleteReview);
reviewRouter.get('/user/my-reviews', auth, getUserReviews);

export default reviewRouter;
