const axios = require('axios')
const fs = require('fs')
const cheerio = require('cheerio')
const terserHtml = require('html-minifier-terser').minify

module.exports = async function (req, res, next) {
    try {
        const $ = await cheerio.load(res.locals.html);
        async function performHTMLminification() {
            try {
                let result = terserHtml($.html(), {
                    removeAttributeQuotes: true,
                    collapseWhitespace: true,
                    conservativeCollapse:1,
                    minifyCSS:true,
                    minifyJS:true,
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                });
                // writing to file
                fs.writeFile('./public/minihtml/index.html', result, (err) => {
                    if (err) {
                        console.error(err)
                        return res.status(500).json({ msg: "error creating html file" })
                    }
                    next()
                })
            } catch (err) {
                console.log(err);
            }
        }
        performHTMLminification()
    } catch (err) {
        console.error(err)
    }
}
