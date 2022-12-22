import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      max: 128,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      max: 64,
      trim: true,
    },
    password: {
      type: String,
      max: 256,
      min: 6,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
