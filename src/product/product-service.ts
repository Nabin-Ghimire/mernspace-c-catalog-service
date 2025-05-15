import { paginationLabels } from "../config/pagination";
import productModel from "./product-model";
import { Filter, paginateQuery, Product } from "./product-types";

export class ProductService {
    async createProduct(product: Product) {
        return (await productModel.create(product)) as Product;
    }

    async getProductImage(productId: string) {
        const product = (await productModel.findById(productId)) as Product;

        return product?.image;
    }

    async updateProduct(productId: string, product: Product) {
        return (await productModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            { new: true },
        )) as Product; //new:true returns new updated document
    }

    async getProduct(productId: string): Promise<Product | null> {
        return await productModel.findOne({ _id: productId });
    }

    async getAllProducts(
        q: string,
        filters: Filter,
        paginateQuery: paginateQuery,
    ) {
        const searchQueryRegexp = new RegExp(q, "i"); //q=case insensitive
        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = productModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1, //1 means show the items
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$category", //shows category items in the form of object
            },
        ]);
        return productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
        //     const result = aggregate.exec();
        //     return result as unknown as Product[];
    }
}
