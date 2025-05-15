import mongoose from "mongoose";

export interface Product {
    name: string;
    description: string;
    image: string;
    priceConfiguration: string;
    attributes: string;
    tenantId: string;
    categoryId: string;
    isPublish?: boolean;
}

export interface Filter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublish?: boolean;
}
