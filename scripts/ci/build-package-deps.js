#!/usr/bin/env node
/**
 * Build all file: dependencies (transitive) for a utils package so CI can typecheck/build it.
 * Usage: node scripts/ci/build-package-deps.js <package-path>
 * Example: node scripts/ci/build-package-deps.js utils/@simpill-api.utils
 * Run from repo root. Builds each dep in topological order (npm ci && npm run build).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "../..");
const packagePath = process.argv[2];
if (!packagePath || !packagePath.startsWith("utils/")) {
  process.stderr.write("Usage: node scripts/ci/build-package-deps.js utils/@simpill-<name>.utils\n");
  process.exit(1);
}

const packageDir = path.join(repoRoot, packagePath);
const packageJsonPath = path.join(packageDir, "package.json");
if (!fs.existsSync(packageJsonPath)) {
  process.stderr.write(`package.json not found: ${packageJsonPath}\n`);
  process.exit(1);
}

/** @type {Record<string, string[]>} */
const depGraph = {};
function getFileDeps(pkgPath) {
  const key = pkgPath.replace(/\\/g, "/");
  if (depGraph[key]) return depGraph[key];
  const pkgJsonPath = path.join(repoRoot, pkgPath, "package.json");
  if (!fs.existsSync(pkgJsonPath)) return (depGraph[key] = []);
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  const deps = { ...pkg.dependencies, ...(pkg.devDependencies || {}) };
  const fileDeps = [];
  for (const value of Object.values(deps)) {
    if (typeof value === "string" && value.startsWith("file:../")) {
      const depDir = value.replace(/^file:\.\.\//, "").replace(/\\/g, "/");
      const depPath = path.dirname(pkgPath) + "/" + depDir;
      fileDeps.push(depPath.replace(/\\/g, "/"));
    }
  }
  depGraph[key] = fileDeps;
  return fileDeps;
}

function collectTransitive(pkgPath, set) {
  const deps = getFileDeps(pkgPath);
  for (const d of deps) {
    if (set.has(d)) continue;
    set.add(d);
    collectTransitive(d, set);
  }
}

function topologicalSort(pkgPath) {
  const all = new Set();
  collectTransitive(pkgPath, all);
  const order = [];
  const visited = new Set();
  function visit(n) {
    if (visited.has(n)) return;
    visited.add(n);
    for (const d of getFileDeps(n)) {
      if (all.has(d)) visit(d);
    }
    order.push(n);
  }
  for (const n of all) visit(n);
  return order;
}

const depsToBuild = topologicalSort(packagePath);
if (depsToBuild.length === 0) {
  process.exit(0);
}

for (const dep of depsToBuild) {
  const abs = path.join(repoRoot, dep);
  process.stdout.write(`Building dependency: ${dep}\n`);
  execSync("npm ci", { cwd: abs, stdio: "inherit" });
  execSync("npm run build", { cwd: abs, stdio: "inherit" });
}
