import { Router } from "express";
import collectionController from "../controller/collection.js";
import { validate } from "../middleware/joiValidator.js";
import { schema } from "../validators/user.js";
import auth from "../middleware/auth.js";
import upload from "../helper/uploader.js";

const router = Router();

router.post("/add-collection", collectionController.addCollection);
router.post("/add-member/:id/share-with", collectionController.shareWith);
router.post(
  "/remove-member/:id/remove",
  collectionController.removeSharedMembers
);
router.get("/view-collections", collectionController.viewCollection);
router.get("/recent-collection", auth, collectionController.recentCollection);
router.get("/share-from-me", auth, collectionController.ShareFromMe);
router.get("/share-to-me", auth, collectionController.ShareToMe);
router.get(
  "/share-collection/:id/members",
  collectionController.viewShareCollectionMembers
);
router.get(
  "/current-user-collection",
  auth,
  collectionController.currentUserCollections
);
router.delete(
  "/group/:groupId/collection/:collectionId",
  collectionController.removeCollectionFromGroup
);
router.get(
  "/collections/:filterType",
  auth,
  collectionController.collectionFiltering
);
router.get("/collection-open/:id", collectionController.openCollectionDetails);
router.put("/move-collection", collectionController.moveCollection);
router.put("/collection/:id", collectionController.editCollection);
router.delete("/collection/:id", collectionController.deleteCollection);

export default router;
