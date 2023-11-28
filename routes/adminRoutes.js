const dotenv = require('dotenv');
dotenv.config();
const {Router, response} = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const adminRoute = Router();
const bcrypt = require('bcryptjs')

adminRoute.post('/login',async(req,res)=>{
    try {
        console.log("im in");
        const user = await User.findOne({email:req.body.email,is_admin:true})
        if(!user){
            return res.status(400).send({
                message:'User not found'
            })
        }
        if(!(await bcrypt.compare(req.body.password,user.password))){
            return res.status(400).send({
                message:'Password is incorrect'
            })
        }
        const token = jwt.sign({_id:user._id},"secret");

        res.cookie("jwt",token,{
            httpOnly:true,
            maxAge:24*60*60*1000
        })
        res.send({
            message:"success"
        })
    } catch (error) {
        console.log(error.message);
    }
})

adminRoute.post('/logout',async(req,res)=>{
    res.cookie("jwt","",{maxAge:0})
    res.send({
        message:"success"
    })
})

adminRoute.get('/active',async(req,res)=>{
    try {
        const cookie = req.cookies["jwt"]
        const claims = jwt.verify(cookie,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }

        const user = User.findOne({_id:claims._id,is_admin:"true"})
        const {password,...data} = user.toJSON();
        res.send(data)
    } catch (error) {
        return res.status(401).send({
            message:"unauthenticated"
        })
    }
})

adminRoute.get('/users',async(req,res)=>{
    try{
        const user = await User.find({})
        res.send(user)
    }catch (error) {
console.log(error.message);
    }
})

adminRoute.post('/deleteUser/:id',async(req,res)=>{
    try {
        const deleteUser = await User.deleteOne({_id:req.params.id})
        if(!deleteUser){
            return res.send({
                message:"Deletion went wrong"
            })
        }
        res.send(deleteUser)
    } catch (error) {
        console.log(error.message);        
    }
})

adminRoute.post('/editDetails/:id',async(req,res)=>{
    try {
        const userData = await User.findOne({_id:req.params.id})
        if(!userData){
            return res.send({
                message:"Something Went Wrong"
            })
        }
        const {password, ...data} = await userData.toJSON();
        res.send(data)
    } catch (error) {
    console.log(error.message);       
    }
})

adminRoute.post('/editUser',async(req,res)=>{
try {
    const {name,email} = req.body;
    const userUpdate = await User.updateOne ({email:email},{$set:{name:name}})
    if(!userUpdate){
        return res.send({
            message:"success"
        })
    }
} catch (error) {
    console.log(error.message);
}
})

adminRoute.post('/createUser',async(req,res)=>{
try {
    const {email,password,name} = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    const record = await User.findOne({email:email})

    if(record){
        return res.status(400).send({message:"Email is already registered"
    })
    } else{
        const user = new User({
            name, email,
            password:hashedPassword
        })
        const result = await user.save();
        res.send({
            message:"success"
        })
    }

} catch (error) {
    console.log(error.message);
    
    
}

})

module.exports = adminRoute