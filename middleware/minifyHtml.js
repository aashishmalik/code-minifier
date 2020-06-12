const axios = require('axios')
const fs = require('fs')
const cheerio = require('cheerio')
const TerserHtml = require('html-minifier-terser').minify

module.exports = async function (req, res, next) {
    try {
        console.log('html middleware')
        const $ = await cheerio.load(res.locals.html);
        async function performHTMLminification() {
            try {
                let result = TerserHtml($.html(), {
                    removeAttributeQuotes: true,
                    collapseWhitespace: true
                });
                fs.writeFile('./public/minihtml/index.html', result, (err) => {
                    if (err) {
                        console.error(err)
                        return res.status(500).json({ msg: "fs error" })
                    }
                })
                next()
            } catch (err) {
                console.log(err);
            }
        }
        performHTMLminification()
    } catch (err) {
        console.error(err)
    }
}
