module.exports = function (app) {
    app.get('/',(req, res) => {
      res.redirect('/signup')
    })
    app.use('/signup', require('./signup'))
    app.use('/signin', require('./signin'))
    app.use('/api',require('./api/sign_api'))
    app.use('/signout', require('./signout'))
    app.use('/posts', require('./posts'))
    app.use('/comments', require('./comments'))
}
