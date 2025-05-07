import categoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new categoryModel(category);
        return newCategory.save();
    }

    async getAll() {
        return categoryModel.find({}).select("_id name");
    }

    async updatedCategoryById(_id: string, category: Category) {
        const updatedCategory = await categoryModel.findByIdAndUpdate(
            _id,
            category,
            {
                new: true,
            },
        );
        return updatedCategory;
    }

    async deleteCategoryById(_id: string) {
        return categoryModel.findByIdAndDelete(_id);
    }

    async getCategoryById(_id: string) {
        return categoryModel.findById(_id);
    }
}
