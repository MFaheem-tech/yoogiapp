import mongoose from "mongoose";

const Schema = mongoose.Schema;

const FileSchema = new Schema(
  {
    fileName: String,
    fileType: String,
    url: String,
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    path: String,
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
    },
    fileOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    description: String,
    schedule: {
      date: Date,
      time: String,
    },
    where: [
      {
        type: Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
  },

  { timestamps: true }
);

const File = mongoose.model("File", FileSchema);
export default File;
