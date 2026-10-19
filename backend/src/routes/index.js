import { Router } from "express";
import { env } from "../config/env.js";
import { v1Router } from "./v1/index.js";

export const apiRouter = Router();

apiRouter.use(env.API_PREFIX, v1Router);
