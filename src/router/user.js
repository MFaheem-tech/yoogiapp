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

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/password-reset", userController.resetPasswordRequest);
router.post("/verify-reset-code", userController.verifyCode);
router.post("/new-password", userController.newPassword);

router.post("/group", userController.createGroup);
router.get("/group", userController.viewGroup);
router.get("/group/:id", userController.viewGroupDetails);
router.put("/group/:id", userController.editGroup);
router.delete("/group/:id", userController.deleteGroup);

// collection
router.post("/collection", userController.addCollection);

export default router;
