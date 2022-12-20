import mongoose from "mongoose";

const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    displayPicture: String,
    backgroundPicture: String,
    name: String,
    members: [String],
    tags: [String],
    whenStart: Date,
    share: {
      type: Boolean,
      default: false,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    files: [String],
  },

  { timestamps: true }
);

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;
