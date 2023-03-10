import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { config } from "dotenv";
import connect from "./src/db/index.js";
import bodyParser from "body-parser";
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
// aaaaaaaaqa

//  ## Server Swagger Ui
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, options)
// );

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(bodyParser.text({ type: "text/plain" }));
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 5000;
const host = "yoogi-app.onrender.com" || "localhost";
// const host = "localhost";

try {
  app.get("/", (req, res) => {
    res.send("api is running successfully");
  });
  app.use("/api/v1", Router);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, options)
  );

  app.use(errorHandler);
  connect();
  app.listen(port, () => {
    console.log(`app is running http://${host}:${port}`);
  });
} catch (err) {
  console.log(err);
}
export default app;
