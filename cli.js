#!/usr/bin/env node
import fs from "fs";
import followRedirects from "follow-redirects";
import { fileURLToPath } from "url";
import path from "path";
import { spawn } from "child_process";
const { https } = followRedirects;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = "https://github.com/raiyanu/filecooker/releases/download/0.1.0/filecooker-linux-x64";
const filePath = path.join(__dirname, "filecooker-cli");

const file = fs.createWriteStream(filePath, { mode: 0o755 });

function runBinary(args) {
  const child = spawn(filePath, args, {
    stdio: "inherit",
  });

  child.on("exit", (code) => process.exit(code));
}


https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download. Status: ${res.statusCode}`);
    res.resume();
    return;
  }

  res.pipe(file);

  file.on("finish", () => {
    file.close(() => {
      runBinary(process.argv.slice(2));
    });
  });
}).on("error", (err) => {
  fs.unlink(filePath, () => {}); // cleanup
  console.error("❌ Error:", err.message);
});

