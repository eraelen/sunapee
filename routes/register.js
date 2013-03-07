/*
 * GET register page.
 */

exports.regInfo = function(req, res){
  res.render('register',{title: 'Tweetee'});
};