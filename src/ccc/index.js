const KoaRouter = require('koa-router');
const axios = require('axios');
const cheerio = require('cheerio');

const puppeteer = require('puppeteer');

const router = new KoaRouter();

const handleRequest = require('../utils/handleRequest');

router.get('/ccc/one', async ctx => {
    const ad = require('./1');
    const map = [];
    ad.box.result.forEach(ele => {
        map.push([...ele.red.split(','), ele.blue]);
    });
    ctx.body = handleRequest(map);
});

router.get('/ccc/two', async ctx => {
    const data = await axios({
        url: 'https://www.bond-y.com/search/?searchkey=%E6%88%91%E7%9A%84'
    });
    const $ = cheerio.load(data.data);
    const html = $('#hotcontent .item').html();
    console.log(html);
    ctx.body = handleRequest(html);
});

router.get('/ccc/three', async ctx => {
    const browser = await puppeteer.launch({
        headless: false
    }); // 启动 Chrome 浏览器实例
    const page = await browser.newPage(); // 创建一个新的页面

    // 导航到指定的 URL
    await page.goto('https://www.tcknh.com/search/?keyword=%E9%BB%84%E6%98%8F%E5%88%86%E7%95%8C&t=0');

    // 等待页面加载完成
    await page.waitForSelector('body');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('.pic .nbg');

    const html = await page.evaluate(() => {
        const element = document.querySelector('.pic .nbg'); // 获取指定元素
        console.log(element.outerHTML, 33);
        return element.innerHTML; // 返回元素的 outerHTML，如果找不到元素则返回 null
    });
    console.log(html, 1);
    // 获取页面标题
    const pageTitle = await page.title();
    console.log('页面标题:', pageTitle);

    // 截图
    // await page.screenshot({ path: 'screenshot.png' });

    // 关闭浏览器实例
    // await browser.close();

    ctx.body = handleRequest(html);
});

router.get('/ccc/four', async ctx => {
    axios({
        url: 'https://www.bond-y.com/search/?searchkey=%E6%88%91%E7%9A%84'
    }).then(res => {
        ctx.body = handleRequest(res);
    });
    ctx.body = 2323;
});

module.exports = router;
