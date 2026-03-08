import { Router } from "express";
import auth from "../middleware/auth.js";
import {
    AddSubCategoryController,
    GetSubCategoryController,
    UpdateSubCategoryController,
    DeleteSubCategoryController
} from "../controllers/subCategory.controller.js";

const subCategoryRouter = Router();

subCategoryRouter.post('/add', auth, AddSubCategoryController);
subCategoryRouter.post('/get', GetSubCategoryController);
subCategoryRouter.put('/update', auth, UpdateSubCategoryController);
subCategoryRouter.delete('/delete', auth, DeleteSubCategoryController);

export default subCategoryRouter;
