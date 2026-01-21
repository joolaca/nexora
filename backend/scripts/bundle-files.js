#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// -------- Config --------
const IGNORE_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    ".cache",
    ".vscode",
    ".idea",
]);

const IGNORE_EXTS = new Set([
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
    ".mp4", ".mov", ".avi",
    ".zip", ".7z", ".rar",
    ".pdf",
]);
// ------------------------

function collectFiles(dir, result = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (IGNORE_DIRS.has(entry.name)) continue;
            collectFiles(fullPath, result);
            continue;
        }

        if (!entry.isFile()) continue;

        const ext = path.extname(entry.name).toLowerCase();
        if (IGNORE_EXTS.has(ext)) continue;

        result.push(fullPath);
    }

    return result;
}

function main() {
    const target = process.argv[2];

    if (!target) {
        console.error("Usage: node scripts/bundle-files.js <relativePath>");
        process.exit(1);
    }

    const projectRoot = process.cwd();
    const targetPath = path.resolve(projectRoot, target);

    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
        console.error("❌ Invalid directory:", target);
        process.exit(1);
    }

    const files = collectFiles(targetPath).sort();

    // 👉 Output directory: backend/src/script
    const outputDir = path.join(projectRoot, "scripts");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const safeName = target.replace(/[\\/]/g, "_");
    const outFile = path.join(outputDir, `bundle_${safeName}.txt`);

    let output = "";
    output += `=== FILE BUNDLE ===\n`;
    output += `Target: ${target}\n`;
    output += `Files: ${files.length}\n\n`;

    for (const file of files) {
        const relative = path.relative(projectRoot, file).replaceAll("\\", "/");
        const content = fs.readFileSync(file, "utf8");

        output += `\n===== FILE: ${relative} =====\n`;
        output += content + "\n";
    }

    fs.writeFileSync(outFile, output, "utf8");

    console.log(`✅ Bundle created: ${outFile}`);
}

main();
