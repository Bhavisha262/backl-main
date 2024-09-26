
const express = require('express')
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const {type} = require('os')
const app = express()

mongoose
.connect(
  "mongodb+srv://bhavishagandharva:9bKRsSNwtCnddtGR@cluster0.p4di7ec.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => console.log("mongodb connected"))
.catch((err) => console.log("mongo error", err));
app.use(cors());
app.use(express.static(path.join(__dirname, 'Assets')));
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
})

app.get('/contact-admin-table',async(req,res)=> {

const contactdata = await Contact.find()

res.json({data:contactdata})
  
})

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
})

app.get('/new-admin-table',async(req,res)=> {

const newdata = await NewAccount.find()

res.json({data:newdata})
  
})

app.post('/update-account-data', async (req, res) => {
const { name,email,number,password } = req.body;


try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({success: false,  alert: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({success: false, alert: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
return res.status(404).json({success: false, alert: 'User not found' });
}

const hashedPassword = await bcrypt.hash(password, 10);
user.name = name;
user.email = email;
user.number = number;

user.password=hashedPassword
await user.save();

res.json({ success: true, message: 'Thanks Your Information has Been Updated' });  

});
} catch (error) {
console.error('Error fetching user address:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
   

 
});



app.post('/user', async(req,res)=> {
const{email,password}=req.body
console.log(email+password)
const existingUser1 = await NewAccount.findOne({ email });
if (!existingUser1) {
return res.json({ success: false, error: 'Invalid User.' });
}
const passwordMatch = await bcrypt.compare(password, existingUser1.password);
if (!passwordMatch) {
  return res.json({ success: false, error: 'Invalid  password' });
}
const token = jwt.sign({ email }, 'secret-key', { expiresIn: '24h' });  
console.log(token)
res.json({ success: true, message: 'Thanks.Login Successful',data:token, cartInfo: existingUser1.cart, wishInfo: existingUser1.wish ,orderInfo: existingUser1.order });
})


app.get('/api/user', async (req, res) => {
try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ message: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({ message: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
return res.status(404).json({ message: 'User not found' });
}

const accountInfo = {
name: user.name,
email: user.email,
mobile: user.number,
password: user.password,
};

  res.json({ accountInfo:accountInfo });
});
} catch (error) {
console.error('Error fetching cart items:', error);
res.status(500).json({ message: 'Internal Server Error' });
}
});

