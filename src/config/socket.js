const socketIO = require('socket.io')
let socket;

const connection = server => {
    const io = socketIO.listen(server);
    io.on('connection', newSocket => {
       //solo al nuevo sockets
        // socket= newSocket;

       //todos los soctes
      //    socket= io;
       newSocket.on('mensaje', function (data) {
      
        newSocket.join(data);

      
       });

       socket = io;
       
    })

}  

const getSocket = ()=>socket;

module.exports ={connection, getSocket}