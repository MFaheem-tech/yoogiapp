import { User, Collection, Group, Tag, File } from "../models/index.js";
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
      const file = await File.findById(req.body.fileId);
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

  // singUp: async (req, res) => {
  //   try {
  //     // const { email, password, name } = req.body;
  //     const existingUser = await User.findOne({ email: req.body.email });
  //     if (existingUser) {
  //       return res.status(400).send({ msg: "Email not available" });
  //     }
  //     const hashedPassword = await bcryptjs.hash(req.body.password, 10);
  //     req.body.password = hashedPassword;
  //     const user = await User.create(req.body);
  //     // const newuser = await user.save();
  //     return res.status(200).json({
  //       msg: "New user created",
  //       user,
  //     });
  //   } catch (error) {
  //     res.status(500).send({
  //       error: error.message,
  //     });
  //   }
  // },

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

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

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
      return res.status(500).send({ error: error.message });
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
      console.log(user);
      if (!user) {
        return res.status(400).send({ msg: "Invalid token" });
      }
      res
        .status(200)
        .send({ userId: user._id.toString(), data: { code: code } });

      //redicret the user to login page
    } catch (error) {
      res.status(500).json({ error: error.message });
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
        return res.status(400).send({
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
      res.status(500).json({ error: error.message });
    }
  },

  userProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.user_id);
      console.log(user);
      res.send({ data: { user: user } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateProfile: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        { _id: req.user.user_id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  viewUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.user_id);

      return res.json({ data: { user: user } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ################################### Groups
  createGroup: async (req, res) => {
    try {
      const { body } = req;
      const newGroup = await Group.create(body);
      return res.status(200).json(newGroup);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
  getGroupByUser: async (req, res) => {
    try {
      const group = await Group.find({ groupOwner: req.params.id });
      if (!group) {
        return res
          .status(404)
          .json({ message: "No groups found for the given user ID." });
      }

      const groupData = group.map((group) => ({
        group: group,
        count: group.addMember.length,
      }));

      return res.status(200).json(groupData);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
  getGroupAddedUser: async (req, res) => {
    try {
      const group = await Group.find({ addMember: req.params.id })
        .populate({ path: "groupOwner", select: "-password" })
        .populate({ path: "groupMaker", select: "-password" })
        .populate({ path: "addMember", select: "-password" })
        .exec();
      if (!group) {
        return res
          .status(404)
          .json({ message: "No groups found for the given user ID." });
      }

      const groupData = group.map((group) => ({
        group: group,
        count: group.addMember.length,
      }));

      return res.status(200).json(groupData);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  viewGroup: async (req, res) => {
    try {
      const group = await Group.find();
      const groupData = group.map((group) => ({
        group: group,
        count: group.addMember.length,
      }));
      return res.status(200).json(groupData);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  openGroupDetails: async (req, res) => {
    try {
      const groupId = req.params.id;
      const group = await Group.findById(groupId)
        .populate({ path: "groupOwner", select: "-password" })
        .populate({ path: "groupMaker", select: "-password" })
        .populate({ path: "addMember", select: "-password" })
        .populate({
          path: "collections",
          populate: [
            { path: "collectionOwner", select: "-password" },
            { path: "tags" },
          ],
        });
      if (!group) {
        return res.status(400).json({ msg: "Group not found" });
      }
      return res.status(200).json({
        group,
        // collections: group.collections,
        memberCount: group.addMember.length,
      });
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
  addMembers: async (req, res) => {
    try {
      const groupId = req.params.id;
      const newMembers = req.body.newMembers; // Assumes newMembers is an array of user IDs

      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Filter out new members that already exist in addMember field
      const uniqueNewMembers = newMembers.filter(
        (member) => !group.addMember.includes(member)
      );

      if (uniqueNewMembers.length === 0) {
        return res.json(group);
      }

      // Add new members to addMember field
      group.addMember.push(...uniqueNewMembers);

      // Save updated group document
      await group.save();

      res.status(200).json(group);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  removeMembers: async (req, res) => {
    try {
      const groupId = req.params.id;
      const memberToRemove = req.body.memberToRemove; // Assumes memberToRemove is a user ID
      console.log(groupId);
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Find the index of the member to remove
      const index = group.addMember.indexOf(memberToRemove);

      // If member is not found, return an error
      if (index === -1) {
        return res.status(404).json({ error: "Member not found in group" });
      }

      // Remove the member from the addMember field
      group.addMember.splice(index, 1);

      // Save updated group document
      await group.save();

      res.status(200).json(group);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  viewMembers: async (req, res) => {
    try {
      const groupId = req.params.id;

      const group = await Group.findById(groupId).populate("addMember");

      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      const members = group.addMember;

      res.status(200).json(members);
    } catch (error) {
      return res.status(500).send({ error: error.message });
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

  shareFile: async (req, res) => {
    try {
      const { body } = req;
      const exists = await File.findOne({ name: body.name });
      if (exists) {
        return res.status(400).json({ msg: "This is already exists" });
      }
      const file = await File.create(body);
      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  viewShareFile: async (req, res) => {
    try {
      const file = await File.find();
      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  viewShareFileDetails: async (req, res) => {
    try {
      const file = await File.find({ _id: req.params.id });
      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  editShareFile: async (req, res) => {
    try {
      const { body } = req;
      const updateFile = await File.findByIdAndUpdate(
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
      const newTag = await Tag.create({
        name: req.body.name,
        createdBy: req.body.createdBy,
      });
      console.log(newTag);
      return res.status(200).json(newTag);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  getTagsByUser: async (req, res) => {
    try {
      // const { userId } = req.params;
      const tags = await Tag.find({ createdBy: req.params.id });
      return res.status(200).json(tags);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },
  viewTags: async (req, res) => {
    try {
      const tag = await Tag.find({}).populate("createdBy");
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
  deleteTag: async (req, res) => {
    try {
      const tag = await Tag.findByIdAndDelete({ _id: req.params.id });
      if (!tag) {
        return res.status(404).json({ msg: "tag not found with this id" });
      }
      return res.status(200).json({ msg: "tags deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  // ###### End tags

  viewUsers: async (req, res) => {
    try {
      const user = await User.find({});
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).send({ error: error.message });
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
