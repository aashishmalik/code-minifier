const express = require('express')
const logger = require('morgan')
const minifyJs = require('./middleware/minifyJs')
const minifyCss = require('./middleware/minifyCss')
const minifyHtml = require('./middleware/minifyHtml')
const path = require('path')
const fs = require('fs')
const admZip = require('adm-zip');
const zip = new admZip();
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

    let uploadDir = fs.readdirSync(__dirname+"/public/minihtml")
 
    for(let i = 0; i < uploadDir.length;i++){
        zip.addLocalFile(__dirname+"/public/minihtml/"+uploadDir[i])
    }
    
    // Define zip file name
    const downloadName = "archive.zip"
    const data = zip.toBuffer()
    // save file zip in root directory
    zip.writeZip(__dirname+"/"+downloadName);
    
    // code to download zip file
    res.set('Content-Type','application/octet-stream')
    res.set('Content-Disposition',`attachment; filename=${downloadName}`)
    res.set('Content-Length',data.length)
    res.download(__dirname+"/"+downloadName);
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