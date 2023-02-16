import { Router } from "express";
import collectionRouter from "./collection.js";
import userRouter from "./user.js";

const router = Router();

router.use("/users", userRouter);
router.use("/collections", collectionRouter);

export default router;
