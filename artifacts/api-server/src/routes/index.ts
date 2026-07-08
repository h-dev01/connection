import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import communityRouter from "./community";
import studyRouter from "./study";
import marketplaceRouter from "./marketplace";
import clubsRouter from "./clubs";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(communityRouter);
router.use(studyRouter);
router.use(marketplaceRouter);
router.use(clubsRouter);
router.use(statsRouter);

export default router;
