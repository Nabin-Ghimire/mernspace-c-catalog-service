import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const toppingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    tenantId: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    isPublish: {
        type: Boolean,
        required: false,
        default: false,
    },
});

toppingSchema.plugin(aggregatePaginate);
export default mongoose.model("topping", toppingSchema);
