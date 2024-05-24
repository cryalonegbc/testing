const { Builder, Browser, By } = require('selenium-webdriver');
const assert = require('assert');
const BrowserType = Browser.CHROME;
const URL = 'https://market.yandex.ru/';
const SLEEP_TIME1 = 1000;
const SLEEP_TIME3 = 3000;
const SLEEP_TIME5 = 5000;
const SLEEP_TIME7 = 7000;

let driver = new Builder().forBrowser(BrowserType).build();

class MainPage {
    constructor(driver) {
        this.driver = driver;
        this.locator = {
            hamburger: By.xpath("//div[@data-zone-name='catalog']"),
            electronics: By.xpath("//span[contains(text(), 'Электроника')]"),
            gamingPhonesUrl: By.xpath("//a[@href='/catalog--igrovye-telefony/54440/list?hid=91491']") // Пример URL для игровых телефонов
        }
    }

    async openURL() {
        await driver.get(URL);
        await driver.manage().window().maximize();
        console.log('✔️  Перейти по ссылке');
        await driver.sleep(SLEEP_TIME1);
    }

    async getElectronics() {
        await this.driver.findElement(this.locator.hamburger).click();
        await this.driver.sleep(SLEEP_TIME5);
        let electronics = await this.driver.findElement(this.locator.electronics);
        await this.driver.sleep(SLEEP_TIME1);
        let element = electronics;
        let action = this.driver.actions({ async: true });
        await action.move({ origin: element }).perform();
        await this.driver.sleep(SLEEP_TIME1);
        let gamingPhonesUrl = await this.driver.findElement(this.locator.gamingPhonesUrl);
        await gamingPhonesUrl.click();
        console.log('✔️  Открыта страница с игровыми телефонами');
        await this.driver.sleep(SLEEP_TIME3);
    }
}

class GamingPhonesPage {
    constructor(driver) {
        this.driver = driver;
        this.variables = {
            nameGamingPhones: [],
            priceGamingPhones: [],
            secondDevice: [],
            secondPrice: [],
        }
        this.locator = {
            getSamsung: By.xpath("//span[contains(text(), 'Samsung')]"),
            getBilliger: By.xpath("//button[contains(text(), 'подешевле')]"),
            getFiveNameGamingPhones: By.xpath("//div[@data-auto-themename='listDetailed']//h3[@data-auto='snippet-title']"),
            getFivePriceGamingPhones: By.xpath("//div[@data-auto-themename='listDetailed']//span[@data-auto='snippet-price-current']"),
            getInput: By.xpath("//div[@data-zone-name='search-input']//input[@id='header-search']"),
            getButton: By.xpath("//button[@data-auto='search-button']"),
        }
    }

    async searchSamsung() {
        await this.driver.findElement(this.locator.getSamsung).click();
        console.log('✔️  Выбран производитель "Samsung"');
        await this.driver.sleep(SLEEP_TIME7);
    }

    async setThePrice() {
        await this.driver.findElement(this.locator.getBilliger).click();
        console.log('✔️  Сортировка списка по цене');
        await this.driver.sleep(SLEEP_TIME1);
    }

    async sortierungList() {
        await this.driver.sleep(SLEEP_TIME5);
        let fiveNameGamingPhones = await this.driver.findElements(this.locator.getFiveNameGamingPhones);
        let fivePriceGamingPhones = await this.driver.findElements(this.locator.getFivePriceGamingPhones);
        await this.driver.sleep(SLEEP_TIME3);
        console.log('=====================');
        console.log('СПИСОК ИГРОВЫХ ТЕЛЕФОНОВ:');
        for (let i = 0; i < 5; i++) {
            this.variables.nameGamingPhones[i] = await fiveNameGamingPhones[i].getText();
            this.variables.priceGamingPhones[i] = await fivePriceGamingPhones[i].getText();
            console.log('------------------');
            console.log('📱 Название: ' + this.variables.nameGamingPhones[i]);
            console.log('💰 Цена: ' + this.variables.priceGamingPhones[i] + ' рублей');
        }
        console.log('=====================');
        console.log('');
        console.log('✔️  Вывод информации об игровых телефонах');
        await this.driver.sleep(SLEEP_TIME3);
    }

    async rememberDevice() {
        this.variables.secondDevice = this.variables.nameGamingPhones[1];
        this.variables.secondPrice = this.variables.priceGamingPhones[1];
        console.log('Название ' + this.variables.secondDevice);
        console.log('Цена ' + this.variables.secondPrice);
        console.log('✔️  Информация о втором устройстве:');
    }

    async deviceSearch() {
        await this.driver.findElement(this.locator.getInput).sendKeys(this.variables.secondDevice);
        await this.driver.sleep(SLEEP_TIME1);
        await this.driver.findElement(this.locator.getButton).click();
        await this.driver.sleep(SLEEP_TIME7);
        console.log('✔️  Поиск устройства');
    }
}

describe('Вариант 2', function () {
    this.timeout(100000);
    it('Переход на страницу с товаром', async function () {
        try {
            let mainPage = new MainPage(driver);
            await mainPage.openURL();
            await mainPage.getElectronics();
        } catch (err) {
            driver.takeScreenshot().then(function (image) {
                require('fs').writeFileSync('screenshot_error.png', image, 'base64');
            });
            console.error('Не работает: %s', err);
        }
    });
    it('Поиск товара по производителю', async function () {
        try {
            let gamingPhonesPage = new GamingPhonesPage(driver);
            await gamingPhonesPage.searchSamsung();
            await gamingPhonesPage.setThePrice();
            await gamingPhonesPage.sortierungList();
            await gamingPhonesPage.rememberDevice();
            await gamingPhonesPage.deviceSearch();

            let allDevices = await driver.findElements(gamingPhonesPage.locator.getFiveNameGamingPhones);
            let thisFirstDevice = allDevices[0];
            let thisFirstDeviceText = await thisFirstDevice.getText();
            assert.strictEqual(thisFirstDeviceText, gamingPhonesPage.variables.secondDevice, 'Названия не совпадают');
        } catch (err) {
            driver.takeScreenshot().then(function (image) {
                require('fs').writeFileSync('screenshot_error.png', image, 'base64');
            });
            console.error('Не работает: %s', err);
        }
    })
    after(async function () {
        await driver.quit();
    });
});
