import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./product-service";
import { Logger } from "winston";
import { Filter, Product } from "./product-types";
import { UploadedFile } from "express-fileupload";
import { saveFileLocally } from "../common/services/multer/localUploader.ts ";
import { CloudinaryStorage } from "../common/services/cloudinary/cloudinaryUploader.ts";
import { AuthRequest } from "../common/types";
import mongoose from "mongoose";

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

        //check if tenant has access to the product
        const productData = await this.productService.getProduct(productId);
        if (!productData) {
            return next(createHttpError(404, "Product not found"));
        }

        const tenant = (req as AuthRequest).auth.tenant;

        if ((req as AuthRequest).auth.role !== "admin") {
            if (productData.tenantId !== String(tenant)) {
                return next(
                    createHttpError(
                        403,
                        "You don't have access to this product",
                    ),
                );
            }
        }
        if (req.files?.image) {
            oldImage = productData.image;
            const imageFile = req.files.image as UploadedFile;
            const localPath = await saveFileLocally(imageFile);
            cloudinaryResult =
                await this.cloudinaryStorage.uploadToCloudinaryAndDeleteLocal(
                    localPath,
                );

            await this.cloudinaryStorage.deleteFromCloudinary(oldImage);
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

    index = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublish } = req.query;

        const filters: Filter = {};

        if (isPublish == "true") {
            filters.isPublish = true;
        }
        if (tenantId) {
            filters.tenantId = tenantId as string;
        }
        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }
        //TODO: add logging
        const products = await this.productService.getAllProducts(
            q as string,
            filters,
        );

        res.json(products);
    };
}
