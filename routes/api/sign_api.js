const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const path = require('path')
const sha1 = require('sha1')
const checkNotLogin = require('../../middlewares/check').checkNotLogin
const fs = require('fs');
// var multer  = require('multer')


// var createFolder = function(folder){
//     try{
//         fs.accessSync(folder);
//     }catch(e){
//         fs.mkdirSync(folder);
//     }
// };

// var uploadFolder = './upload';

// createFolder(uploadFolder);

// // 通过 filename 属性定制
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
//     },
//     filename: function (req, file, cb) {
//         // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
//         cb(null, file.fieldname +'-'+ file.originalname);
//     }
// });

// // 通过 storage 选项来对 上传行为 进行定制化
// var upload = multer({ storage: storage })

//统一返回格式
var responseData;

router.use( (req, res, next) => {
    responseData = {
        code: 0,
        message: ''
    }
    next();
} );
/*
* 用户注册
*   注册逻辑
*
*   1.用户名不能为空
*   2.密码不能为空
*   3.两次输入密码必须一致
*
*   1.用户是否已经被注册了
*       数据库查询
*
* */

router.post('/signup',(req,res,next) => {
  let { username, userpsw ,reuserpsw, sex ,explain} = req.fields
  let unlink_file_cb = (err) => {
    if(err){
      throw err;
     }
     console.log('文件:'+req.files.avatar.path+'删除成功！')
  }
  const unlink_file_fun = () =>{
    if(req.files.avatar){
      fs.unlink(req.files.avatar.path,unlink_file_cb);
    }
  }
  //用户是否为空
  if ( username == '' ) {
      responseData.code = 1;
      responseData.message = '用户名不能为空';
      // 注册失败，删除上传的头像
      unlink_file_fun()
      res.json(responseData)
      return;
  }
  //密码不能为空
  if (userpsw == '') {
      responseData.code = 2;
      responseData.message = '密码不能为空';
      // 注册失败，删除上传的头像
      unlink_file_fun()
      res.json(responseData);
      return;
  }
  //两次输入的密码必须一致
  if (userpsw != reuserpsw) {
      responseData.code = 3;
      responseData.message = '两次输入的密码不一致';
      // 注册失败，删除上传的头像
      unlink_file_fun()
      res.json(responseData);
      return;
  }
  //没上传头像
  if(!req.files.avatar){
    responseData.code = 4;
    responseData.message = '请上传头像';
    res.json(responseData);
    return;
  }
  let avatar = req.files.avatar.path.split(path.sep).pop()
  User.findOne({username}).then((userInfo) => {
    if(userInfo){
      // 说明数据库中有该用户
      responseData.code = 5;
      responseData.message = '用户名已经被注册了';
      // 注册失败，删除上传的头像
      unlink_file_fun()
      res.json(responseData);
      return;
    }
    //保存用户注册的信息到数据库中
    let user = new User({
        username,
        userpsw:sha1(userpsw),
        sex,
        explain,
        avatar
    });
    return user.save();
  }).then((newUserInfo) => {
    console.log(newUserInfo)
    responseData.message = '注册成功'
    let userinfo = newUserInfo
    delete userinfo.userpsw
    responseData.userinfo = userinfo
    res.json(responseData);
  })
})
// POST /signin 用户登录
router.post('/signin', checkNotLogin, (req, res, next) => {
  let { username, userpsw} = req.fields;
  console.log(username,userpsw)
  if ( username == '' || userpsw == '' ) {
      responseData.code = 1;
      responseData.message = '用户名和密码不能为空';
      res.json(responseData);
      return;
  }
  User.findOne({username,userpsw:sha1(userpsw)}).then((userInfo) => {
    console.log(userInfo)
    if(!userInfo){
      responseData.code = 2;
      responseData.message = '用户名或密码错误';
      res.json(responseData);
      return;
    }
     //用户名和密码是正确的
     responseData.message = '登录成功';
     responseData.userInfo = {
        _id: userInfo._id,
        username: userInfo.username
    }
    // req.session.user = userInfo
    res.json(responseData);
    return;
  })
})

module.exports = router
