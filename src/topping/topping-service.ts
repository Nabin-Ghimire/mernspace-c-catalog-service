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
}
