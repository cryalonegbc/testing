const assert = require("assert");
const { Builder, Browser, By, Key } = require("selenium-webdriver");
const LambdaPage = require("../../pages/lambda/lambda_page");
const { beforeEach, afterEach } = require("mocha");

describe("Lambda-test", async function () {
    beforeEach(async function () {
        await LambdaPage.open();
    });

    it("открывает лямбда-тест, ищет 5 of 5 remaining, зачеркивает 5 первых пунктов, добавляет новый и зачеркивает его", async function () {
        try {
            const totalItems = 5;
            let remainingItems = 5;

            for (let i = 1; i <= totalItems; i++) {
                let remainingElement = await driver.findElement(
                    By.xpath("//span[@class='ng-binding']")
                );
                let text = await remainingElement.getText();
                let expectedText = `${remainingItems} of ${totalItems} remaining`;
                assert.equal(text, expectedText);

                let itemClass = await LambdaPage.getItemClass(i);
                assert.equal(itemClass, "done-false");

                await LambdaPage.toggleItem(i);
                await driver.sleep(1000);

                itemClass = await LambdaPage.getItemClass(i);
                assert.equal(itemClass, "done-true");

                remainingItems--;
            }

            await driver.sleep(1000);
            await LambdaPage.addNewItem("New item");

            let newItemText = await LambdaPage.getItemText(6);
            assert.equal(newItemText, "New item");

            let newItemClass = await LambdaPage.getItemClass(6);
            assert.equal(newItemClass, "done-false");

            await driver.sleep(1000);
            await LambdaPage.toggleItem(6);

            newItemClass = await LambdaPage.getItemClass(6);
            assert.equal(newItemClass, "done-true");
        } catch (err) {
            console.error("Ошибка в тесте: ", err);
        } finally {
            await driver.sleep(500);
        }
    });

    afterEach(async function () {
        await LambdaPage.closeBrowser();
    });
});