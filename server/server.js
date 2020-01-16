const PORT = process.env.NAYRA_CMS_API_PORT || 3333;
const HOST = process.env.NAYRA_CMS_API_HOST || "localhost";

const http = require("http");
const express = require("express");

const app = express();

const { DBConfig } = require("./config/db.conf");
const { LanguageConfig } = require("./config/i18n.conf");
const { PassportConfig } = require("./config/passport.conf");
const { LoggerConfig } = require("./config/logger.config");
const { RoutesConfig } = require("./config/routes.config");
const { SocketIoConfig } = require("./config/socket.io.conf");

LoggerConfig.init(app);
DBConfig.init();
LanguageConfig.init(app);
PassportConfig.init(app);
RoutesConfig.init(app, express.Router());

const httpServer = http.createServer(app).listen(PORT, HOST, () => {
  LoggerConfig.getChild("server.js").info(`Server started on ${HOST}:${PORT}`);
  SocketIoConfig.init(httpServer);
});

module.exports = app;
