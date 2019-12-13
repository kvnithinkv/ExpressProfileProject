const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const multer = require('multer');
const bodyParser=require('body-parser');
const Handlebars = require('handlebars');
var HandlebarsIntl = require('handlebars-intl');
var methodOverride = require('method-override');

var session = require('express-session');
var flash = require('connect-flash');

//create express application with help of express function()
const app = express();
HandlebarsIntl.registerWith(Handlebars);//helper middleware


//method override middleware here
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

Handlebars.registerHelper("trimString",function(passedString){
    var theString = [...passedString].splice(6).join('');
    return new Handlebars.SafeString(theString);
});



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

//session middleware here

app.use(session({
    secret:"keyboard cat",
    resave:false,
    saveUninitialized:true,
})
);

//connect flash middleware here
app.use(flash());

//create  a global middleware

app.use(function(req,res,next){
    res.locals.success_msg=req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error=req.flash('error');
    next()
})

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

// call profile page route
app.get('/profile/userprofile',(req,res)=>{
    Profile.find({}).then(profile=>{
        res.render("profile/userprofile",{
            profile:profile
        })
    }).catch(err=>console.log(err));
});

// create editprofile route//client side

app.get('/profile/editprofile/:id',(req,res)=>{
    //nedd to acess database primary  key id &//collection name here (Profile)
Profile.findOne({_id:req.params.id}).then(profile =>{
    res.render('profile/editprofile',{
        profile:profile
    })
}).catch(err=>console.log(err));

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
        req.flash('success_msg','successfully profile created');
        res.redirect('/profile/userprofile');
    }).catch(err=>console.log(err));
}

});

// edit profile PUT method route here //server side

app.put("/profile/editprofile/:id",upload.single('photo'),(req,res)=>{
    Profile.findOne({_id:req.params.id}).then(profile=>{
        profile.photo=req.file;
        profile.name =req.body.name;
        profile.phone= req.body.phone;
        profile.company= req.body.company;
        profile.location= req.body.location;
        profile.education= req.body.education;
        //save the data into database
        profile.save().then(profile=>{
            req.flash('success_msg','successfully profile updated');
            res.redirect('/profile/userprofile');
        }).catch(err=>console.log(err));  
    }).catch(err => console.log(err));
});

// delete profile route with help of http delete method
app.delete('/profile/deleteprofile/:id',(req,res)=>{
    Profile.remove({_id:req.params.id}).then(profile=>{
        req.flash('success_msg','successfully profile deleted');
        res.redirect('/profile/userprofile');
    }).catch(err=>console.log(err));
})


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



