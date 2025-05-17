export interface Topping {
    _id?: string;
    name: string;
    price: number;
    tenantId: string;
    image: string;
    isPublish?: boolean;
}
export interface Filter {
    tenantId?: string;
    isPublish?: boolean;
}

export interface PaginateQuery {
    page: number;
    limit: number;
}
