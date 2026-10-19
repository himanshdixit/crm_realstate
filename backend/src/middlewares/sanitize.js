import { ApiError } from "../utils/ApiError.js";

const UNSAFE_KEY = /(^\$)|(^|\.)__proto__($|\.)|(^|\.)constructor($|\.)|(^|\.)prototype($|\.)/;

function findUnsafeKey(value, parent = "") {
  if (!value || typeof value !== "object") return null;
  for (const [key, nested] of Object.entries(value)) {
    const path = parent ? `${parent}.${key}` : key;
    if (UNSAFE_KEY.test(path)) return path;
    const found = findUnsafeKey(nested, path);
    if (found) return found;
  }
  return null;
}

export function rejectUnsafeInput(request, _response, next) {
  for (const [location, value] of [["body", request.body], ["query", request.query], ["params", request.params]]) {
    const key = findUnsafeKey(value);
    if (key) {
      next(new ApiError(400, `Unsafe ${location} key detected`, "UNSAFE_INPUT", [{ field: key, message: "Key is not allowed" }]));
      return;
    }
  }
  next();
}
