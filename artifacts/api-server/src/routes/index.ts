import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(listingsRouter);
router.use(storageRouter);

export default router;
