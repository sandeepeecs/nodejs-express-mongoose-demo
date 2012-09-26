// phoneno schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var PhonenoSchema = new Schema({
    mobileno: {type : String}
  , user: {type : Schema.ObjectId, ref : 'User'}
  , extension: {type : String, default : '', trim : true}
  , varify: {type : Boolean, default : 'false'}
  , varificationcode: {type : String, default : '', trim : true}
  , createdAt  : {type : Date, default : Date.now}
})


PhonenoSchema.path('mobileno').validate(function (mobileno) {
	console.log(mobileno.length)
  return mobileno.length > 9
}, 'Mobile number should be 10 digits')



mongoose.model('Phoneno', PhonenoSchema)