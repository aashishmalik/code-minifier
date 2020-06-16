const express = require('express')
const logger = require('morgan')
const minifyJs = require('./middleware/minifyJs')
const minifyCss = require('./middleware/minifyCss')
const minifyHtml = require('./middleware/minifyHtml')
const path = require('path')
const fs = require('fs')
const admZip = require('adm-zip');
var bodyParser = require('body-parser');
// const child_process = require('child_process');
const app = express()

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/download', (req, res) => {

    let zip = new admZip();
    let uploadDir = fs.readdirSync(__dirname+"/public/minihtml")
 
    for(let i = 0; i < uploadDir.length;i++){
        zip.addLocalFile(__dirname+"/public/minihtml/"+uploadDir[i])
    }
    
    // Define zip file name
    let downloadName = "archive.zip"
    let data = zip.toBuffer()
    
    // code to download zip file
    res.set('Content-Type','application/octet-stream')
    res.set('Content-Disposition',`attachment; filename=${downloadName}`)
    res.set('Content-Length',data.length)
    res.send(data)
})

app.post('/minify', [minifyJs, minifyCss, minifyHtml], (req, res) => {
    try {
        res.redirect('/download')
    } catch (err) {
        return res.status(500).json({ msg: "Error during Minification" })
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, (req, res) => {
    console.log(`server running ${PORT}`)
})