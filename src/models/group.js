import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    profile: String,
    cover: String,
    groupName: String,
    addMember: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groupOwner: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // for future use
    groupMaker: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
  },

  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
