let express = require('express');
let svgCaptcha = require('svg-captcha');
let path = require('path');
var session = require('express-session')
let app = express();
app.use(express.static('static'));
app.use(session({
    secret: 'keyboard cat',
  }))
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'static/views/login.html'));
})
app.get('/login/captchaImg',(req,res)=>{
    var captcha = svgCaptcha.create();
    // console.log(captcha.text);
    req.session.captcha = captcha.text;
    
    res.type('svg');
    res.status(200).send(captcha.data);
})
app.listen(8848,'127.0.0.1',()=>{
    console.log('success');
})