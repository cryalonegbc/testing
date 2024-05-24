const { Builder, Browser, By, until } = require('selenium-webdriver');
const fs = require('fs');
const SLEEP_TIME12 = 120000;
const SLEEP_TIME5 = 20000;
const SLEEP_TIME7 = 40000;

const withErrorHandling = (fn, handler) => {
    return async () => {
        try {
            await fn();
        } catch (error) {
            console.error(error);
            await handler();
        }
    };
};

class BasePage {
    constructor() {
        this.driver = new Builder().forBrowser(Browser.CHROME).build();
        this.driver.manage().setTimeouts({ implicit: 5000 });
    }

    async goToUrl(url) {
        await this.driver.get(url);
    }

    async enterText(locator, text) {
        await this.driver.findElement(locator).sendKeys(text);
    }

    async getText(locator) {
        return await this.driver.findElement(locator).getText();
    }

    async click(locator) {
        if (await this.isDriverActive()) {
            await this.driver.findElement(locator).click();
        } else {
            throw new Error('Driver is not active');
        }
    }
    
    async isDriverActive() {
        try {
            await this.driver.getTitle();
            return true;
        } catch (error) {
            return false;
        }
    }
    async isElementPresent(locator) {
        try {
            await this.driver.wait(until.elementIsVisible(this.driver.findElement(locator)), 10000);
            return true;
        } catch (error) {
            return false;
        }
    }

    async clickElement(locator) {
        await this.driver.wait(until.elementIsVisible(this.driver.findElement(locator)), 10000);
        await this.driver.findElement(locator).click();
    }

    async getTextFromElement(locator) {
        await this.driver.wait(until.elementIsVisible(this.driver.findElement(locator)), 10000);
        return await this.driver.findElement(locator).getText();
    }

    async getTextFromMultipleElements(locator) {
        const elements = await this.driver.findElements(locator);
        const texts = [];
        for (const element of elements) {
            texts.push(await element.getText());
        }
        return texts;
    }

    async saveScreenshot(fileName) {
        await this.driver.takeScreenshot().then((img) => {
            fs.writeFileSync(fileName, img, 'base64');
        });
    }

    async closeBrowser(delay = 0) {
        if (delay) await this.driver.sleep(delay);
        await this.driver.quit();
    }
}

class EbayPage extends BasePage {
    constructor() {
        super();
        this.URL = 'https://www.ebay.com/';
        this.xpathSearchBox = "//*[@id='gh-ac']";
        this.xpathSearchButton = "//*[@id='gh-btn']";
        this.xpathItemTitles = "//h3[@class='s-item__title']";
        this.xpathItemPrices = "//span[@class='s-item__price']";
        this.xpathAddToWatchlist = "//a[contains(@class, 'watchlink')]";
        this.xpathWatchlist = "//*[@id='gh-wl-click']";
        this.xpathRemoveFromWatchlist = "//a[contains(@class, 'watch-rem')]";
    }

    async openPage() {
        await this.goToUrl(this.URL);
    }

    async searchForItem(item) {
        await this.enterText(By.xpath(this.xpathSearchBox), item);
        await this.clickElement(By.xpath(this.xpathSearchButton));
    }

    async logElements() {
        const itemTitles = await this.driver.findElements(By.xpath(this.xpathItemTitles));
        const itemPrices = await this.driver.findElements(By.xpath(this.xpathItemPrices));
        const elements = await Promise.all(itemTitles.slice(0, 5).map(async (el, i) => [await el.getText(), await itemPrices[i].getText()]));
        for (let [title, price] of elements) {
            console.log(title, price);
        }
        return elements;
    }

    async addToWatchlist() {
        await this.click(By.xpath(this.xpathAddToWatchlist));
    }

    async openWatchlist() {
        await this.click(By.xpath(this.xpathWatchlist));
    }

