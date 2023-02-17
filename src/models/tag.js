import mongoose from "mongoose";

const Schema = mongoose.Schema;

const tagSchema = new Schema(
  {
    name: {
      type: String,
      unique: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
