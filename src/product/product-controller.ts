import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./product-service";
import { Logger } from "winston";
import { Product } from "./product-types";
import { UploadedFile } from "express-fileupload";
import { saveFileLocally } from "../common/services/multer/localUploader.ts ";
import { CloudinaryStorage } from "../common/services/cloudinary/cloudinaryUploader.ts";

export class ProductController {
    constructor(
        private logger: Logger,
        private productService: ProductService,
        private cloudinaryStorage: CloudinaryStorage,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body as Product;

        const file = req.files?.image as UploadedFile;
        if (!file) return res.status(400).send("No file uploaded");

        const localPath = await saveFileLocally(file);
        const cloudinaryImageResult =
            await this.cloudinaryStorage.uploadToCloudinaryAndDeleteLocal(
                localPath,
            );

        const product = {
            name,
            description,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            priceConfiguration: JSON.parse(priceConfiguration),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            image: cloudinaryImageResult.secure_url,
            isPublish,
        };
        //add proper request body types
        const newProduct = await this.productService.createProduct(product);

        if (!newProduct) {
            return next(createHttpError(400, "Product creation failed"));
        }
        res.status(201).json({ id: newProduct._id });
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { productId } = req.params;
        let cloudinaryResult;
        let oldImage: string | undefined;

        if (req.files?.image) {
            const imageFile = req.files.image as UploadedFile;
            const localPath = await saveFileLocally(imageFile);
            cloudinaryResult =
                await this.cloudinaryStorage.uploadToCloudinaryAndDeleteLocal(
                    localPath,
                );

            await this.cloudinaryStorage.deleteFromCloudinary(oldImage!);
        }
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body as Product;

        const product = {
            name,
            description,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            priceConfiguration: JSON.parse(priceConfiguration),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            image: cloudinaryResult?.secure_url
                ? cloudinaryResult.secure_url
                : (oldImage as string),
            isPublish,
        };
        await this.productService.updateProduct(productId, product);

        res.json({ id: productId });
    };
}
