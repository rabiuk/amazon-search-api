const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

const amazonScraperAgent = async (item) => {
  let browser;
  let results;
  try {
    browser = await puppeteer.launch({ headless: "new", fullPage: true });
    const page = await browser.newPage();
    await page.goto(`https://www.amazon.com/s?k=${item}`);
    await page.waitForSelector(".s-result-item");

    results = await page.evaluate(() => {
      const itemNodes = document.querySelectorAll(".s-result-item");
      const items = Array.from(itemNodes);
      const results = [];

      items.forEach((item) => {
        const titleElement = item.querySelector(".a-text-normal");
        const ratingElement = item.querySelector(".a-icon-alt");
        const priceElement = item.querySelector(".a-offscreen");
        const linkElement = item.querySelector(".a-link-normal");

        // Only add the item to results if all properties are present
        if (titleElement && ratingElement && priceElement && linkElement) {
          results.push({
            title: titleElement.innerText,
            rating: ratingElement.innerText,
            price: priceElement.innerText,
            link: linkElement.href,
          });
        }
      });

      return results;
    });
  } catch (error) {
    console.error("Error in amazonScraperAgent:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return results;
};

app.get("/api/search/:item", async (req, res) => {
  const item = req.params.item;
  const results = await amazonScraperAgent(item);
  res.json(results);
});

module.exports = app;

amazonScraperAgent("headphoens").then(console.log).catch(console.error);
