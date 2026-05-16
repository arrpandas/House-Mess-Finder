import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import tuitionsRouter from "./tuitions";
import storageRouter from "./storage";


const router: IRouter = Router();

router.use(healthRouter);
router.use(listingsRouter);
router.use(storageRouter);
router.use(tuitionsRouter);

export default router;

