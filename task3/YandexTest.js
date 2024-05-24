const { assert, expect } = require('chai');
const { Builder, Browser } = require('selenium-webdriver');
const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const StartPage = require('./yandex-tests/StartPage');
const MobilePage = require('./yandex-tests/MobilePage');

describe('Yandex Test', () => {
    let driver;
    let startPage;
    let mobilePage;

    before(async () => {
        driver = await new Builder().forBrowser(Browser.CHROME).build();
        startPage = new StartPage(driver);
        mobilePage = new MobilePage(driver);
    });

    after(async () => {
        await driver.quit();
    });

    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            const screenshot = await driver.takeScreenshot();
            const testCaseName = this.currentTest.title.replace(/\s+/g, '-').toLowerCase();
            const dateTime = new Date().toISOString().replace(/[-:.]/g, '');
            const fileName = {testCaseName}-{dateTime}.png;
            await writeFileAsync(fileName, screenshot, 'base64');
        }
    });

    it('should search for Samsung phones', async () => {
        await startPage.open();
        const size = await startPage.checkStartPage();
        expect(size).to.have.length.above(0);
        await startPage.clickCatalog();
        await startPage.hoverGaming();
        await startPage.clickGamingPhone();
        const header = await mobilePage.checkPage();
        expect(header).to.equal("Игровые телефоны");
        await mobilePage.logElements();
        await mobilePage.setFilter();
        const name = await mobilePage.checkName();
        expect(name).to.be.true;
    });
});