import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { AxePuppeteer } from "@axe-core/puppeteer";

// @sparticuz/chromium args contain --single-process and --no-zygote which crash
// real Chrome on macOS — only use them in the serverless (production) context.
const LOCAL_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
];

export async function runScan(url: string) {
  const isLocal = process.env.NODE_ENV === "development";

  const executablePath = isLocal
    ? process.env.LOCAL_CHROME_PATH
    : await chromium.executablePath();

  const args = isLocal ? LOCAL_ARGS : chromium.args;

  console.log(`[scanner] isLocal=${isLocal} executablePath=${executablePath}`);
  console.log(`[scanner] launching Chrome…`);

  const browser = await puppeteer.launch({
    args,
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    console.log(`[scanner] navigating to ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 });
    console.log(`[scanner] page loaded, running axe-core`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await new AxePuppeteer(page as any).analyze();
    console.log(`[scanner] axe done — ${results.violations.length} violations`);
    return results;
  } finally {
    await browser.close();
  }
}
