import { Router } from "express";
import auth from "../middleware/auth.js";
import uploadImagesController from "../controllers/uploadImagesController.js";
import upload from "../middleware/multer.js";

const uploadRouter = Router() 

uploadRouter.post('/upload',auth,upload.single('image'),uploadImagesController)

export default uploadRouter