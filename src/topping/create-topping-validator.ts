import { body } from "express-validator";

export default [
    body("name").exists().withMessage("Product name is required"),

    body("price").exists().withMessage("Product price is required"),

    body("tenantId").exists().withMessage("TenantId field is required"),

    body("image").custom((value, { req }) => {
        if (!req.files) throw new Error("Product image is required");
        return true;
    }),
];
