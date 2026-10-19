import { nanoid } from "nanoid";

const VALID_REQUEST_ID = /^[a-zA-Z0-9_-]{8,128}$/;

export function requestId(request, response, next) {
  const provided = request.get("X-Request-ID");
  request.id = provided && VALID_REQUEST_ID.test(provided) ? provided : nanoid();
  response.setHeader("X-Request-ID", request.id);
  next();
}
