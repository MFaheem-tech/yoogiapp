import { User, Collection, Group, Tag, File } from "../models/index.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmailNow } from "../helper/sendEmail.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export default {
  addFile: async (req, res) => {
    try {
      const file = new File({
        fileName: req.body.fileName,
        fileType: req.body.fileType,
        url: req.body.url,
        tags: req.body.tags,
        path: req.body.path,
        status: req.body.status,
        fileOwner: req.body.fileOwner,
        description: req.body.description,
        schedule: req.body.schedule,
        where: req.body.where,
      });
      const savedFile = await file.save();

      const collection = await Collection.findById(req.body.where);

      // Add the new file to the  collection's files array

      collection.files.push(savedFile._id);

      // Save the updated collection to the database
      await collection.save();

      // Update the totalfiles field in the user document
      await User.findByIdAndUpdate(
        req.body.fileOwner,
        { $inc: { totalFiles: 1 } },
        { new: true }
      );
      res.status(201).json(savedFile);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
};
