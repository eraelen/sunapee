/**
 * #Tweetee Application
 * 
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , entry = require('./routes/entry')
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash')
  , fs = require('fs')
  , formidable = require('formidable');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(flash());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//##Entry Related Routes
app.get('/', entry.login);    
app.post('/userAuth',entry.userAuth);
app.get('/register', entry.register);
app.get('/forgotlogin', entry.forgotlogin);
app.get('/logout', entry.logout);
app.post('/verify',entry.verify);
app.get('/verifyCode',entry.verifyCode);
app.post('/codeCheck',entry.codeCheck);
app.get('/forgotlogin', entry.forgotlogin);
app.post('/forgotloginProcess', entry.forgotloginProcess);

//##User Related Routes

//###1. Main Routes
app.get('/:id/home', routes.home);
app.post('/:id/home', routes.home);
app.get('/:id/interaction', routes.interaction);
app.get('/:id/profile', routes.profile);

//###2. Follower and Following Routes
app.get('/:id/follower', routes.follower);
app.get('/:id/following', routes.following);
app.post('/deleteFollower', routes.deleteFollower);
app.post('/unfollow', routes.unfollow);
app.post('/follow', routes.follow);

//###3. Search, Help, Tweet Routes
app.post('/newtweet', routes.newtweet);
app.post('/:id/newtweet', routes.newtweet);
app.get('/help',routes.help);
app.get('/searchT/:query', routes.searchT);
app.get('/searchP/:query', routes.searchP);
app.post('/searchBox',routes.searchBox);
app.get('/:tweetId/detailedTweet', routes.detailedTweet);
app.post('/:tweetId/detailedTweetReply', routes.detailedTweetReply);
app.get('/:tweetId/simpleReply', routes.simpleReply);
app.post('/:tweetId/displaySimpleReply', routes.detailedTweetReply);

//###4. Edit Content Routes
app.get('/:id/editProfile', routes.editProfile);
app.get('/:id/editSettings', routes.editSettings);
app.post('/:id/changeSettings', routes.changeSettings);
app.post('/:id/changeProfile', routes.changeProfile);
app.post('/:id/changeProfilePic', routes.changeProfilePic);
app.get('/pm', routes.pm);

app.get('/chat', routes.chat);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// WebSockets/Socket.IO
var io      = require('socket.io', {'log level': 0}).listen(server);
var chatApp = require('./chat');

io.sockets.on('connection', function (socket) {
  chatApp.init(socket);
});