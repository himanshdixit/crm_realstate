import { Router } from "express";
import { exportExcel, exportPdf } from "../../controllers/reportController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const reportRouter = Router();
reportRouter.use(authenticate, authorize("reports.read", "reports.export"));
reportRouter.get("/excel", asyncHandler(exportExcel));
reportRouter.get("/pdf", asyncHandler(exportPdf));
