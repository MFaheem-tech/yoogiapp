import { Router } from "express";
import collectionController from "../controller/collection.js";
import { validate } from "../middleware/joiValidator.js";
import { schema } from "../validators/user.js";
import auth from "../middleware/auth.js";
import upload from "../helper/uploader.js";

const router = Router();

router.post("/add-collection", collectionController.addCollection);
router.get("/view-collections", collectionController.viewCollection);
router.put("/collection/:id", collectionController.editCollection);

export default router;
