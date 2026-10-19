import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const strict = process.argv.includes("--strict");
const checks = [];
const check = (name, passed, level = "required", detail = "") => checks.push({ name, passed, level, detail });
const file = (relative) => existsSync(path.join(root, relative));
const command = (program, args) => spawnSync(program, args, { cwd: root, shell: process.platform === "win32", encoding: "utf8" });

const requiredFiles = [
  "backend/package-lock.json", "frontend/package-lock.json", "backend/Dockerfile", "frontend/Dockerfile",
  "compose.yaml", ".env.docker.example", "frontend/vercel.json",
  ".github/workflows/ci.yml", ".github/workflows/security.yml", ".github/workflows/deploy.yml",
  "scripts/production-smoke.mjs", "scripts/deploy-render.mjs", "PHASE-10-DEPLOYMENT.md", "PHASE-11-OPTIMIZATION.md",
];
for (const relative of requiredFiles) check(`Required artifact: ${relative}`, file(relative), "required");

check("No backend secret file committed", !file("backend/.env"), "required");
check("No frontend secret file committed", !file("frontend/.env"), "required");
check("No Docker secret file committed", !file(".env.docker"), "required");

for (const project of ["backend", "frontend"]) {
  const manifest = JSON.parse(readFileSync(path.join(root, project, "package.json"), "utf8"));
  check(`${project} uses a lockfile`, file(`${project}/package-lock.json`), "required");
  check(`${project} provides lint`, Boolean(manifest.scripts?.lint), "required");
  check(`${project} provides tests`, Boolean(manifest.scripts?.test), "required");
  check(`${project} provides deployment validation`, Boolean(manifest.scripts?.["deploy:check"]), "required");
}

const git = command("git", ["rev-parse", "--is-inside-work-tree"]);
check("Git repository initialized", git.status === 0 && git.stdout.trim() === "true", "external", "Initialize and connect the repository before release");
const docker = command("docker", ["version", "--format", "{{.Server.Version}}"]);
check("Docker engine available", docker.status === 0, "external", "Required for local container validation; CI can provide Docker instead");

const productionVariables = ["PRODUCTION_API_URL", "PRODUCTION_FRONTEND_URL", "RENDER_SERVICE_ID", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"];
const productionSecrets = ["RENDER_API_KEY", "VERCEL_TOKEN"];
for (const name of productionVariables) check(`Production variable configured: ${name}`, Boolean(process.env[name]), "external", "Configure in the protected GitHub production environment");
for (const name of productionSecrets) check(`Production secret configured: ${name}`, Boolean(process.env[name]), "external", "Configure as a protected GitHub environment secret");

const failures = checks.filter(({ passed }) => !passed);
for (const item of checks) process.stdout.write(`${item.passed ? "PASS" : item.level === "external" ? "BLOCKED" : "FAIL"}: ${item.name}${!item.passed && item.detail ? ` — ${item.detail}` : ""}\n`);
process.stdout.write(`\n${checks.length - failures.length}/${checks.length} readiness checks currently pass.\n`);

const codeFailures = failures.filter(({ level }) => level === "required");
if (codeFailures.length || (strict && failures.length)) process.exit(1);
