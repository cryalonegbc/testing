const { By } = require('selenium-webdriver');
class StartPage{
    constructor(driver) {
      this.driver = driver;
    }
    async open() {
        console.log('открытие стартовой страницы');
      await this.driver.get('https://market.yandex.ru');
      await this.driver.manage().window().maximize();
    }
    async checkStartPage() {
        console.log('проверка стартовой страницы');
        const size =await this.driver.findElements(By.className("_3lpeU _6tyDq _1ea6I _2Imo_")).then(found => !!found.length);;
        return size;
    }
    async clickCatalog() {
        console.log('клик по каталогу');
        await this.driver.findElement(By.xpath("//div[@data-zone-name='catalog']")).click();
        await this.driver.sleep(2000);
    }
    async hoverGaming() {
        console.log('наведение на Все для гейминга');
        const gamingLink = await this.driver.findElement(By.xpath("//a[@href='/catalog--geiming/41813350']"));
        const actions = this.driver.actions({ async: true });
        await actions.move({ origin: gamingLink }).perform();
        await this.driver.sleep(2000);
    }
    async clickGamingPhone(){
        console.log('клик по телефонам');
        await this.driver.findElement(By.xpath("//a[@href='/catalog--igrovye-telefony/41813550/list?hid=91491&glfilter=24892510%3A24892650%2C24892590%2C39026134%2C24892630%2C24892692']")).click();
    }
}
module.exports = StartPage;