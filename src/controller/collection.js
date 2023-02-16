import {
  User,
  Collection,
  Group,
  Category,
  Tag,
  File,
} from "../models/index.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmailNow } from "../helper/sendEmail.js";
import dotenv from "dotenv";
dotenv.config();

export default {
  // ################################### Collections
  //   addCollection: async (req, res) => {
  //     try {
  //       const { body } = req;
  //       const exists = await Collection.findOne({
  //         collectionName: body.collectionName,
  //       });
  //       if (exists) {
  //         return res.status(400).json({ msg: "Collection already exists" });
  //       }
  //       const collection = await Collection.create(body);
  //       return res.status(200).json(collection);
  //     } catch (error) {
  //       return res.status(500).send({ error: error.message });
  //     }
  //   },
  addCollection: async (req, res) => {
    try {
      // Check if any shareCollection IDs were provided
      const isShared =
        req.body.shareCollection && req.body.shareCollection.length > 0;

      // Create a new Collection object with the data from the request body
      const newCollection = new Collection({
        profile: req.body.profile,
        cover: req.body.cover,
        collectionName: req.body.collectionName,
        schedule: {
          date: req.body.date,
          time: req.body.time,
        },
        share: isShared, // set share to true if collection is shared
        collectionOwner: req.body.collectionOwner,
        tags: req.body.tags,
        group: req.body.group,
        shareCollection: req.body.shareCollection,
      });

      // Save the new collection to the database
      const savedCollection = await newCollection.save();

      // Return the saved collection as a JSON response
      res.json(savedCollection);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
  viewCollection: async (req, res) => {
    try {
      const details = await Collection.find();
      return res.status(200).json(details);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  editCollection: async (req, res) => {
    try {
      const { body } = req;
      const updateCollection = await Collection.findByIdAndUpdate(
        {
          _id: req.params.id,
        },
        {
          $set: body,
        },
        {
          new: true,
        }
      );

      return res.status(200).json(updateCollection);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};
