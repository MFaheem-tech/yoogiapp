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
  removeFileFromCollection: async (req, res) => {
    try {
      const collectionId = req.params.collectionId;
      const fileId = req.params.fileId;
      const collectionOwner = req.body.collectionOwner;

      // Find the collection by its ID and check if the user is the collection owner
      const collection = await Collection.findById(collectionId);
      console.log(collection.collectionName);

      if (!collection) {
        return res.status(400).json({ msg: "Collection not found" });
      }

      if (collection.collectionOwner.toString() !== collectionOwner) {
        return res
          .status(401)
          .json({ msg: "Only Collection owner have the authority" });
      }

      // Find the file by its ID and check if it belongs to the collection
      const file = await File.findOne({
        _id: fileId,
        where: collectionId,
      });

      console.log(fileId);
      if (!file) {
        return res
          .status(400)
          .json({ msg: "File not found in the specified collection" });
      }

      // Remove the file from the collection
      collection.files = collection.files.filter(
        (f) => f.toString() !== fileId
      );
      await collection.save();

      // Remove the collection from the file
      file.where = file.where.filter((w) => w.toString() !== collectionId);
      await file.save();

      return res.status(200).json({ msg: "File removed from collection" });
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
};
