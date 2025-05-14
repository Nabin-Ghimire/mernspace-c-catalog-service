import express from "express";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { ProductController } from "./product-controller";
import createProductValidator from "./create-product-validator";
import { ProductService } from "./product-service";
import logger from "../config/logger";
import updateProductValidator from "./update-product-validator";
import { CloudinaryStorage } from "../common/services/cloudinary/cloudinaryUploader.ts";

const router = express.Router();

const productService = new ProductService();
const cloudinaryStorage = new CloudinaryStorage();
const productController = new ProductController(
    logger,
    productService,
    cloudinaryStorage,
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    createProductValidator,
    asyncWrapper(productController.create),
);

router.put(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    updateProductValidator,
    asyncWrapper(productController.update),
);

export default router;
