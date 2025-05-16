import toppingModel from "./topping-model";
import { Topping } from "./topping-type";

export class ToppingService {
    async create(topping: Topping) {
        return (await toppingModel.create(topping)) as Topping;
    }
}
