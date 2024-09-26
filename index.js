
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

const NewAccountSchema = new mongoose.Schema({
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
    password: {
    type: String,
    require: true,
    },
    
    cart:[
    {
    categoryid:{
    type:Number
    },
    productid:{
    type:Number
    },
    img:{
    type:String
    },
    price:{
    type:String
    },
    name:{
    type:String
    },
    quantity:{
    type:Number,
    default:1
    }
    }
    ],
    wish:[
    {
    categoryid:{
    type:Number
    },
    productid:{
    type:Number
    },
    img:{
    type:String
    },
    price:{
    type:String
    },
    name:{
    type:String
    }
    }
    ],
    shippingInfo: [
    {
    name:{
    type:String
    },
    number:{
    type:Number
    },
    email:{
    type:String
    },
    address: {
    type:String
    }, 
    landmark: {
    type:String
    } ,
    state: {
    type:String
    },
    city: {
    type:String 
    },
    
    pincode: {
    type:Number
    } 
    }
    ],
    order: [
    {
    orderDate:{ 
    type: String
    },
    categoryid: {
    type: Number,
    required:true,
    },
    productid:
    {
    type: Number,
    required:true,
    },
    img:
    {
    type: String,
    },
    name:
    {
    type: String,
    },
    price:
    {
    type:String,
    },
    quantity:
    {
    type: Number,
    default: 1,
    }
    },
    ],
});
const NewAccount = mongoose.model("new-account",  NewAccountSchema);

app.get('/', (req, res) => {
res.send('Hello Backend Is Live!')
})

app.listen(3025, () => {
console.log("server connected")
})

//Run the app with the following command
//node app.js