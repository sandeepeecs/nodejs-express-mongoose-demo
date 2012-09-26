
var mongoose = require('mongoose')
  , Article = mongoose.model('Article')
  , Phoneno = mongoose.model('Phoneno')
  , User = mongoose.model('User')
  , async = require('async')

module.exports = function (app, passport, auth) {

  // user routes
  var users = require('../app/controllers/users')
  app.get('/login', users.login)
  app.get('/signup', users.signup)
  app.get('/logout', users.logout)
  app.post('/users', users.create)
  app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login'}), users.session)
  app.get('/users/:userId', users.show)

  app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email', 'user_about_me' ], failureRedirect: '/login' }), users.signin)
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), users.authCallback)

  //disabling all other login stratagies 
 /* 
  app.get('/auth/github', passport.authenticate('github', { failureRedirect: '/login' }), users.signin)
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), users.authCallback)
  app.get('/auth/twitter', passport.authenticate('twitter', { failureRedirect: '/login' }), users.signin)
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), users.authCallback)
  app.get('/auth/google', passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }), users.signin)
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }), users.authCallback)
  */

  app.param('userId', function (req, res, next, id) {
    User
      .findOne({ _id : id })
      .exec(function (err, user) {
        if (err) return next(err)
        if (!user) return next(new Error('Failed to load User ' + id))
        req.profile = user
        next()
      })
  })

  // article routes
  var articles = require('../app/controllers/articles')
  app.get('/articles', articles.index)
  app.get('/articles/new', auth.requiresLogin, articles.new)
  app.post('/articles', auth.requiresLogin, articles.create)
  app.get('/articles/:id', articles.show)
  app.get('/articles/:id/edit', auth.requiresLogin, auth.article.hasAuthorization, articles.edit)
  app.put('/articles/:id', auth.requiresLogin, auth.article.hasAuthorization, articles.update)
  app.del('/articles/:id', auth.requiresLogin, auth.article.hasAuthorization, articles.destroy)

  app.param('id', function(req, res, next, id){
    Article
      .findOne({ _id : id })
      .populate('user', 'name')
      .populate('comments')
      .exec(function (err, article) {
        if (err) return next(err)
        if (!article) return next(new Error('Failed to load article ' + id))
        req.article = article

        var populateComments = function (comment, cb) {
          User
            .findOne({ _id: comment._user })
            .select('name')
            .exec(function (err, user) {
              if (err) return next(err)
              comment.user = user
              cb(null, comment)
            })
        }

        if (article.comments.length) {
          async.map(req.article.comments, populateComments, function (err, results) {
            next(err)
          })
        }
        else
          next()
      })
  })

  // home route
  app.get('/', articles.index)

  // comment routes
  var comments = require('../app/controllers/comments')
  app.post('/articles/:id/comments', auth.requiresLogin, comments.create)

  // tag routes
  var tags = require('../app/controllers/tags')
  app.get('/tags/:tag', tags.index)
  
  
    var stripeApiKey = "...";
    var stripeApiKeyTesting = "zVSNtVQkWf2VCeorfT62MAJtsSlkp0ag"
    var stripe = require('stripe')(stripeApiKeyTesting);
    
   
    
    app.post("/plans/pay", function(req, res) {
      stripe.customers.create({
        card : req.body.stripeToken,
        email : "...", // customer's email (get it from db or session)
        plan : "cf_dev"
      }, function (err, customer) {
        if (err) {
          var msg = customer.error.message || "unknown";
          res.send("Error while processing your payment: " + msg);
        }
        else {
          var id = customer.id;
          console.log('Success! Customer with Stripe ID ' + id + ' just signed up!');
          // save this customer to your database here!
          res.send('ok');
        }
      });
    });
  
  
//phone number routes.
var phonenos = require('../app/controllers/phonenos')
  app.get('/phonenos', phonenos.index)
  app.get('/phonenos/new', auth.requiresLogin, phonenos.new)
  app.post('/phonenos', auth.requiresLogin, phonenos.create)
  app.get('/phonenos/:no', phonenos.show)
  app.del('/phonenos/:no', auth.requiresLogin, auth.phoneno.hasAuthorization, phonenos.destroy)

  app.param('no', function(req, res, next, no){
    Phoneno
      .findOne({ _id : no })
      .populate('user', 'name')
      .exec(function (err, phoneno) {
        if (err) return next(err)
        if (!phoneno) return next(new Error('Failed to load phoneno ' + no))
        req.phoneno = phoneno
        next()
      })
  })


}
