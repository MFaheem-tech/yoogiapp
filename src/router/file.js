import { Router } from "express";
import fileController from "../controller/file.js";
import { validate } from "../middleware/joiValidator.js";
import { schema } from "../validators/user.js";
import auth from "../middleware/auth.js";
import upload from "../helper/uploader.js";

const router = Router();
router.post("/add-file", fileController.addFile);
router.delete(
  "/collection/:collectionId/file/:fileId",
  fileController.removeFileFromCollection
);

export default router;
