const dotenv = require('dotenv');
dotenv.config();
const {Router} = require('express')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const router = Router();
const multer = require('multer')
const upload = multer({dest:'./file'})

router.post('/register',async(req,res)=>{
    console.log(req.body);
    const {email,password,name} = req.body
    // const salt = await bcrypt.genSalt(10)
    
    const hashedPassword = await bcrypt.hash(password,10)
    const record = await User.findOne({email:email})

    if(record){
        return res.status(400).send({
            message:"Email is already registered"
        })
    } else{
        const user = new User({
            name,
            email,
            password:hashedPassword
        })
        const result = await user.save();
        //jwt token
        const {_id} = await result.toJSON();
        const token = jwt.sign({_id:_id},"secret")
        res.cookie("jwt",token,{
            httpOnly:true,
            maxAge:24*60*60*1000
        })
        res.send({
            message:"success"
        })
    }
})

router.post('/login',async(req,res)=>{
   try {
    const user = await User.findOne({
        email:req.body.email
    })
    if(!user){
        return res.status(404).send({
            message:"User not found"
        })
    }

    if(!(await bcrypt.compare(req.body.password,user.password))){
        return res.status(400).send({
            message:"Password is Incorrect "
        })
    }
        const token = jwt.sign({_id:user,_id},"secret");
        res.cookie("jwt",token,{
            httpOnly:true,
            maxAge:24*60*60*1000
        })

        res.send({
            message:"Success"
        })
   } catch (error) {
    console.log(error.message);
   }

})

router.get('/user',async(req,res)=>{
    try{
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const user = await User.findOne({_id:claims._id})
        const{password, ...data} = await user.toJSON();
        res.send(data)
    }catch(error){
        return res.status(401).send({
            message:"unauthenticated"
        })
    }
})

router.post('/profile-upload-single',upload.single('image'),async(req,res)=>{
    try {
        const cookie = req.cookies["jwt"]
        const claims = jwt.verify(cookie,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const updateImg = await User.updateOne({_id:claims._id},{$set:{image:req.files.filename}});
        if(!updateImg){
            return res.status(401).json({message:"Something went wrong"})
        }
        return res.status(200).json({
            message:"Image Uploaded successfully"
        })
    } catch (error) {
        console.log(error.message)
    }
})
router.get('/profile',async(req,res)=>{
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }

        const user = await User.findOne({_id:claims._id})
        const {password, ...data} = await user.toJSON()
        res.send(data)
    } catch (error) {
        console.log(error.message);        
    }
})

module.exports = router
