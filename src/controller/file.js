import {
  User,
  Collection,
  Group,
  Tag,
  TextFile,
  File,
} from "../models/index.js";
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
  textFile: async (req, res) => {
    try {
      // Create a new TextFile document with the text data in the request body
      const file = new TextFile({
        textData: req.body.textData,
        fileType: "text",
        __t: "text",
      });

      // Save the TextFile document to MongoDB
      await file.save();

      res.status.json({ msg: "Text data saved to MongoDB" });
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
  recentFile: async (req, res) => {
    const userId = req.user.user_id;
    try {
      const recent = await File.find({
        fileOwner: userId,
        status: "active",
      })
        .sort({ createdAt: "desc" })
        .limit(10)
        .populate({ path: "fileOwner", select: "-password" })
        .populate({ path: "where", select: "-password" })
        .populate({ path: "tags" })
        .exec();
      res.status(200).json(recent);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  moveFile: async (req, res) => {
    try {
      const { fileId, fromCollectionId, ToCollectionId } = req.body;
      const ToCollection = await Collection.findById(ToCollectionId);
      const fromCollection = await Collection.findById(fromCollectionId);
      const file = await File.findById(fileId);

      if (!ToCollection) {
        return res
          .status(400)
          .json({ msg: "Destination collection not found" });
      }
      if (ToCollection.files.includes(fileId)) {
        return res
          .status(400)
          .json({ msg: "File already exists in destination collection" });
      }
      const objectId = mongoose.Types.ObjectId(fileId);
      if (fromCollection) {
        fromCollection.files = fromCollection.files.filter(
          (id) => !id.equals(objectId)
        );
        fromCollection.markModified("files");
        await fromCollection.save();
      }
      ToCollection.files.push(objectId);
      await ToCollection.save();
      file.where = ToCollection._id;
      await file.save();
      return res.status(200).json({ msg: "File moved successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  removeFileFromCollection: async (req, res) => {
    try {
      const collectionId = req.params.collectionId;
      const fileId = req.params.fileId;
      const currentUser = req.user; // Assuming that the authenticated user is being passed in the request

      // Find the collection by its ID
      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(400).json({ msg: "Collection not found" });
      }

      // Check if the current user is the collection owner or the file owner
      if (
        collection.collectionOwner !== currentUser._id &&
        collection.files.every((file) => file.fileOwner !== currentUser._id)
      ) {
        return res.status(401).json({
          msg: "Unauthorized: Only collection owner or file owner can remove file",
        });
      }

      // Find the file by its ID and check if it belongs to the collection
      const file = await File.findOne({
        _id: fileId,
        where: collectionId,
      });

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
  viewTrashFiles: async (req, res) => {
    try {
      // get the current user id from the request
      const currentUserId = req.user.user_id;

      // find all files that belong to the current user and have status set to "deleted"
      const files = await File.find({
        fileOwner: currentUserId,
        status: "deleted",
      });

      res.status(200).json(files);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  trashFile: async (req, res) => {
    try {
      // get the current user id from the request
      const currentUserId = req.user.user_id;

      // find the file by id and owner
      const file = await File.findOneAndUpdate(
        { _id: req.params.id, fileOwner: currentUserId },
        {
          status: "deleted",
          deletedAt: new Date(),
        },
        { new: true }
      );

      // if the file doesn't exist or doesn't belong to the current user, return an error
      if (!file) {
        return res.status(404).json({
          message:
            "The file could not be found or does not belong to the current user.",
        });
      }
      res.status(200).json({ message: "The file has been moved to trash." });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};
