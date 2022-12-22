import mongoose from "mongoose";

const Schema = mongoose.Schema;

const shareFileSchema = new Schema(
  {
    fileName: String,
    tags: [String],
    shareWith: [String],
    description: String,
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
  },

  { timestamps: true }
);

const ShareFile = mongoose.model("ShareFile", shareFileSchema);
export default ShareFile;
