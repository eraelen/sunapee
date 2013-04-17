var users = require('../lib/users');

// Server-side support for chat app:
exports.init = function (socket) {
  socket.on('post', function (data) {
    console.log('Received post: ' + JSON.stringify(data));
    //socket.broadcast.emit('post', data);
    console.log("Other User:"+data.otherUser);
    socket.join(data.otherUser);
    socket.join();
    socket.broadcast.to(data.otherUser).emit('post', data);
  });
};

function savePM(data){
    
}