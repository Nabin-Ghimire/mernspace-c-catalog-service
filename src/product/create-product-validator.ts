import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product name must be a string"),

    body("description").exists().withMessage("Description name is required"),

    body("priceConfiguration")
        .exists()
        .withMessage("priceConfiguration name is required"),

    body("attributes").exists().withMessage("Attribute field is required"),

    body("tenantId").exists().withMessage("TenantId field is required"),

    body("categoryId").exists().withMessage("CategoryId field is required"),

    // body("image").custom((value, { req }) => {
    //     if (!req.file) throw new Error("Product image is required");
    //     return true;
    // }),
];
