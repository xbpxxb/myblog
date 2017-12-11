module.exports = {
  port: 3000,
  session: {
    secret: 'myblog',
    key: 'myblog',
    maxAge: 2592000000
  },

  mongodb: 'mongodb://xbp:xbp@ds033196.mlab.com:33196/blog'
}
