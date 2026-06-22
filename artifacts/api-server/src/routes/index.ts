import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import postsRouter from "./posts";
import studyRouter from "./study";
import marketplaceRouter from "./marketplace";
import clubsRouter from "./clubs";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(postsRouter);
router.use(studyRouter);
router.use(marketplaceRouter);
router.use(clubsRouter);
router.use(statsRouter);

export default router;
