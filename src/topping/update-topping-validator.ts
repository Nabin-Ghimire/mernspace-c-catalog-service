import { body } from "express-validator";

export default [
    body("name").exists().withMessage("Topping name is required"),
    body("price").exists().withMessage("Topping price is required"),
    body("tenantId").exists().withMessage("TenantId field is required"),
];
