const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
 require('dotenv').config();

const mongoURI = process.env.mongodb_URI
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended:true}))

app.use('/file',express.static('file'));
app.use(cors({
  credentials:true,
  origin:['http://localhost:4200']
}));

app.use('/',userRoutes)
app.use('/admin',adminRoutes)


app.listen(3000,()=>{
    console.log('server is listening on localhost:3000');
})


