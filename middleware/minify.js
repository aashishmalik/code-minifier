module.exports = function (req, res, next) {
    try {

        let sourceCode=req.body.inputText;
        // removes extra space and new lines
        sourceCode=sourceCode.replace(/\s{2,}/g,'')
        // handling special cases
        sourceCode=sourceCode.replace(/ = |= | =/g,'=')
        sourceCode=sourceCode.replace(/ , |, | ,/g,',')
        sourceCode=sourceCode.replace(/ { |{ | {/g,'{')
        sourceCode=sourceCode.replace(/ } |} | }/g,'}')
        sourceCode=sourceCode.replace(/ : |: | "/g,':')
        req.body.inputText=sourceCode
        next()
    } catch (err) {
        console.error(err)
    }
}