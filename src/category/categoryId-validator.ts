import { checkSchema } from "express-validator";

export default checkSchema(
    {
        id: {
            isMongoId: {
                errorMessage: "Invalid category id",
            },
        },
    },
    ["params"],
);
