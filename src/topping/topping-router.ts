import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { asyncWrapper } from "../common/utils/wrapper";
import createToppingValidator from "./create-topping-validator";
import { ToppingService } from "./topping-service";
import logger from "../config/logger";
import { CloudinaryStorage } from "../common/services/cloudinary/cloudinaryUploader.ts";
import { ToppingController } from "./topping-controller";

const router = express.Router();

const toppingService = new ToppingService();
const cloudinarStorage = new CloudinaryStorage();
const toppingController = new ToppingController(
    toppingService,
    logger,
    cloudinarStorage,
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    createToppingValidator,
    asyncWrapper(toppingController.create),
);

export default router;
