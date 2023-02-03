import mongoose from "mongoose";

const Schema = mongoose.Schema;

const tagSchema = new Schema(
  {
    name: String,
    usedIn: [String],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
