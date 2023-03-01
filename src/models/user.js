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
    phone: String,

    password: {
      type: String,
      max: 15,
      min: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
    },
    cover: String,
    // totalFiles: String,
    // totalCollections: String,
    // totalGroups: String,
    totalFiles: {
      type: Number,
      default: 0,
    },
    totalCollections: {
      type: Number,
      default: 0,
    },
    totalGroups: {
      type: Number,
      default: 0,
    },
    passwordResetCode: Number,
    resetCode: Number,
    resetCodeExpirationTime: {
      type: Date,
    },

    profile: String,
    accountType: String,

    // puroseOfAccount: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Category",
    // },
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
