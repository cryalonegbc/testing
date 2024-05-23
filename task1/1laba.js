const { Builder, By } = require('selenium-webdriver');
const assert = require('assert');

async function lambdaTest() {
    const total = 5;
    let remaining = 5;

    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get("https://lambdatest.github.io/sample-todo-app/");
        let titleTagText = await driver.getTitle();
        assert.equal(titleTagText, "Sample page - lambdatest.com");

        
        await driver.manage().window().maximize();
        await driver.sleep(1000); 

        for (let i = 1; i <= total; i++) {
            let remainingElem = await driver.findElement(By.xpath("//span[@class='ng-binding']"));
            let text = await remainingElem.getText();
            let expectedText = `${remaining} of ${total} remaining`;
            assert.equal(text, expectedText);

            let item = await driver.findElement(By.xpath(`//input[@name='li${i}']/following-sibling::span`));
            let itemClass = await item.getAttribute("class");
            assert.equal(itemClass, "done-false");
            await driver.findElement(By.name("li" + i)).click();
            remaining--;

            await driver.sleep(500);

            itemClass = await item.getAttribute("class");
            assert.equal(itemClass, "done-true");
        }

        await driver.findElement(By.id("sampletodotext")).sendKeys("New Item");
        await driver.sleep(1000); 
        await driver.findElement(By.id("addbutton")).click();

        let item = await driver.findElement(By.xpath("//input[@name='li6']/following-sibling::span"));
        let itemText = await item.getText();
        let itemClass = await item.getAttribute("class");
        assert.equal(itemText, "New Item");
        assert.equal(itemClass, "done-false");

        await driver.sleep(500);

        await driver.findElement(By.name("li6")).click();
        itemClass = await item.getAttribute("class");
        assert.equal(itemClass, "done-true");

        await driver.sleep(2000);

    } catch (err) {
        let image = await driver.takeScreenshot();
        require('fs').writeFileSync('screenshot_error.png', image, 'base64');
        console.error('Тест упал по причине ошибки: %s', err);
    } finally {
        await driver.quit();
    }
}

lambdaTest();
