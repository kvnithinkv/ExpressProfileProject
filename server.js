const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const multer = require('multer');
const bodyParser=require('body-parser');


//create express application with help of express function()
const app = express();

//load profile schema model
require('./Model/Profile');
const Profile = mongoose.model('profile');

//connecting mongodb database

const monogdbUrl = "mongodb+srv://profileapp:nithin123@cluster0-gtkgp.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(monogdbUrl,{useUnifiedTopology:true,useNewUrlParser:true},
    err=>{
        if(err) throw err;
        console.log("database connected");
    });


//set template engine middleware
app.engine("handlebars",exphbs());
app.set("view engine","handlebars");

//serving static files...
app.use(express.static(__dirname+'/public'));

//multer middleware is use for uploading files including images,pdf,word,file

const storage = multer.diskStorage({
  destination:function(req,file,cb){
      cb(null,'public/uploads')
  },
  filename:function(req,file,cb){
      cb(null,Date.now()+file.originalname)
  }  
});

const upload = multer({ storage:storage});
//multer code end here

//bodyparser middleware here

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());
//ensing bodyPrser middleware here

//basic route
app.get("/",(req,res)=>{
    res.render('home.handlebars');
});

//add profile form  route get route
app.get('/profile/addprofile',(req,res)=>{
    res.render("profile/addprofile");
});


// create profile by using http POST method

app.post('/profile/addprofile',upload.single('photo'),(req,res)=>{
const errors=[];
if(!req.body.name){
    errors.push({text:'name is required'});
}
if(!req.body.phone){
    errors.push({text:'phone is required'});
}
if(!req.body.company){
    errors.push({text:'company is required'});
}
if(!req.body.location){
    errors.push({text:'location is required'});
}
if(!req.body.education){
    errors.push({text:'education is required'});
}
if(errors.length>0){
    res.render('profile/addprofile',{
        errors:errors,
        name:req.body.name,
        phone:req.body.phone,
        company:req.body.company,
        location:req.body.location,
        education:req.body.education
    })
}else{
    const newProfile ={
        photo:req.file,
        name:req.body.name,
        phone:req.body.phone,
        company:req.body.company,
        location:req.body.location,
        education:req.body.education
    }
    new Profile(newProfile)
    .save()
    .then(profile => {
        console.log(profile);
        res.redirect('/');
    }).catch(err=>console.log(err));
}




});

//page not found error
app.get("**",(req,res)=>{
    res.render("404.handlebars");
});
//create port and server
const port = process.env.PORT || 5000;

app.listen(port,(err)=>{
    if(err) throw err;
    else
    console.log(   `App listening on port ${port}`);
});