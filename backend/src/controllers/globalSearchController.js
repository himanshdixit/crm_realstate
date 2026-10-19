import { globalSearchService } from "../services/globalSearchService.js";
import { successResponse } from "../utils/ApiResponse.js";

export async function search(request, response) {
  const data = await globalSearchService.search(request.auth, request.validated.q, request.validated.limit || 12);
  response.set("Cache-Control", "private, max-age=15");
  response.json(successResponse({ message: "Search completed", data }));
}
