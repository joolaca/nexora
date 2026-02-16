#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

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
    "public", // frontend assetek (ha backendben nincs, nem baj)
]);

const IGNORE_EXTS = new Set([
    // képek / assetek
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
    // média
    ".mp4", ".mov", ".avi",
    // archive
    ".zip", ".7z", ".rar",
    // egyéb
    ".pdf",
]);
// ------------------------

function shouldIgnoreDir(dirName) {
    return IGNORE_DIRS.has(dirName);
}

function shouldIgnoreFile(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    return IGNORE_EXTS.has(ext);
}

async function zipDirectory({ projectRoot, targetPath, outFile }) {
    await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outFile);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => resolve());
        output.on("error", reject);

        archive.on("warning", (err) => {
            // pl. ENOENT: fájl közben eltűnt -> nem állítjuk meg
            if (err.code === "ENOENT") console.warn("⚠️", err.message);
            else reject(err);
        });
        archive.on("error", reject);

        archive.pipe(output);

        // rekurzív bejárás és file-ok hozzáadása zip-hez
        function walk(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    if (shouldIgnoreDir(entry.name)) continue;
                    walk(fullPath);
                    continue;
                }

                if (!entry.isFile()) continue;
                if (shouldIgnoreFile(entry.name)) continue;

                // ZIP-ben a path: a target könyvtártól relatív legyen
                // pl. target=backend/src -> zipben: src/app.module.ts
                const zipPath = path
                    .relative(targetPath, fullPath)
                    .replaceAll("\\", "/");

                archive.file(fullPath, { name: zipPath });
            }
        }

        walk(targetPath);

        // plusz: egy rövid manifest a zip gyökerébe
        const manifest = {
            target: path.relative(projectRoot, targetPath).replaceAll("\\", "/"),
            createdAt: new Date().toISOString(),
            ignoreDirs: [...IGNORE_DIRS],
            ignoreExts: [...IGNORE_EXTS],
        };
        archive.append(JSON.stringify(manifest, null, 2), { name: "_manifest.json" });

        archive.finalize();
    });
}

async function main() {
    const target = process.argv[2];

    if (!target) {
        console.error("Usage: node scripts/zip-folder.cjs <relativePath>");
        process.exit(1);
    }

    const projectRoot = process.cwd();
    const targetPath = path.resolve(projectRoot, target);

    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
        console.error("❌ Invalid directory:", target);
        process.exit(1);
    }

    // Output directory: scripts/bundles
    const outputDir = path.join(projectRoot, "scripts");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // pl: target="src/users" -> bundle_src_users.zip
    const safeName = target.replace(/[\\/]/g, "_");
    const outFile = path.join(outputDir, `zip_${safeName}.zip`);

    console.log("📦 Zipping:", target, "->", path.relative(projectRoot, outFile));
    await zipDirectory({ projectRoot, targetPath, outFile });
    console.log("✅ ZIP created:", outFile);
}

main().catch((err) => {
    console.error("❌ ZIP failed:", err);
    process.exit(1);
});
