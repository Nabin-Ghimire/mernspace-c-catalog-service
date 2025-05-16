import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Topping } from "./topping-type";
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

        const { name, price, tenantId } = req.body as Topping;
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
        };

        const topping = await this.toppingService.create(toppingsArgs);

        this.logger.info(`Created topping`, { id: topping._id });

        res.json({ id: topping._id });
    };
}
