const express = require('express')
const logger = require('morgan')
const minifyJs = require('./middleware/minifyJs')
const minifyCss = require('./middleware/minifyCss')
const minifyHtml = require('./middleware/minifyHtml')
const path = require('path')
var bodyParser = require('body-parser');
const child_process = require('child_process');
const app = express()
//
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.post('/download', [minifyJs,minifyCss,minifyHtml], (req, res) => {
    var filePath = "./public/minihtml"; 
    child_process.execSync(`zip -r archive *`, {
        cwd: filePath
      });
    res.download(filePath+'/archive.zip');
})


app.post('/render', [minifyJs,minifyCss,minifyHtml], (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/public/minihtml/test.html'))
    } catch (err) {
        return res.status(500).json({ msg: "file not found" })
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, (req, res) => {
    console.log(`server running ${PORT}`)
})