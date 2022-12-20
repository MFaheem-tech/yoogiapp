import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { config } from "dotenv";
import connect from "./src/db/index.js";
import Router from "./src/router/index.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

config();

const app = express();

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

  app.listen(port, () => {
    console.log(`app is running http://${host}:${port}`);
  });
} catch (err) {
  console.log(err);
}
