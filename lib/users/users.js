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
  storage: './data/userinfo.db'
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

sequelize.sync();

  exports.getUserById = function(uname, scb) {
    users.find({where: {username: uname}}).success(scb);
  }
  

  exports.getFollowing = function(uname, scb) {
    isfollowing.findAll({where: {username: uname}}).success(scb);
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