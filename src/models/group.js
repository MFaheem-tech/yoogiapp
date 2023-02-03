import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    displayPicture: String,
    name: String,
    members: [String],
    GroupOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
