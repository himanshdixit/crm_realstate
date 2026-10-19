import { Router } from "express";
import { healthRouter } from "./healthRoutes.js";
import { authRouter } from "./authRoutes.js";
import { dashboardRouter } from "./dashboardRoutes.js";
import { resourceRouter } from "./resourceRoutes.js";
import { workflowRouter } from "./workflowRoutes.js";
import { reportRouter } from "./reportRoutes.js";
import { searchRouter } from "./searchRoutes.js";
import { notificationRouter } from "./notificationRoutes.js";
import { lookupRouter } from "./lookupRoutes.js";

export const v1Router = Router();

v1Router.use("/health", healthRouter);
v1Router.use("/auth", authRouter);
v1Router.use("/dashboard", dashboardRouter);
v1Router.use("/reports", reportRouter);
v1Router.use("/search", searchRouter);
v1Router.use("/notifications/inbox", notificationRouter);
v1Router.use("/lookups", lookupRouter);
v1Router.use(workflowRouter);
v1Router.use(resourceRouter);
