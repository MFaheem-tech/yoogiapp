import mongoose from "mongoose";
import { config } from "dotenv";

config();

const connect = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect("mongodb://localhost/yoogi", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DB connected successfully");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

export default connect;
