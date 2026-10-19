import { adminUserService } from "../services/adminUserService.js";
import { successResponse } from "../utils/ApiResponse.js";

export async function create(request, response) { const data = await adminUserService.create(request.validated, request); response.status(201).json(successResponse({ message: "User created", data })); }
export async function update(request, response) { const data = await adminUserService.update(request.validated.userId, request.validated, request); response.json(successResponse({ message: "User updated", data })); }
export async function setPassword(request, response) { await adminUserService.setPassword(request.validated.userId, request.validated.password, request); response.json(successResponse({ message: "Password changed and active sessions revoked" })); }
export async function remove(request, response) { await adminUserService.remove(request.validated.userId, request); response.json(successResponse({ message: "User deleted" })); }
