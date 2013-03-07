/*
 * GET forgotlogin page.
 */

exports.forgotlog = function(req, res){
  res.render('forgotlogin',{title: 'Tweetee'});
};
