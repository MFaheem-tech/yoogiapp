import mongoose from "mongoose";

const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    displayPicture: String,
    backgroundPicture: String,
    collectionName: String,
    date: Date,
    time: String,
    share: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    group: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    collectionOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    shareCollection: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  { timestamps: true }
);

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;
