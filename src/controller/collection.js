import { User, Collection, Group, Tag, File } from "../models/index.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmailNow } from "../helper/sendEmail.js";
import mongoose from "mongoose";
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

      // Save
      const savedCollection = await newCollection.save();

      const group = await Group.findById(req.body.group);

      // Add the new collection to the group's collections array
      if (group) {
        group.collections.push(savedCollection._id);

        // Save the updated group to the database
        await group.save();
      }
      // Update the totalCollections field in the user document
      await User.findByIdAndUpdate(
        req.body.collectionOwner,
        { $inc: { totalCollections: 1 } },
        { new: true }
      );

      // Return the saved collection
      res.status(200).json(savedCollection);
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

  recentCollection: async (req, res) => {
    const userId = req.user.user_id;
    try {
      const recent = await Collection.find({
        collectionOwner: userId,
      })
        .sort({ createdAt: "desc" })
        .limit(10)
        .populate({ path: "collectionOwner", select: "-password" })
        .populate({ path: "shareCollection", select: "-password" })
        .populate({ path: "tags" })
        .exec();
      res.status(200).json(recent);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  ShareFromMe: async (req, res) => {
    const userId = req.user.user_id;
    try {
      const collections = await Collection.find({
        collectionOwner: userId,
        share: true,
      })
        .populate({ path: "collectionOwner", select: "-password" })
        .populate({ path: "shareCollection", select: "-password" })
        .populate({ path: "tags" })
        .exec();
      res.status(200).json(collections);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  ShareByMe: async (req, res) => {
    const userId = req.user.user_id;
    try {
      const collections = await Collection.find({ shareCollection: userId })
        .populate({ path: "collectionOwner", select: "-password" })
        .populate({ path: "shareCollection", select: "-password" })
        .populate({ path: "tags" })
        .exec();
      res.status(200).json(collections);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  shareWith: async (req, res) => {
    try {
      const collectionId = req.params.id;
      const shareTo = req.body.shareTo; // Assumes shareTo is an array of user IDs

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }

      // Filter out new members that already exist in shareCollection field
      const uniqueNewMembers = shareTo.filter(
        (member) => !collection.shareCollection.includes(member)
      );

      if (uniqueNewMembers.length === 0) {
        return res.json(collection);
      }

      // Add new members to shareCollection field
      collection.shareCollection.push(...uniqueNewMembers);

      // Save updated collection document
      await collection.save();

      res.status(200).json(collection);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  removeSharedMembers: async (req, res) => {
    try {
      const collectionId = req.params.id;
      const memberToRemove = req.body.memberToRemove; // Assumes memberToRemove is a user ID

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }

      // Find the index of the member to remove
      const index = collection.shareCollection.indexOf(memberToRemove);

      // If member is not found, return an error
      if (index === -1) {
        return res
          .status(404)
          .json({ error: "Member not found in collection" });
      }

      // Remove the member from the sharecollection field
      collection.shareCollection.splice(index, 1);

      // Save updated collection document
      await collection.save();

      res.status(200).json(collection);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  viewShareCollectionMembers: async (req, res) => {
    try {
      const collectionId = req.params.id;

      const collection = await Collection.findById(collectionId).populate(
        "shareCollection"
      );

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }

      const members = collection.shareCollection;

      res.status(200).json(members);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  removeCollectionFromGroup: async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const collectionId = req.params.collectionId;
      const groupOwner = req.body.groupOwner;

      // Find the group by its ID and check if the user is the group owner
      const group = await Group.findById({
        _id: groupId,
        groupOwner: groupOwner,
      });
      if (!group) {
        return res.status(400).json({ msg: "Group not found" });
      }

      if (!group.groupOwner.includes(groupOwner)) {
        return res
          .status(401)
          .json({ msg: "Only group owner have the authority" });
      }
      // Find the collection by its ID and check if it belongs to the group
      const collection = await Collection.findOne({
        _id: collectionId,
        group: groupId,
      });
      if (!collection) {
        return res
          .status(400)
          .json({ msg: "Collection not found in this group" });
      }

      // Remove the collection from the group
      group.collections = group.collections.filter(
        (c) => c.toString() !== collectionId
      );
      await group.save();

      return res.status(200).json({ msg: "Collection removed from group" });
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  // app.put('/groups/:fromGroupId/collections/:collectionId/move-to/:toGroupId',
  moveCollection: async (req, res) => {
    try {
      const { collectionId, fromGroupId, toGroupId } = req.body;
      // Retrieve the source and destination groups
      const fromGroup = fromGroupId ? await Group.findById(fromGroupId) : null;
      const toGroup = await Group.findById(toGroupId);
      // Retrieve the collection to be moved
      const collection = await Collection.findById(collectionId);
      // Check if the collection already exists in the destination group
      if (toGroup.collections.includes(collectionId)) {
        return res
          .status(400)
          .json({ error: "Collection already exists in destination group" });
      }
      // Remove the collection ID from the source group (if applicable) and add it to the destination group
      const objectId = mongoose.Types.ObjectId(collectionId); // Convert collectionId to ObjectId instance
      if (fromGroup) {
        fromGroup.collections = fromGroup.collections.filter(
          (id) => !id.equals(objectId)
        );
        fromGroup.markModified("collections");
        await fromGroup.save();
      }
      toGroup.collections.push(objectId);
      await toGroup.save();
      //  updating collection group field
      collection.group = toGroup._id;
      await collection.save();
      res.json({ message: "Collection moved successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
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
  deleteCollection: async (req, res) => {
    try {
      const collection = await Collection.findByIdAndDelete({
        _id: req.params.id,
      });

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      const user = await User.findByIdAndUpdate(
        collection.collectionOwner,
        { $inc: { totalCollections: -1 } },
        { new: true }
      );

      await user.save();
      return res.status(200).json(collection);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};
