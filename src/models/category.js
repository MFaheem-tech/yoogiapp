import mongoose from "mongoose";

const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    categoryName: {
      type: [String],
      enum: ["Business", "Education", "Private"],
    },
  },

  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
