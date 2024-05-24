const { By } = require('selenium-webdriver');
class MobilePage{
    constructor(driver) {
      this.driver = driver;
    }
    async checkPage() {
        console.log('проверка старницы Игровые телефоны');
            const lala = await this.driver.findElement(By.xpath("/html/body/div[1]/div/div[4]/div/div/div[2]/div/div/div[2]/div/div/div/div/div/div/div/div/div/div/div/h1")).getText();
            return lala;
    }
    async logElements() {
        console.log('вывод первых 5 элементов');
        let name = await this.driver.findElements(By.xpath('//div[@data-auto="SerpList"]/child::div//div[@class="m4M-1"]//h3'));
        let price = await this.driver.findElements(By.xpath('//div[@data-auto="SerpList"]/child::div//span[@class="_1ArMm"]'));
        for (let i = 0; i < 5; i++) {
            console.log(`Элемент ${i+1}: ${await name[i].getText()} стоит ${price[i].getText()} руб.`);
        }
    }
    async setFilter() {
        console.log('установка фильтра Samsung');
        let filtername = await this.driver.findElements(By.xpath('//div[@data-auto="filter"]/child::div//div[@data-zone-name="FilterValue"]//span[2]'))
        for (let i=0; i< await filtername.length; i++){
            let filter = await filtername[i].getText();
            if (filter === "Samsung"){
                await filtername[i].click();
                break;
            }
        }
        await this.driver.sleep(2000);
    }
    async checkName() {
        console.log('проверка Samsung');
        let name = await this.driver.findElements(By.xpath('//div[@data-auto="SerpList"]/child::div//div[@class="m4M-1"]//h3'));
        let price = await this.driver.findElements(By.xpath('//div[@data-auto="SerpList"]/child::div//span[@class="_1ArMm"]'));
        let containsSamsung = true;
        
        for (let i = 0; i < 10; i++) {
            let elementName = await name[i].getText();
            if (elementName.includes("Samsung")) {
                console.log(`Элемент ${i+1}: ${await name[i].getText()} стоит ${await price[i].getText()} руб.`);
            } else {
                containsSamsung = false;
            }
        }
        
        return containsSamsung;
    }
}
module.exports = MobilePage;