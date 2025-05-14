import express from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";
import producRouter from "./product/product-router";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

const app = express();

app.use(fileUpload());
app.use(express.json());
app.use(cookieParser());

app.use("/categories", categoryRouter);
app.use("/products", producRouter);

app.use(globalErrorHandler);

export default app;
