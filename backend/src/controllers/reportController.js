import PDFDocument from "pdfkit";
import { resourceRegistry } from "../config/resourceRegistry.js";
import { ApiError } from "../utils/ApiError.js";

const MAX_EXPORT_ROWS = 5000;
const blockedColumns = new Set(["organization", "deletedAt", "deletedBy", "createdBy", "updatedBy", "__v"]);

function getExport(request) {
  const resourceName = String(request.query.resource || "");
  const resource = resourceRegistry[resourceName];
  if (!resource) throw new ApiError(400, "A valid report resource is required", "INVALID_REPORT_RESOURCE");
  if (!request.auth.permissions.includes(`${resource.permission}.read`)) throw new ApiError(403, "You cannot export this resource", "PERMISSION_DENIED");
  return { resourceName, resource };
}

async function rowsFor(request, resource) {
  const organization = request.auth.user.organization || null;
  return resource.model.find({ organization, deletedAt: null }).sort({ createdAt: -1 }).limit(MAX_EXPORT_ROWS).lean();
}

function columnsFor(resource, rows) {
  const candidates = [...resource.fields, "createdAt", "updatedAt"];
  return [...new Set(candidates)].filter((column) => !blockedColumns.has(column) && rows.some((row) => row[column] !== undefined));
}

function display(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function xml(value) { return display(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }

export async function exportExcel(request, response) {
  const { resourceName, resource } = getExport(request);
  const rows = await rowsFor(request, resource);
  const columns = columnsFor(resource, rows);
  const header = columns.map((key) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${xml(key.replace(/([A-Z])/g, " $1").trim())}</Data></Cell>`).join("");
  const body = rows.map((row) => `<Row>${columns.map((key) => `<Cell><Data ss:Type="String">${xml(row[key])}</Data></Cell>`).join("")}</Row>`).join("");
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#2563EB" ss:Pattern="Solid"/></Style></Styles><Worksheet ss:Name="${xml(resourceName.slice(0, 31))}"><Table><Row>${header}</Row>${body}</Table></Worksheet></Workbook>`;
  response.set({ "Content-Type": "application/vnd.ms-excel; charset=utf-8", "Content-Disposition": `attachment; filename="${resourceName}-${Date.now()}.xls"` });
  response.send(workbook);
}

export async function exportPdf(request, response) {
  const { resourceName, resource } = getExport(request);
  const rows = await rowsFor(request, resource);
  const columns = columnsFor(resource, rows).slice(0, 6);
  response.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${resourceName}-${Date.now()}.pdf"` });
  const document = new PDFDocument({ margin: 36, size: "A4", layout: "landscape", info: { Title: `${resourceName} report`, Author: "EstateFlow" } });
  document.pipe(response);
  document.fontSize(20).text(`${resourceName.replaceAll("-", " ")} report`);
  document.fontSize(9).fillColor("#64748b").text(`Generated ${new Date().toISOString()} · ${rows.length} records`);
  document.moveDown().fillColor("#0f172a");
  rows.forEach((row, index) => {
    if (document.y > 520) document.addPage();
    document.fontSize(9).font("Helvetica-Bold").text(`#${index + 1}`, { continued: true }).font("Helvetica").text(`  ${columns.map((key) => `${key}: ${display(row[key]).slice(0, 80)}`).join("  |  ")}`);
    document.moveDown(0.4);
  });
  document.end();
}
