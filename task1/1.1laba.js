const { Builder, By } = require('selenium-webdriver');
const assert = require('assert');

class Page {
   constructor(driver) {
       this.driver = driver;
   }

   async findElementByXPath(xpath) {
       return await this.driver.findElement(By.xpath(xpath));
   }

   async clickElementByXPath(xpath) {
       let element = await this.findElementByXPath(xpath);
       await element.click();
   }

   async findElementById(id) {
       return await this.driver.findElement(By.id(id));
   }
}

class TodoAppPage extends Page {
   constructor(driver) {
       super(driver);
       this.total = 5;
       this.remaining = 5;
   }

   async open() {
       await this.driver.get("https://lambdatest.github.io/sample-todo-app/");
       await this.driver.manage().window().maximize();
   }

   async verifyPageTitle() {
       let pageTitleElement = await this.findElementByXPath(`//h2`);
       let pageTitle = await pageTitleElement.getText();
       assert.equal(pageTitle, "LambdaTest Sample App", "Заголовок страницы не соответствует ожидаемому");
   }

   async verifyRemainingTasks() {
       let textElement = await this.findElementByXPath(`//span[contains(@class, 'ng-binding')]`);
       let text = await textElement.getText();
       assert.equal(text, `${this.remaining} of ${this.total} remaining`);
   }

   async clickFirstTask() {
       let firstListItem = await this.findElementByXPath(`//ul/li[1]`);
       await firstListItem.click();
   }

   async completeAllTasks() {
       for (let i = 1; i <= this.total; i++) {
           await this.clickElementByXPath(`//ul/li[${i}]/input`);
           await this.driver.sleep(500); 
       }
   }

   async addNewTask() {
       await (await this.findElementById("sampletodotext")).sendKeys("Sixth Item");
       await (await this.findElementById("addbutton")).click();
       this.total++;
       this.remaining++;
       await this.driver.sleep(1000); 
   }

   async verifyNewItem() {
       let newItem = await this.findElementByXPath("//ul/li[last()]");
       await newItem.click();
   }

   async takeScreenshot() {
       let image = await this.driver.takeScreenshot();
       require('fs').writeFileSync('screenshot_error.png', image, 'base64');
   }
}

async function Task1Test() {
   let driver;
   try {
       driver = await new Builder().forBrowser('chrome').build();
       let page = new TodoAppPage(driver);
       await page.open();
       await page.verifyPageTitle();
       await page.verifyRemainingTasks();
       await page.clickFirstTask();
       await page.completeAllTasks();
       await page.addNewTask();
       await page.verifyNewItem();
       console.log('Всё работает');
   } catch (err) {
       let page = new TodoAppPage(driver);
       await page.takeScreenshot();
       console.error('Тест сломался по причине: %s', err);
   } finally {
       if (driver) {
           await driver.quit();
       }
   }
}

Task1Test();
