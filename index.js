
const express = require('express')
const app = express()


app.get('/', (req, res) => {
res.send('Hello fcfcWorld!')
})

app.listen(3025, () => {
console.log("server connected")
})

//Run the app with the following command
//node app.js