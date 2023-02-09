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
    GroupOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
