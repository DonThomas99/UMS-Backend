const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();


app.use(cookieParser());
app.use(express.json());

app.use('/',userRoutes)
app.use('/admin',adminRoutes)

app.use('/file',express.static('file'));

app.listen(3000,()=>{
    console.log('server is listening on localhost:3000');
})


