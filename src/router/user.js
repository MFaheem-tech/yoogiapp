import { Router } from "express";
import userController from "../controller/user.js";
import collectionController from "../controller/collection.js";
import { validate } from "../middleware/joiValidator.js";
import { schema } from "../validators/user.js";
import auth from "../middleware/auth.js";
import upload from "../helper/uploader.js";

const router = Router();

router.post(
  "/upload",
  (req, res, next) => {
    next();
  },
  upload.single("file"),
  userController.upload
);
router.post(
  "/upload-multiple",
  (req, res, next) => {
    next();
  },
  upload.array("files", 10),
  userController.uploadMultiple
);

router.post("/share", userController.share);
router.post("/register", userController.register);
// router.post("/signup", userController.singUp);
// router.patch("/account-type", userController.accountType);
router.put("/account-type/:id", userController.addAccountType);
router.post("/login", userController.login);
router.post("/password-reset", userController.resetPasswordRequest);
router.post("/verify-reset-code", userController.verifyCode);
router.post("/new-password", userController.newPassword);
router.get("/user-profile", auth, userController.userProfile);
router.put("/profile/update", auth, userController.updateProfile);

router.post("/group", userController.createGroup);
router.get("/group", userController.viewGroup);
router.get("/group/:id", userController.getGroupByUser);
router.get("/group-added/:id", userController.getGroupAddedUser);
router.get("/group-open/:id", userController.openGroupDetails);
router.post("/group/:id/add-members", userController.addMembers);
router.post("/group/:id/remove-members", userController.removeMembers);
router.get("/group/:id/members", userController.viewMembers);
router.put("/group/:id", userController.editGroup);
router.delete("/group/:id", userController.deleteGroup);

router.post("/file", userController.shareFile);
router.get("/file", userController.viewShareFile);
router.get("/file/:id", userController.viewShareFileDetails);
router.put("/file/:id", userController.editShareFile);

//  tags
router.post("/new-tag", userController.createTag);
router.get("/tag", userController.viewTags);
router.get("/tag-user/:id", userController.getTagsByUser);
router.get("/tag/:id", userController.viewSingleTag);
router.put("/tag/:id", userController.editTag);
router.delete("/tag/:id", userController.deleteTag);

router.get("/user-list", userController.viewUsers);

export default router;
