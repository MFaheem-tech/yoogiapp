import {
  User,
  Collection,
  Group,
  Category,
  Tag,
  ShareFile,
} from "../models/index.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmailNow } from "../helper/sendEmail.js";
import dotenv from "dotenv";
dotenv.config();

export default {
  // share via email or on a group
  share: async (req, res) => {
    try {
      // grap the file
      const file = await ShareFile.findById(req.body.fileId);
      if (file) {
        // find memebers in a group
        const group = await Group.findById(req.body.groupId);
        if (group || group.members.length !== 0) {
          await Promise.all(
            group.members.map(async (memberEmail) => {
              const user = await User.findOne({ email: memberEmail });
              if (user) {
                // send emails\
                if (!file.shareWith.includes(user._id.toString())) {
                  file.shareWith.push(user._id.toString());
                  const from = "muhammad.faheem@esols.tech";
                  const subject = `File has been shared with you on a group ${group.name}`;
                  const html = `
                <div>
                    <h5 style="color:red"> ${file.path} </h5>
                    <h3>You have a new file> </span> </h3>
                    <p>
                    <hr>
                </div>
                      `;
                  //sendemail now
                  try {
                    sendEmailNow(user.email, from, subject, html);
                  } catch (error) {
                    console.log(error.message);
                  }
                }
              }
            })
          );
        }

        // find users by emails
        if (req.body.userEmails.length !== 0) {
          await Promise.all(
            req.body.userEmails.map(async (email) => {
              const user = await User.findOne({ email: email });
              if (user) {
                if (!file.shareWith.includes(user._id.toString())) {
                  console.log("shared with ", user._id.toString());
                  file.shareWith.push(user._id.toString());
                  const from = "muhammad.faheem@esols.tech";
                  const subject = "File has been shared with you";
                  const html = `
                  <div>
                      <h5 style="color:red">  ${file.path} </h5>
                      <h3>You have a new file> </span> </h3>
                      <p>
                      <hr>
                  </div>
                        `;
                  //sendemail now
                  try {
                    sendEmailNow(user.email, from, subject, html);
                  } catch (error) {
                    console.log(error.message);
                  }
                }
              }
            })
          );
        }
        await file.save();
        return res.status(200).json({ msg: "file shared successfully" });
      }
      return res.status(404).json({ error: "file not found" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
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
      return res.status(200).json({
        msg: "New user created",
        data: newuser,
      });
    } catch (error) {
      res.status(500).send({
        error: error.message,
      });
    }
  },

  singUp: async (req, res) => {
    try {
      // const { email, password, name } = req.body;
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).send({ msg: "Email not available" });
      }
      const hashedPassword = await bcryptjs.hash(req.body.password, 10);
      req.body.password = hashedPassword;
      const user = await User.create(req.body);
      // const newuser = await user.save();
      return res.status(200).json({
        msg: "New user created",
        user,
      });
    } catch (error) {
      res.status(500).send({
        error: error.message,
      });
    }
  },

  addAccountType: async (req, res) => {
    try {
      const { body } = req;
      const user = await User.findByIdAndUpdate(
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

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // accountType: async (req, res) => {
  //   try {
  //     const { categoryId, userId } = req.body;
  //     const category = await Category.findById(categoryId);
  //     if (!category) {
  //       return res.status(404).send({ msg: "Category not found" });
  //     }
  //     const user = await User.findById(userId);
  //     user.puroseOfAccount = category._id;
  //     const newuser = await user.save();
  //     return res.status(200).json({
  //       msg: "New user  category added",
  //       data: newuser,
  //     });
  //   } catch (error) {
  //     res.status(500).send({
  //       error: error.message,
  //     });
  //   }
  // },
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

      res.status(200).send({ msg: "Logged in successfully", user, token });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  //reset password
  resetPasswordRequest: async (req, res) => {
    try {
      var code = await Math.floor(1000 + Math.random() * 9000);
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.send({
          msg: "User not found",
        });
      }
      user.resetCode = code;
      user.resetCodeExpirationTime = Date.now() + 3600000;
      await user.save();

      const from = "muhammad.faheem@esols.tech";
      const subject = "Password Reset Request";
      const html = `<div>
		<h3>Password Reset Request Received for the email <span style="color:blue">${user.email} </span> </h3>
		<p>Please avoid this if you did not make a password reset request</p>
		<p>if you have requested the password reset then please use the 4 Digit code below</p>
		<h1 style="text-align:center; color:grey">Code:${code}</h1>
		<hr>
		<h3 style ='color:red' > this will expire in 30 minuts </h3>
	</div>
		`;

      //send email now
      sendEmailNow(user.email, from, subject, html);
      res.send({
        msg: "Please check your email",
      });
    } catch (error) {
      res.status(400).send({
        msg: "something went wrong",
      });
    }
  },

  //verify reset code
  verifyCode: async (req, res) => {
    try {
      // authenticateUser(request);
      const code = req.body.code;

      const user = await User.findOne({
        resetCode: code,
        resetCodeExpirationTime: { $gt: Date.now() },
        // _id: userId
      });
      if (!user) {
        return res.status(200).send({ msg: "Invalid token" });
      }
      res
        .status(200)
        .send({ userId: user._id.toString(), data: { code: code } });

      //redicret the user to login page
    } catch (error) {
      res.status(400).send({
        msg: "something went wrong",
      });
    }
  },

  //new password
  newPassword: async (req, res) => {
    try {
      const { password, userId, code } = req.body;
      const user = await User.findOne({
        resetCode: code,
        resetCodeExpirationTime: { $gt: Date.now() },
        _id: userId,
      });
      if (!user) {
        return res.status(200).send({
          msg: "Invalid code",
        });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      user.password = hashedPassword;
      user.resetCode = undefined;
      user.resetCodeExpirationTime = undefined;
      await user.save();

      //send email
      const from = "muhammad.faheem@esols.tech";
      const subject = "password changed";
      const html = `
		<div>
			<h2> Dear <span style = "color:blue">${user.email}</span> </h2>
			<hr>
			<h3>Password changed for the email <span style="color:blue">${user.email} </span> </h3>
		</div>
			`;
      sendEmailNow(user.email, from, subject, html);
      res.send({
        msg: `Dear ${
          user.name ? user.name : user.email
        } password changed successfully`,
      });
    } catch (error) {
      res.status(400).send({
        msg: "something went wrong",
      });
    }
  },
  // choosePurpose: async (req, res) => {
  //   try {
  //     const { body } = req;
  //     const exists = await Category.findOne({
  //       categoryName: body.categoryName,
  //     });
  //     if (exists) {
  //       return res.status(400).json({ msg: "Category already exists" });
  //     }
  //     const purpose = await Category.create(req.body);
  //     return res.status(200).json(purpose);
  //   } catch (error) {
  //     return res.status(500).json({ error: error.message });
  //   }
  // },
  // getChoosePurpose: async (req, res) => {s
  //   try {
  //     const purpose = await Category.find();
  //     return res.status(200).json(purpose);
  //   } catch (error) {
  //     return res.status(500).send({ error: error.message });
  //   }
  // },
  userProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.user_id);
      console.log(user);
      res.send({ data: { user: user } });
    } catch (error) {
      res.status(400).send({
        msg: "something went wrong",
      });
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

  // ################################### Collections
  addCollection: async (req, res) => {
    try {
      const { body } = req;
      const exists = await Collection.findOne({ name: body.name });
      if (exists) {
        return res.status(400).json({ msg: "Collection already exists" });
      }
      const collection = await Collection.create(body);
      return res.status(201).json(collection);
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

  shareFile: async (req, res) => {
    try {
      const { body } = req;
      const exists = await ShareFile.findOne({ name: body.name });
      if (exists) {
        return res.status(400).json({ msg: "This is already exists" });
      }
      const file = await ShareFile.create(body);
      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  viewShareFile: async (req, res) => {
    try {
      const file = await ShareFile.find();
      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  viewShareFileDetails: async (req, res) => {
    try {
      const file = await ShareFile.find({ _id: req.params.id });
      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  editShareFile: async (req, res) => {
    try {
      const { body } = req;
      const updateFile = await ShareFile.findByIdAndUpdate(
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

      return res.status(200).json(updateFile);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // ################################### Tag

  createTag: async (req, res) => {
    try {
      const { body } = req;
      const exists = await Tag.findOne({ name: body.name });
      if (exists) {
        return res.status(400).json({ msg: "Tag already exists" });
      }
      const newTag = await Tag.create(body);
      return res.status(200).json(newTag);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
  viewTags: async (req, res) => {
    try {
      const tag = await Tag.find({});
      return res.status(200).json(tag);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  viewSingleTag: async (req, res) => {
    try {
      const tag = await Tag.find({ _id: req.params.id });
      return res.status(200).json(tag);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  editTag: async (req, res) => {
    try {
      const { body } = req;
      const updatedTag = await Tag.findByIdAndUpdate(
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

      return res.status(200).json(updatedTag);
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
      console.log(req);
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
