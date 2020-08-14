let socketio = {};

socketio.init = (server) => {
  const options = {
    pingTimeout: 5000,
  };

  let io = require("socket.io").listen(server, options);
};

module.exports = socketio;
