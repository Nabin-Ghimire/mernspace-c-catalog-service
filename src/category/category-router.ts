import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import { CategoryService } from "./category-service";
import logger from "../config/logger";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import validateCatigoryId from "./categoryId-validator";
const router = express.Router();

const categoryService = new CategoryService();

const categoryController = new CategoryController(categoryService, logger);

router
    .route("/:id")
    .all(validateCatigoryId)
    .get(
        authenticate,
        canAccess([Roles.ADMIN]),
        asyncWrapper(categoryController.getCategoryById),
    )
    .patch(
        authenticate,
        canAccess([Roles.ADMIN]),
        asyncWrapper(categoryController.updateCategoryById),
    )
    .delete(
        authenticate,
        canAccess([Roles.ADMIN]),
        asyncWrapper(categoryController.deleteCategoryById),
    );

router.get("/", asyncWrapper(categoryController.getAll));

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    asyncWrapper(categoryController.create),
);

export default router;
