import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { config } from "dotenv";
import connect from "./src/db/index.js";
import Router from "./src/router/index.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

// ###### swagger
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerDocument = YAML.load("./swagger.yaml");

config();

const options = {
  customCss: ".swagger-ui .topbar { display : none }",
  customSiteTitle: "Yoogi",
};

const app = express();

//  ## Server Swagger Ui
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
try {
  connect();
  app.use(errorHandler);
  app.use("/api/v1", Router);
  app.get("/", (req, res) => {
    res.send("api is running successfully");
  });

  const port = process.env.PORT || 5000;
  const host = "localhost";
  // const host = "192.168.18.72";

  app.listen(port, () => {
    console.log(`app is running http://${host}:${port}`);
  });
} catch (err) {
  console.log(err);
}