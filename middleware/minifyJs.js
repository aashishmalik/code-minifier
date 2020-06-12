const axios = require('axios')
const fs = require('fs')
const cheerio = require('cheerio')
const Terser = require("terser")

module.exports = async function (req, res, next) {
    try {

        const html = await axios.get(`${req.body.inputText}`)
        const $ = await cheerio.load(html.data);
        const jsLinks = []
        // get all scripts links
        $('script').each((i, el) => {
            if ($(el).attr('data-src'))
                jsLinks.push($(el).attr('data-src'))
            if ($(el).attr('src'))
                jsLinks.push($(el).attr('src'))
            $(el).remove();
        })
        async function performJSminification() {
            try {

                let code = {}
                let i = 1
                const promises = jsLinks.map(url => {
                    return axios.get(url)
                        .then(response => {
                            code[`file${i++}.js`] = response.data
                        })
                        .catch(err => {
                            console.error(err)
                        })
                });
                await Promise.all(promises);
                let options = {
                    output: {comments: false},
                    toplevel: true, warnings: true, mangle: {
                        properties: true,
                    }
                }
                let result = Terser.minify(code, options);
                fs.writeFile('./public/minihtml/script.min.js', result.code, (err) => {
                    if (err) {
                        console.error(err)
                        return res.status(500).json({ msg: "fs error" })
                    }
                    $('<script>').attr({ src: 'script.min.js', type: 'text/javascript' }).appendTo('body')
                    res.locals.html = $.html();
                    next()
                });
            } catch (err) {
                console.log(err);
            }
        }
        performJSminification()
        
    } catch (err) {
        console.error(err)
    }
}