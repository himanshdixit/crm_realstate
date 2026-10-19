import { dashboardService } from "../services/dashboardService.js";
import { successResponse } from "../utils/ApiResponse.js";

export async function overview(request, response) {
  const data = await dashboardService.overview(request.auth.user, request.validated.months || 12);
  response.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
  response.json(successResponse({ message: "Dashboard loaded", data }));
}
