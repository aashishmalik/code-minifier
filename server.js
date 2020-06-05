const express = require('express')
const logger = require('morgan')
const minify = require('./middleware/minify')
const path = require('path')
const fs = require('fs')
var bodyParser = require('body-parser');
const app = express()
//
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))
app.set('view engine','ejs')
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.post('/minified', minify, (req, res) => {
    res.render('minified',{inputText:req.body.inputText})
})


app.post('/render', minify, (req, res) => {
    try {
        fs.writeFile('./public/minihtml/test.html', req.body.inputText,(err) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ msg: "fs error" })
            }
            res.sendFile(path.join(__dirname, '/public/minihtml/test.html'))
        });
    } catch (err) {
        console.error(err.message)
        return res.status(500).json({ msg: "fs error" })
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, (req, res) => {
    console.log(`server running ${PORT}`)
})