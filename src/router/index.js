import { Router } from "express";
import collectionRouter from "./collection.js";
import fileRouter from "./file.js";
import userRouter from "./user.js";

const router = Router();

router.use("/users", userRouter);
router.use("/collections", collectionRouter);
router.use("/files", fileRouter);

export default router;
