import { User, Collection, Group } from "../models/index.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default {
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(400).send({ msg: "Email not available" });
      }
      const hashedPassword = await bcryptjs.hash(password, 10);
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
      });
      const newuser = await user.save();
      return res.status(201).json({
        msg: "New user created",
        data: newuser,
      });
    } catch (error) {
      res.status(500).send({
        error: error.message,
      });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(req.body);
      const user = await User.findOne({ email: email });
      if (!user) {
        res.status(400).send({ msg: " Invalid credentials" });
      }
      const validPassword = await bcryptjs.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).send({ msg: " Invalid credentials" });
      }
      const token = jwt.sign(
        {
          user_id: user._id,
          user_email: user.email,
        },
        process.env.SECRET_KEY
      );

      res.status(200).send({ msg: "Logged in successfully", token });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  // ################################### Groups
  createGroup: async (req, res) => {
    try {
      const { body } = req;
      const exists = await Group.findOne({ name: body.name });
      if (exists) {
        return res.status(400).json({ msg: "Group already exists" });
      }
      const newGroup = await Group.create(body);
      return res.status(201).json(newGroup);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
  viewGroup: async (req, res) => {
    try {
      const group = await Group.find();
      return res.status(200).json(group);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
  viewGroupDetails: async (req, res) => {
    try {
      const group = await Group.findOne({ _id: req.params.id });
      return res.status(200).json(group);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  editGroup: async (req, res) => {
    try {
      const { body } = req;
      const group = await Group.findByIdAndUpdate(
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

      return res.status(200).json(group);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  deleteGroup: async (req, res) => {
    try {
      const group = await Group.findByIdAndDelete({ _id: req.params.id });
      return res.status(200).json(group);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // ################################### UPLOAD FILE
  upload: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "please upload a file!" });
      }
      return res.status(200).json({ urls: req.file.location });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  },
  uploadMultiple: async (req, res) => {
    try {
      if (req.files) {
        let urls = [];
        req.files.forEach((file) => {
          urls.push(file.location);
        });
        return res.status(200).json(urls);
      }
      return res
        .status(400)
        .json({ error: "Please select a file or files to upload" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  },
};
