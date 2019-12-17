const socketIo = require("socket.io");
const { LoggerConfig } = require("./logger.config");

let io;

class SocketIoConfig {
  static init(httpServer) {
    const logger = LoggerConfig.getChild("socketIo");
    logger.info("Socket IO started");
    io = socketIo(httpServer, { serveClient: false });
    io.on("connection", (_socket) => {
      logger.info("Client connected");
    });
    return io;
  }

  static get() {
    return io;
  }
}

module.exports = { SocketIoConfig };
