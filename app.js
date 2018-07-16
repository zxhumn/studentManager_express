let express = require('express');
let svgCaptcha = require('svg-captcha');
let path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
let app = express();
app.use(express.static('static'));
app.use(session({
    secret: 'keyboard cat',
}));
app.use(bodyParser.urlencoded({
    extended: false
}));
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'SZHM19';

//   登录页显示
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/views/login.html'));
})
// 验证码显示
app.get('/login/captchaImg', (req, res) => {
    var captcha = svgCaptcha.create();
    // console.log(captcha.text);
    req.session.captcha = captcha.text.toLocaleLowerCase();

    res.type('svg');
    res.status(200).send(captcha.data);
})
// 验证码验证
app.post('/login', (req, res) => {
    // console.log(req.body);
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    if (req.session.captcha == req.body.code) {
        // 验证正确
        // console.log('验证正确');
        req.session.userinfo = {
            userName,
            userPass
        }
        res.redirect('/index');
    } else {
        // console.log('验证失败');
        res.setHeader('content-type', 'text/html');
        res.send("<script>alert('验证码输入错误');window.location.href='/login'</script>")
    }
});
// 访问登录页
app.get('/index', (req, res) => {
    if (req.session.userinfo) {

        res.sendFile(path.join(__dirname, 'static/views/index.html'));
    } else {
        res.setHeader('content-type', "text/html");
        res.send("<script>alert('请登录');window.location='/login'</script>")
    }
});
// 登出
app.get('/logout', (req, res) => {
    delete req.session.userinfo;
    res.redirect('/login');
});
// 显示注册页
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/views/register.html'));
})
// 注册页实现
app.post('/register', (req, res) => {
    MongoClient.connect(url, function (err, client) {
        const db = client.db(dbName);
        let collection = db.collection('userList');
        collection.find({
            'userName': req.body.userName
        }).toArray((err, doc) => {
            // console.log(doc);
            let userName = req.body.userName;
            let userPass = req.body.userPass;
            if (doc.length == 0) {
                collection.insertOne({
                    userName,
                    userPass
                },(err,result)=>{
                    res.setHeader('content-type',"text/html");
                    res.send('<script>alert("欢迎入坑");window.location.href="/login"</script>');
                    client.close();
                })
            }else {
                // 已经被注册
                // 提示用户
                res.setHeader('content-type',"text/html");
                res.send('<script>alert("用户名已被注册，换一个吧");window.location="/register  "</script>')
            }
        })
    })

    //   client.close();

})
app.listen(8848, '127.0.0.1', () => {
    console.log('success');
})