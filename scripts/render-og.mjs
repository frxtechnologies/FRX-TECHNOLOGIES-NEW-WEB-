#!/usr/bin/env node
/**
 * Renders scripts/og-template.html to public/brand/og.jpg (1200×630, <300 KB — the size
 * WhatsApp and most chat apps require for a rich preview).
 *
 *   npm i --no-save puppeteer-core     # one-off; not a project dependency
 *   node scripts/render-og.mjs "C:/Program Files/Google/Chrome/Application/chrome.exe"
 */
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const chrome = process.argv[2] ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const html = fileURLToPath(new URL("./og-template.html", import.meta.url));
const out = fileURLToPath(new URL("../public/brand/og.jpg", import.meta.url));

const browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--no-sandbox", "--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: "png" });
await browser.close();
const jpg = await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
fs.writeFileSync(out, jpg);
console.log("og.jpg written", jpg.length, "bytes");
