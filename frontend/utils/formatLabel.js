export function formatLabel(value) {
  return String(value || "unknown").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
