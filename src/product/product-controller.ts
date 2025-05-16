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
            const encodedPublicId = extractPublicId(oldImage);
            const publicId = decodeURIComponent(encodedPublicId);
            const imageFile = req.files.image as UploadedFile;
            const localPath = await saveFileLocally(imageFile);
            cloudinaryResult =
                await this.cloudinaryStorage.uploadToCloudinaryAndDeleteLocal(
                    localPath,
                );

            await this.cloudinaryStorage.deleteFromCloudinary(publicId);
            // console.log("Response",response,publicId,oldImage);
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
            {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 10,
            },
        );

        res.json({
            data: products,
            total: products.total,
            pazeSize: products.limit,
            currentPage: products.page,
        });
    };

    getProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params;
        const product = await this.productService.getProduct(productId);
        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }
        res.json(product);
    };

    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params;
        const product = await this.productService.getProduct(productId);
        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }

        const tenant = (req as AuthRequest).auth.tenant;

        if ((req as AuthRequest).auth.role !== "admin") {
            if (product.tenantId !== String(tenant)) {
                return next(
                    createHttpError(
                        403,
                        "You don't have access to this product",
                    ),
                );
            }
        }
        const imageUri = product.image;
        const publicId = extractPublicId(imageUri);
        await this.cloudinaryStorage.deleteFromCloudinary(publicId);
        await this.productService.deleteProduct(productId);
        res.json({ id: productId });
    };
}

function extractPublicId(imageUrl: string): string {
    // Clean double extensions first (e.g. ".jpg.jpg" → ".jpg")
    const cleanedUrl = imageUrl.replace(/(\.[a-z]+)\1$/i, "$1");

    // Extract the public_id after '/upload/' and optional version segment
    const match = cleanedUrl.match(/\/upload\/(?:v\d+\/)?([^.]+)\.[a-z]+$/i);
    if (!match || !match[1]) {
        throw new Error("Could not extract public_id from image URL");
    }
    return match[1];
}
