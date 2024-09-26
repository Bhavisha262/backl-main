const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
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
    require:true,
    },
    productid:
    {
    type: Number,
    require:true,
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

const UserSchema = new mongoose.Schema({
  
email: {
type: String,
require: true,
},

password: {
type: String,
require: true,
},
});
const User = mongoose.model("user",  UserSchema);

app.get('/api', (req, res) => {
    const filePath = path.join(__dirname, 'data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
    console.error(err);
    return res.json({ success: false, error: 'Internal Server Error' });
    }
      
    const jsonData = JSON.parse(data);
    const updatedJson = jsonData.map(item => {
    if (item.category_img) {
    item.category_img = 'http://' + req.get('host') + item.category_img;
    }
    
    if (item.pro_icon) {
      item.pro_icon = 'http://' + req.get('host') + item.pro_icon;
    }
    
    item.pro = item.pro.map(product => {
    if (product.pro_main_img) {
      product.pro_main_img = 'http://' + req.get('host') + product.pro_main_img;
    }
    
    if (product.images) {
    product.images = product.images.map(a => {
    if (a.original) {
      a.original = 'http://' + req.get('host') + a.original;
    }
    if (a.thumbnail) {
      a.thumbnail = 'http://' + req.get('host') + a.thumbnail;
    }
    return a
    });
    }
    
    return product;
    });
    
    return item;
    });
    
    
    res.json({ success: true, data: updatedJson });
    
    
    });
});

app.post('/contact-us',async(req,res)=> {
    const{name,email,number,message}=req.body

    const exist = await Contact.findOne({email,message})
    if(exist){
     return res.json({success:false,error:'Already exists'})
    }
    const result = await Contact.create({
    name,
    email,
    number,
    message,
    });
    
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'bhavishagandharva@gmail.com',
    pass: 'lzly yedr pmue qjbp',
    },
    });
    
    
    const mailOptions = {
    from: 'bhavishagandharva@gmail.com',
    to: email,
    subject: 'Welcome to Grace Beauty',
    html: `
    <p>Hello ${name},</p>
    <p>Thank you for Contacting Grace Beauty. We will get back to you soon.</p>
    <p>Best regards,</p>
    <p>Grace Beauty Team</p>
    `,
    };
    
    const info =  await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({success:true,message:"Thanks for Contacting Grace Beauty !"})
    console.log(result)
});

app.get('/contact-admin-table',async(req,res)=> {
const contactdata = await Contact.find()
res.json({data:contactdata})
});

app.post('/new-account',async(req,res)=> {
    const{name,number,email,password}=req.body
    const existingUser = await NewAccount.findOne({email});
    
    if (existingUser){
    return res.json({success: false,error: 'Email Id Already Registered ! Please Login...'})
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const result = await NewAccount.create({
    name,
    email,
    number,
    password:hashedPassword,
    });
    
    console.log(result)
    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth:{
        user: 'bhavishagandharva@gmail.com',
        pass: 'lzly yedr pmue qjbp',
      }
    });
    const mailOptions = {
    from:'bhavishagandharva@gmail.com',
    to: email,
    subject: 'Welcome to Grace Beauty...',
    html: `
    <p>Hello ${name}</p>
    <p>Thank you for registering with Grace Beauty. We are excited to have you on board!</p>
    <p>Best regards,</p>
    <p>Grace Beauty Team</p>
    `,
    };
    
    
    const info =  await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ success: true, message: 'Thanks for registering with Grace Beauty.' });
});

app.get('/new-admin-table',async(req,res)=> {
const newdata = await NewAccount.find()
res.json({data:newdata}) 
});
    
app.get('/', (req, res) => {
res.send('Hello Backend Is Live!')
})

app.listen(3025, () => {
console.log("Server Connected")
})

//Run the app with the following command
//node app.js