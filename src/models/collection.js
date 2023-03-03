import mongoose from "mongoose";

const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    profile: String,
    cover: String,
    collectionName: String,
    schedule: {
      date: Date,
      time: String,
    },
    share: {
      type: Boolean,
      default: false,
    },
    collectionOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    shareCollection: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],
  },

  { timestamps: true }
);

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;
