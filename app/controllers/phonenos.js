
var mongoose = require('mongoose')
  , Phoneno = mongoose.model('Phoneno')
  , _ = require('underscore')

// New Phoneno
exports.new = function(req, res){
  res.render('phonenos/new', {
      title: 'New phoneno'
    , phoneno: new Phoneno({})
  })
}


// Create an phoneno
exports.create = function (req, res) {
  var phoneno = new Phoneno(req.body)
  phoneno.user = req.user

  phoneno.save(function(err){
    if (err) {
      res.render('phonenos/new', {
          title: 'New Phoneno'
        , phoneno: phoneno
        , errors: err.errors
      })
    }
    else {
      res.redirect('/phonenos/'+phoneno._id)
    }
  })
}



// View an article
exports.show = function(req, res){
  res.render('Phonenos/show', {
    title: req.phoneno.mobileno,
    phoneno: req.phoneno
   })
}


// Delete an article
exports.destroy = function(req, res){
  var phoneno = req.phoneno
  console.log('req')
  phoneno.remove(function(err){
        // req.flash('notice', 'Deleted successfully')
    res.redirect('/phonenos')
  })
}


// Listing of Articles
exports.index = function(req, res){
  var perPage = 5
    , page = req.param('page') > 0 ? req.param('page') : 0

  Phoneno
    .find({})
    .populate('user', 'name')
    .sort({'createdAt': -1}) // sort by date
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, phonenos) {
      if (err) return res.render('500')
      Phoneno.count().exec(function (err, count) {
        res.render('phonenos/index', {
            title: 'List of phones'
          , phonenos: phonenos
          , page: page
          , pages: count / perPage
        })
      })
    })
}

