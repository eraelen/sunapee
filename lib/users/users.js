var async = require('async');

// Data access layer for sailors.
var Sequelize = require('sequelize');

var sequelize = new Sequelize('database', 'username', 'password', {
  // sqlite! now!
  dialect: 'sqlite',

  // disable logging to console.log
  logging: false,

  // the storage engine for sqlite
  // - default ':memory:'
  storage: './data/all.db'
});

var users = sequelize.define('users', {
  username: Sequelize.STRING,
  name: Sequelize.STRING,
  uid: Sequelize.INTEGER ,
  password: Sequelize.STRING,
  email: Sequelize.STRING,
  location: Sequelize.STRING,
  website: Sequelize.STRING,
  profilepic: Sequelize.STRING,
  profvis: Sequelize.STRING,
  mentionperm: Sequelize.STRING,
  pmperm: Sequelize.STRING,
  background: Sequelize.STRING,
});

var isfollowing = sequelize.define('isfollowings', {
  username: Sequelize.STRING,
  fusername: Sequelize.STRING
});

var tweets = sequelize.define('tweets', {
  tweetid: Sequelize.INTEGER,
  username: Sequelize.STRING,
  name: Sequelize.STRING,
  date: Sequelize.DATE,
  msg: Sequelize.STRING,
  reply: Sequelize.STRING,
  retweet: Sequelize.STRING,
  convo: Sequelize.INTEGER
  });

sequelize.sync();

exports.getUserById = function(uname, scb) {
  users.find({where: {username: uname}}).success(scb);
}


exports.getFollowing = function(uname, scb) {
  isfollowing.findAll({ where: {username: uname},
                      attributes: ['fusername']
                      }).success(function(fl){
    console.log(JSON.stringify(fl));
  });
/*
  sequelize.query("select fusername from isfollowings where username='"+uname+"'")
  .success(function(fl) { 
    console.log(JSON.parse(fl)); 
  });*/
}

exports.getUserTweets = function (uname, scb) {
  //sequelize.query("SELECT * FROM tweets where username='"+uname+"'").success(scb);
  tweets.findAll({where: {username: uname}}).success(scb);
}

exports.getRecentT = function(uname, scb) {
users.getFollowing(uname, function(fl){
  var fl = JSON.parse(fl).push(uname);
  async.each(fl, 
    function(following, cb) {

    },
    function(f){});
  tweets.findAll({where: {username: uname}})
});


}
/*
  exports.getTNumberById = function(uname, errcb, succb) {
    var promise = Userinfo.find({where: {username: uname}});
    promise.success(function(succb) {

    });
  }

  addUserT: function(msg) {

  }

  delUserT: function(msg) {

  }*/
  
 