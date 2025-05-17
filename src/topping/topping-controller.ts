import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Filter, Topping } from "./topping-type";
import { ToppingService } from "./topping-service";
import { Logger } from "winston";
import { UploadedFile } from "express-fileupload";
import { saveFileLocally } from "../common/services/multer/localUploader.ts ";
import { CloudinaryStorage } from "../common/services/cloudinary/cloudinaryUploader.ts";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private logger: Logger,
        private cloudinaryStorage: CloudinaryStorage,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { name, price, tenantId, isPublish } = req.body as Topping;
        const file = req.files!.image as UploadedFile;

        if (!file) return res.status(400).send("No file uploaded");

        const localPath = await saveFileLocally(file);
        const imageUri =
            await this.cloudinaryStorage.uploadToCloudinaryAndDeleteLocal(
                localPath,
            );

        const toppingsArgs = {
            name,
            price: Number(price),
            tenantId,
            image: imageUri.secure_url,
            isPublish,
        };

        const topping = await this.toppingService.create(toppingsArgs);

        this.logger.info(`Created topping`, { id: topping._id });

        res.json({ id: topping._id });
    };

    index = async (req: Request, res: Response, next: NextFunction) => {
        const { q, tenantId, isPublish } = req.query;

        const filters: Filter = {};

        if (tenantId) filters.tenantId = tenantId as string;
        if (isPublish) filters.isPublish = true;

        const toppings = await this.toppingService.getAllToppings(
            q as string,
            filters,
            {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 10,
            },
        );
        if (!toppings) {
            return next(createHttpError(404, "Toppings not found"));
        }
        res.json(toppings);
    };
}
