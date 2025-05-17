import toppingModel from "./topping-model";
import { Filter, PaginateQuery, Topping } from "./topping-type";

export class ToppingService {
    async create(topping: Topping) {
        return (await toppingModel.create(topping)) as Topping;
    }

    async getAllToppings(
        q: string,
        filters: Filter,
        paginateQuery: PaginateQuery,
    ) {
        {
            const searchQueryRegexp = new RegExp(q, "i"); //q=case insensitive
            const matchQuery = {
                ...filters,
                name: searchQueryRegexp,
            };

            const aggregate = toppingModel.aggregate([
                {
                    $match: matchQuery,
                },
            ]);

            return toppingModel.aggregatePaginate(aggregate, paginateQuery);
        }
    }

    async getSingleTopping(id: string) {
        return (await toppingModel.findById(id)) as Topping;
    }

    async updateTopping(id: string, topping: Topping) {
        return (await toppingModel.findOneAndUpdate(
            { _id: id },
            { $set: topping },
            { new: true },
        )) as Topping; //new:true returns new updated document

        // return (await toppingModel.findByIdAndUpdate(id, topping, { new: true })) as Topping;
    }

    async deleteTopping(id: string) {
        return (await toppingModel.findByIdAndDelete(id)) as Topping;
    }
}