    async getWatchlistItems() {
        const titles = await this.getTextFromMultipleElements(By.xpath(this.xpathItemTitles));
        const prices = await this.getTextFromMultipleElements(By.xpath(this.xpathItemPrices));
        return [titles, prices];
    }

    async removeFromWatchlist() {
        if (await this.isElementPresent(By.xpath(this.xpathRemoveFromWatchlist))) {
            await this.clickElement(By.xpath(this.xpathRemoveFromWatchlist));
        } else {
            console.log("Element 'Remove from watchlist' not found");
        }
    }

    async refreshPage() {
        await this.driver.navigate().refresh();
    }

    async getSaveText() {
        const elem = await this.driver.findElement(By.xpath(this.xpathSave));
        return await elem.getText();
    }
}

describe("eBay test", function () {
    this.timeout(100000);
    const ebayPage = new EbayPage();
    let firstElem;

    before(async () => {
        await ebayPage.openPage();
    });

    after(async () => {
        await ebayPage.closeBrowser();
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            const dateTime = new Date().toLocaleDateString();
            await ebayPage.saveScreenshot(dateTime);
        }
    });

    it(
        "search for item",
        withErrorHandling(
            async () => {
                await ebayPage.searchForItem("Xbox");
                await ebayPage.driver.sleep(SLEEP_TIME12);
            },
            async () => await ebayPage.saveScreenshot("error.png"),
        )
    );

    it(
        "log titles and prices of items",
        withErrorHandling(
            async () => {
                firstElem = await ebayPage.logElements();
                await ebayPage.driver.sleep(SLEEP_TIME7);
            },
            async () => await ebayPage.saveScreenshot("error.png"),
        )
    );

    it(
        "add to watchlist",
        withErrorHandling(
            async () => {
                await ebayPage.addToWatchlist();
            },
            async () => await ebayPage.saveScreenshot("error.png")
        )
    );

    it(
        "open watchlist",
        withErrorHandling(
            async () => {
                await ebayPage.openWatchlist();
                await ebayPage.driver.sleep(SLEEP_TIME5);
            },
            async () => await ebayPage.saveScreenshot("error.png")
        )
    );

    it(
        "remove from watchlist",
        withErrorHandling(
            async () => {
                if (await ebayPage.isElementPresent(By.xpath(ebayPage.xpathRemoveFromWatchlist))) {
                    await ebayPage.clickElement(By.xpath(ebayPage.xpathRemoveFromWatchlist));
                } else {
                    console.log("Element 'Remove from watchlist' not found");
                }
                await ebayPage.driver.sleep(SLEEP_TIME7);
            },
            async () => await ebayPage.saveScreenshot("error.png")
        )
    );

    it(
        "check watchlist",
        withErrorHandling(
            async () => {
                if (await ebayPage.isElementPresent(By.xpath(ebayPage.xpathItemTitles)) &&
                    await ebayPage.isElementPresent(By.xpath(ebayPage.xpathItemPrices))) {
                    const [title, price] = await ebayPage.getWatchlistItems();
                    if (title[0] !== firstElem[0][0] || price[0] !== firstElem[0][1]) {
                        throw new Error(`Expected title: ${firstElem[0][0]}, price: ${firstElem[0][1]}. Actual title: ${title[0]}, price: ${price[0]}`);
                    }
                } else {
                    console.log("Elements on the 'Watchlist' page not found");
                }
                await ebayPage.driver.sleep(SLEEP_TIME7);
            },
            async () => await ebayPage.saveScreenshot("error.png")
        )
    );

    it(
        "refresh page",
        withErrorHandling(
            async () => {
                await ebayPage.refreshPage();
                const savedText = await ebayPage.getTextFromElement(By.xpath(ebayPage.xpathSave));
                if (savedText !== "Saved") {
                    throw new Error(`Expected "Saved", got "${savedText}"`);
                }
                await ebayPage.driver.sleep(SLEEP_TIME7);
            },
            async () => await ebayPage.saveScreenshot("error.png")
        )
    );
});