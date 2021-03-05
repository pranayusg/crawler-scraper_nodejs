/*****************************************************************************************************************
@Author : pranayusg
@Date   : 26.08.2020
@Description: Crawling and scraping functions for https://www.marutisuzukitruevalue.com
*****************************************************************************************************************/
// npm modules
var cheerio = require('cheerio');
const getHrefs = require('get-hrefs');
var getImgSrc = require('get-img-src')
var Q = require('q');
var callUrl = require('../caller/callurl');
var saveData = require('../model/savedata');

var maxPages = 5

//public methods
module.exports = {
    crawl: crawl,
    scrapeURL: scrapeURL
};

function crawl(beginPage, pages) {
    livePage = parseInt(beginPage == undefined ? 1 : beginPage);
    pageCount = parseInt(pages == undefined ? maxPages : pages);
    maxPages = livePage + pageCount;
    beginCrawl(livePage);
}

function beginCrawl(livePage) {
    if (livePage < maxPages) {
        listUrl = 'https://www.marutisuzukitruevalue.com/buy-car#page=' + livePage;
        crawlGroup(listUrl, livePage)
            .then(function () {
                setTimeout(function () {
                    livePage++;
                    beginCrawl(livePage);
                }, 5000);
            })
    }
}

function crawlGroup(url, livePage) {
    var promises = [];
    return (
        makeGroup(url, livePage)
            .then(function (group) {
                group.map(function (object, i) {
                    setTimeout(function () {
                        promises.push(
                            callUrl.getHtml(object.url)
                                .then(function (html) {
                                    var property = {
                                        id: object.adId,
                                        source: 'marutisuzukitruevalue',
                                        url: object.url,
                                        html: html
                                    };
                                    scrape(property)
                                })
                        );
                    }, i * 400);
                })
                return Q.all(promises);
            })
    );
}

function makeGroup(url, livePage) {
    console.log('Making Group for page :' + livePage);
    return (
        callUrl.getHtml(url)
            .then(function (html) {
                var group = [];

                arr = getHrefs(html);
                for (i = 0; i < arr.length; i++) {
                    if (!arr[i].includes('https://www.marutisuzukitruevalue.com/buy-car')) {
                        arr.splice(i, 1)
                        i--
                    }
                }
                for (i = 0; i < arr.length; i++) {
                    group.push({
                        url: arr[i],
                        adId: arr[i].substring(arr[i].indexOf('/AX') + 1)
                    });
                }

                return group;
            })
    );
}

function scrape(property) {
    var result = scrapePropertyHtml(property.html, property.id, property.url, property.source);
    resultObj = {}
    list = []
    for (i = 0; i < result.length; i++) {
        resultObj[result[i].feature] = result[i].value
    }
    list.push(resultObj)

    saveData.saveMarutiSuzukiTrueValueData(list)
        .then(function () {
            console.log('Data saved for adid ' + property.id)
        })
}

//scrape from URL directly
function scrapeURL(url) {
    callUrl.getHtml(url)
        .then(function (html) {
            resultObj = {}
            var result = scrapePropertyHtml(html);
            for (i = 0; i < result.length; i++) {
                resultObj[result[i].feature] = result[i].value
            }
            console.log(resultObj);
        });
}

function scrapePropertyHtml(html, adId, url, source) {
    var result = [];
    var $ = cheerio.load(html);

    result.push({ feature: 'adId', value: adId })
    result.push({ feature: 'url', value: url })
    result.push({ feature: 'source', value: source })

    var carName = $('div[class="carDetNameTitle"]').eq(0).text()
    result.push({
        feature: 'carName',
        value: carName.trim()
    })

    var price = $('div[class="carDetPriceBox"]').eq(0).text()
    result.push({
        feature: 'price',
        value: price.trim()
    })

    var location = $('div[class="carDetRightFormLocation forDesktop"]').find('span').text()
    result.push({
        feature: 'location',
        value: location.trim()
    })

    var attributeName = $('div[class="tab-content-left"]')
    var attributeValue = $('div[class="tab-content-right"]')
    for (i = 0; i < attributeName.length; i++) {
        result.push({
            feature: $(attributeName[i]).text(),
            value: $(attributeValue[i]).text().trim()
        })
    }

    var attributes = $('div[class="carDetSliderIcon"]').find('li')
    count = 0;
    for (i = 0; i < attributes.length; i++) {
        str = $(attributes[i]).text().trim()
        count++;
        if (count == 1) {
            str_concat = str;
        }
        else {
            str_concat = str_concat + "," + str
        }
    }
    result.push({
        feature: 'attributes',
        value: str_concat
    })

    images = getImgSrc(html)
    for (i = 0; i < images.length; i++) {
        if (!images[i].includes('==')) {
            images.splice(i, 1)
            i--
        }
    }

    for (i = 0; i < images.length; i++) {
        result.push({
            feature: 'image' + (i + 1),
            value: images[i]
        })
    }

    for (i = 0; i < result.length; i++) {
        if (result[i].value == '') {
            result.splice(i, 1)
            i--
        }
    }

    return result
}