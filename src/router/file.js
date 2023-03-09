import { Router } from "express";
import fileController from "../controller/file.js";
import { validate } from "../middleware/joiValidator.js";
import { schema } from "../validators/user.js";
import auth from "../middleware/auth.js";
import upload from "../helper/uploader.js";

const router = Router();
router.post("/add-file", fileController.addFile);
router.post("/add-text", fileController.textFile);
router.get("/recent-file", auth, fileController.recentFile);
router.put("/move-file", fileController.moveFile);

router.delete(
  "/collection/:collectionId/file/:fileId",
  auth,
  fileController.removeFileFromCollection
);

export default router;
