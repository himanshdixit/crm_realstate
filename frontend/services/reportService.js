import { apiClient } from "./apiClient";

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const reportService = Object.freeze({
  async export(resource, format) {
    const response = await apiClient.get(`/reports/${format}`, { params: { resource }, responseType: "blob" });
    download(response.data, `${resource}-report.${format === "excel" ? "xls" : "pdf"}`);
  },
});
