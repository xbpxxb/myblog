const express = require('express')
const router = express.Router()

const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signin 登录页
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signin',{
     blog:{title:'登录',styleSrc:'/css/signin.css'}
  })
})



module.exports = router
