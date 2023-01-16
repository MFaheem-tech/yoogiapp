import { Router } from "express";
import userController from "../controller/user.js";
import { validate } from "../middleware/joiValidator.js";
import { schema } from "../validators/user.js";
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
  upload.array("file", 10),
  userController.uploadMultiple
);

router.post("/share", userController.share);
router.post("/register", userController.register);
router.patch("/account-type", userController.accountType);
router.post("/login", userController.login);
router.post("/password-reset", userController.resetPasswordRequest);
router.post("/verify-reset-code", userController.verifyCode);
router.post("/new-password", userController.newPassword);

router.post("/choose-purpose", userController.choosePurpose);
router.get("/choose-purpose", userController.getChoosePurpose);

router.post("/group", userController.createGroup);
router.get("/group", userController.viewGroup);
router.get("/group/:id", userController.viewGroupDetails);
router.put("/group/:id", userController.editGroup);
router.delete("/group/:id", userController.deleteGroup);

// collection
router.post("/collection", userController.addCollection);
router.get("/collection", userController.viewCollection);
router.put("/collection/:id", userController.editCollection);

router.post("/file", userController.shareFile);
router.get("/file", userController.viewShareFile);
router.get("/file/:id", userController.viewShareFileDetails);
router.put("/file/:id", userController.editShareFile);

export default router;
