const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')
//加载body-parser，用来处理post提交过来的数据
// const bodyParser = require('body-parser');
//加载数据库模块
const mongoose = require('mongoose');
const app = express()

// 设置模板目录
app.set('views',path.join(__dirname,'views'))
// 设置模板引擎为ejs
app.set('view engine','ejs')

// 设置静态文件目录
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'upload')))
//bodyparser设置
// app.use( bodyParser.urlencoded({extended: true}) );
// session中间件
app.use(session({
    name:config.session.key,//设置cookie中保存session id的字段名称
    secret:config.session.secret,//通过设置secret来计算hash值并放在cookie中，使产生的signedCookie 防篡改
    resave:true,//强制更新session
    saveUninitialized:false,//设置为false，强制创建一个session，即使用户未登录
    cookie:{
        maxAge:config.session.maxAge//过期时间，过期后cookie中的session id自动删除
    },
    store:new MongoStore({//将session存储到mongodb
        url:config.mongodb//mongodb地址
    })
}))
// flash中间件，用来显示通知
app.use(flash())

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, './upload'), // 上传文件目录
  keepExtensions: true// 保留后缀
}))
// 设置模板全局常量
app.locals.blog = {
    title: pkg.name,
    description: pkg.description
}
// 添加模板必需的三个变量
app.use(function (req, res, next) {
    res.locals.user = req.session.user
    res.locals.success = req.flash('success').toString()
    res.locals.error = req.flash('error').toString()
    next()
})
// 路由
routes(app)

//监听http请求
const port = process.env.PORT || 3000
mongoose.connect(config.mongodb, function(err) {
  if (err) {
      console.log('数据库连接失败');
  } else {
      console.log('数据库连接成功');
      app.listen(port,() => {
        console.log(`${pkg.name} listening on port ${port}`)
      });
  }
})

