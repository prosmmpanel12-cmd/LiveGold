const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

module.exports = async (req, res) => {
  let browser;

  try {

    browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: true,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();

    await page.goto("http://anjujewellery.in/", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 6000));

    const data = await page.evaluate(() => {

      function getBox(title) {
        const headers = Array.from(document.querySelectorAll("div"))
          .filter(d => d.innerText && d.innerText.includes(title));

        if (!headers.length) return null;

        const box = headers[0].closest("div");
        if (!box) return null;

        const spans = box.querySelectorAll("span");
        const nums = Array.from(spans)
          .map(s => s.innerText.trim())
          .filter(v => /^[0-9]/.test(v));

        return {
          bid: nums[0] || null,
          ask: nums[1] || null,
          high: nums[2] || null,
          low: nums[3] || null
        };
      }

      return {
        spots: {
          gold: getBox("GOLD SPOT"),
          silver: getBox("SILVER SPOT"),
          inr: getBox("INR SPOT")
        }
      };
    });

    res.json({ status: "ok", data });

  } catch (err) {
    res.json({ status: "error", error: err.message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};