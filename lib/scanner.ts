import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { AxePuppeteer } from "@axe-core/puppeteer";

export async function runScan(url: string) {
  const isLocal = process.env.NODE_ENV === "development";
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: isLocal
      ? process.env.LOCAL_CHROME_PATH // ex: /usr/bin/chromium ou chemin macOS
      : await chromium.executablePath(),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await new AxePuppeteer(page as any).analyze(); // { violations, passes, ... }
  } finally {
    await browser.close();
  }
}