app.post('/add-to-cart', async (req, res) => {
const{categoryid,productid,img,price,name} = req.body



try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ error: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
  return res.status(401).json({ error: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}


// Check if the product already exists in the cart with the same categoryid, productid, and size
const existingProduct = user.cart.find(
  item => item.categoryid === categoryid && item.productid === productid 
);

if (existingProduct) {
  return res.json({ success:false,error: 'Product already in cart ' });
}

     
user.cart.push({
  categoryid,productid,img,price,name
  
});

await user.save();

console.log(user)

res.json({ success: true, message: 'Thanks Product added to cart',cartInfo:user.cart});
});
} catch (error) {
console.error('Error adding to cart:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});
app.post('/remove-from-cart', async (req, res) => {
const { categoryid,productid } = req.body;

try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ message: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({ message: 'Invalid token' });
}


const user = await NewAccount.findOneAndUpdate(
{ email: decoded.email },
{ $pull: { cart: { categoryid,productid} } },
{ new: true }
);

   
if (!user) {
return res.status(404).json({ message: 'User not found' });
}



res.json({ success: true, message: 'Thanks Product removed from cart', cartInfo: user.cart });
});
} catch (error) {
console.error('Error removing from cart:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});

app.post('/add-to-wish', async (req, res) => {
const{categoryid,productid,img,price,name} = req.body

try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ error: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({ error: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
return res.status(404).json({ error: 'User not found' });
}

const existingProduct = user.wish.find(
item => item.categoryid === categoryid && item.productid === productid 
);

if (existingProduct) {
return res.json({ success:false,error: 'Product already in wish ' });
}

user.wish.push({
categoryid,productid,img,price,name

});

await user.save();

console.log(user)

res.json({ success: true, message: 'Thanks Product added to wish', wishInfo:user.wish});
});
} catch (error) {
console.error('Error adding to wishlist:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});

app.post('/remove-from-wish', async (req, res) => {
const { categoryid,productid } = req.body;

try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ error: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
  return res.status(401).json({ error: 'Invalid token' });
}


const user = await NewAccount.findOneAndUpdate(
  { email: decoded.email },
  { $pull: { wish: { categoryid,productid} } },
  { new: true }
);

if (!user) {
  return res.status(404).json({ error: 'User not found' });
}
res.json({ success: true, message: 'Thanks Product removed from wishlist', wishInfo: user.wish });
});
} catch (error) {
console.error('Error removing from wishlist:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});


app.post('/save-shipping-info', async (req, res) => {
const { name,number,email,address,landmark,state,city,pincode } = req.body;

try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ message: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({ message: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
return res.status(404).json({ message: 'User not found' });
}

const shippingInfo = {
name,number,email,address,landmark,state,city,pincode
};


user.shippingInfo = shippingInfo;
await user.save();

console.log(user);

res.json({
success: true,
message: 'Thanks Shipping information saved successfully',
shippingInfo: user.shippingInfo
});
});
} catch (error) {
console.error('Error saving shipping information:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});

app.get('/get-shipping-info', async (req, res) => {
try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ message: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({ message: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
return res.status(404).json({ message: 'User not found' });
}

// You can directly send the shipping information in the response
const shippingInfo = user.shippingInfo  || {};

res.json({ success: true, data:shippingInfo  });
console.log(shippingInfo )
});
} catch (error) {
console.error('Error fetching user address', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});

app.post('/save-order-info', async (req, res) => {

const { orderDate } = req.body;
try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ error: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({ error: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
return res.status(404).json({ error: 'User not found' });
}

user.cart.forEach(item => {
user.order.push({
orderDate,
categoryid: item.categoryid,
productid: item.productid,
img:item.img,
name:item.name,
price:item.price,
quantity: item.quantity,

});
});


user.cart = [];

await user.save();

res.json({
success: true,
message: 'Thanks! Your Order has Been Confirmed',
orderInfo: user.order,
cartInfo: user.cart
});
});
} catch (error) {
console.error('Error adding to order:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});

app.post('/increase-quantity', async (req, res) => {
const { categoryid, productid } = req.body;

try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ message: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({ message: 'Invalid token' });
}

// Find the user by email from the decoded token
const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
return res.status(404).json({ message: 'User not found' });
}

const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid );
if (productInCart) {
  
if (productInCart.quantity < 10) {
productInCart.quantity = productInCart.quantity + 1;
} else {
return res.json({success:false, error: 'Maximum quantity 10' });
}
} else {
  return res.json({success:false, error: 'Product not found in cart' });
}


await user.save();


res.json({ success: true, message: ' Thanks Quantity increased', cartInfo: user.cart });
});
} catch (error) {
console.error('Error increasing quantity:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});

app.post('/decrease-quantity', async (req, res) => {
const { categoryid, productid } = req.body;

try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ message: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
  return res.status(401).json({ message: 'Invalid token' });
}

// Find the user by email from the decoded token
const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
  return res.status(404).json({ message: 'User not found' });
}

const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid );
if (productInCart) {

if (productInCart.quantity >1) {
productInCart.quantity = productInCart.quantity - 1;
}  else {
return res.json({success:false, error: 'Maximum quantity 1' });
}
} else {
return res.json({success:false, error: 'Product not found in cart' });
}
await user.save();
res.json({ success: true, message: ' Thanks Quantity decreased', cartInfo: user.cart });
});
} catch (error) {
console.error('Error decreasing quantity:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});


app.get('/get-order-info', async (req, res) => {
try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ message: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
  return res.status(401).json({ message: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
  return res.status(404).json({ message: 'User not found' });
}


res.json({ orderInfo: user.order });
});
} catch (error) {
console.error('Error fetching order items:', error);
res.status(500).json({ message: 'Internal Server Error' });
}
});

app.get('/order-admin-table',async(req,res)=> {

const orderdata = await NewAccount.find()

res.json({data:orderdata})

})

app.post('/forgotpassword',async(req,res)=>{
const{name,email} = req.body


const forgotpassword = await register.create({
name,
email,
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
subject: 'To Change Password',
html: `
<p>Hello ${name}</p>
<p>To Change Password</p>
<p><a href="http://localhost:3025/changepassword">http://localhost:3025/changepassword</a></p>
<p>Thank You,</p>
`,
};
const mail = await transporter.sendMail(mailOptions);
await forgotpassword.save();
res.json({ success: true, message: ' Link send to Your Mail id'});
});

app.post('/changepassword',async(req,res)=>{
const{email,password} = req.body
const user = await register.findOne({email})
if(!user){
return res.status(404).json({ success: false, message: 'User not found' });
}
const hashedPassword = await bcrypt.hash(password, 10);
user.password=hashedPassword


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
subject: 'Change Password Successfully!',
html: `
<p>Hello</p>
<p>Change Password Successfully</p>
<p>Your Password Change</p>
<p>Thank You,</p>
`,
};
const mail = await transporter.sendMail(mailOptions);
await user.save();
res.json({ success: true, message: ' Password Change Successfully'});
});
app.get('/', (req, res) => {
res.send('Hello fcfcWorld!')
})

app.listen(3025, () => {
console.log("server connected")
})

//Run the app with the following command
//node app.js