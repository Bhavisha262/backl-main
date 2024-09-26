
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const { type } = require('os');
const app = express()

mongoose
.connect(
  "mongodb+srv://bhavishagandharva:9bKRsSNwtCnddtGR@cluster0.p4di7ec.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => console.log("Mongodb Connected"))
.catch((err) => console.log("Mongo Error", err));
app.use(cors());
// app.use(express.static(path.join(__dirname, 'Assets')));
app.use(bodyParser.json());

const ContactSchema = new mongoose.Schema({
    name: {
    type: String,
    require: true,
    },
    email: {
    type: String,
    require: true,
    },
    number: {
    type: Number,
    require: true,
    },
    message: {
    type: String,
    require: true,
    },
}); 
const Contact = mongoose.model("contact-us", ContactSchema);


app.get('/', (req, res) => {
res.send('Hello fcfcWorld!')
})

app.listen(3025, () => {
console.log("server connected")
})

//Run the app with the following command
//node app.js