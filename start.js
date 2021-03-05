const { Command } = require('commander');
const program = new Command()

program
    .version('0.0.1')
    .option('-c, --crawl', 'Start crawling')
    .option('-s, --scrape', 'Start scraping')
    .option('-n, --crawler [name]', 'Choose which crawler to use')
    .option('-a, --livepage [livepage]', 'Page number if required to start from a specific page')
    .option('-u, --url [url]', 'URL to scrape')
    .option('-p, --pages [pages]', 'Number of pages to crawl')
    .parse(process.argv);

const options = program.opts();

if (options.crawler) {
    var crawler = require('./source/crawlers/' + options.crawler);
} else {
    console.log("Please select at least one crawler!!");
}

if (options.crawl) {
    console.log('Crawler started');
    //TODO: take default value from config file.

    crawler.crawl(options.livepage, options.pages);
}    

if (options.scrape) {
    if (options.url) {
        crawler.scrapeURL(options.url);
    }
}