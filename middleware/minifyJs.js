const axios = require('axios')
const fs = require('fs')
const URL = require('url')
const cheerio = require('cheerio')
const terser = require("terser")

module.exports = async function (req, res, next) {
    try {
        const html = await axios.get(`${req.body.inputText}`)
        const $ = await cheerio.load(html.data)
        const baseURL = URL.parse(req.body.inputText).protocol + '//' + URL.parse(req.body.inputText).host
        let jsLinks = []
        let code = {}
        let i = 1
        // get all scripts links
        $('script').each((i, el) => {
            if ($(el).attr('data-src')) {
                jsLinks.push($(el).attr('data-src'))
            } else if ($(el).attr('src')) {
                jsLinks.push($(el).attr('src'))
            } else {
                code[`file${i++}.js`] = $(el).html()
            }
            $(el).remove()
        })

        // handling relative Links
        jsLinks = jsLinks.map(x => {
            return URL.resolve(baseURL, x)
        })

        async function performJSminification() {
            try {


                const promises = jsLinks.map(url => {
                    return axios.get(url)
                        .then(response => {
                            code[`file${i++}.js`] = response.data
                        })
                        .catch(err => {
                            console.log('url not correct')
                            console.error(err)
                        })
                });
                await Promise.all(promises);
                if (Object.keys(code).length == 0) {
                    res.locals.html = $.html();
                    res.locals.basehost = baseURL
                    next()
                } else {
                    let options = {
                        output: { comments: false },
                        toplevel: true,
                        warnings: true,
                        mangle: {
                            properties: true,
                        }
                    }

                    //minify

                    let result = terser.minify(code, options);

                    //writing to file
                    fs.writeFile('./public/minihtml/script.min.js', result.code, (err) => {
                        if (err) {
                            console.error(err)
                            return res.status(500).json({ msg: "error creating javascript file" })
                        }
                        $('<script>').attr({ defer: 'defer', src: 'script.min.js', type: 'text/javascript' }).appendTo('body')

                        // passing to next middleware
                        res.locals.html = $.html();
                        res.locals.basehost = baseURL
                        next()
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }
        performJSminification()
    } catch (err) {
        console.error(err)
    }
}