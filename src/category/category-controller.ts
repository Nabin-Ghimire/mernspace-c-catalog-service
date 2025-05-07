import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category } from "./category-types";
import { CategoryService } from "./category-service";
import { Logger } from "winston";

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.updateCategoryById = this.updateCategoryById.bind(this);
        this.deleteCategoryById = this.deleteCategoryById.bind(this);
        this.getCategoryById = this.getCategoryById.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { name, priceConfiguration, attributes } = req.body as Category;

        //call the service
        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });

        this.logger.info(`Created category`, { id: category._id });

        res.json({ id: category._id });
    }

    async getAll(req: Request, res: Response) {
        const categories = await this.categoryService.getAll();
        res.json(categories);
    }

    async updateCategoryById(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { id } = req.params;
        const category = req.body as Category;
        const updatedCategory = await this.categoryService.updatedCategoryById(
            id,
            category,
        );
        if (!updatedCategory) {
            return next(createHttpError(404, "Category not found"));
        }
        this.logger.info(`Updated category`, { id: updatedCategory._id });
        res.json({ id: updatedCategory._id });
    }

    async deleteCategoryById(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { id } = req.params;
        const deletedCategory =
            await this.categoryService.deleteCategoryById(id);
        if (!deletedCategory) {
            return next(createHttpError(404, "Category not found"));
        }
        this.logger.info(`Deleted category`, { id: deletedCategory._id });
        res.json({ id: deletedCategory._id });
    }

    async getCategoryById(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        console.log(result);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { id } = req.params;

        const category = await this.categoryService.getCategoryById(id);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }
        this.logger.info(`Fetched category`, { id: category._id });
        res.json(category);
    }
}
