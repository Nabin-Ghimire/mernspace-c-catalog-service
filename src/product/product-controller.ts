import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./product-service";
import { Logger } from "winston";
import { Product } from "./product-types";

export class ProductController {
    constructor(
        private logger: Logger,
        private productService: ProductService,
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

        const product = {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            image: "image.jpeg",
            isPublish,
        };
        //add proper request body types
        const newProduct = await this.productService.createProduct(product);

        if (!newProduct) {
            return next(createHttpError(400, "Product creation failed"));
        }
        res.status(201).json({ id: newProduct._id });
    };
}
