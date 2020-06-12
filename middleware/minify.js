const axios = require('axios')
const fs = require('fs')
const cheerio = require('cheerio')
const Terser = require("terser")
const CleanCSS = require('clean-css')
const TerserHtml = require('html-minifier-terser').minify

module.exports = async function (req, res, next) {
    try {

        const html = await axios.get(`${req.body.inputText}`)
        const $ = await cheerio.load(html.data);
        const jsLinks = []
        const cssLinks =[]
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
                let i=1
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
                    toplevel: true, warnings: true, mangle: {
                        properties: true,
                    }
                }
                let result = Terser.minify(code, options);
                fs.writeFile('./public/minihtml/js_terser.js', result.code, (err) => {
                    if (err) {
                        console.error(err)
                        return res.status(500).json({ msg: "fs error" })
                    }
                });

            } catch (err) {
                console.log(err);
            }
        }
        performJSminification()


        $('link[rel="stylesheet"]').each((i, el) => {
             if ($(el).attr('href'))
                cssLinks.push($(el).attr('href'))
            if ($(el).attr('data-href'))
                cssLinks.push($(el).attr('data-href'))
            $(el).remove();
        })
        
        async function performCSSminification() {
            try {

                let code = {}

                const promisesCss = cssLinks.map(url => {
                    return axios.get(url)
                        .then(response => {
                            code+=response.data
                        })
                        .catch(err => {
                            console.error(err)
                        })
                });
                await Promise.all(promisesCss);

                let options = {level: 1};
                let result = new CleanCSS(options).minify(code);

                fs.writeFile('./public/minihtml/css_clean.css', result.styles, (err) => {
                    if (err) {
                        console.error(err)
                        return res.status(500).json({ msg: "fs error" })
                    }
                });

            } catch (err) {
                console.log(err);
            }
        }
        performCSSminification()

        $('<script>').attr({ src: '/js_terser.js', type: 'text/javascript' }).appendTo('body')
        $('<link/>').attr({rel: 'stylesheet',type: 'text/css',href: 'css_clean.css'}).appendTo('head');
        let result = TerserHtml($.html(), {
            removeAttributeQuotes: true,
            collapseWhitespace:true
          });
        fs.writeFile('./public/minihtml/test.html', result, (err) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ msg: "fs error" })
            }
        })
        setTimeout(()=>{
            next()
        },5000)
    } catch (err) {
        console.error(err)
    }
}