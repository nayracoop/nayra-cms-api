const bodyParser = require("body-parser");
const contentLength = require("express-content-length-validator");
const helmet = require("helmet");
const express = require("express");
const compression = require("compression");
const zlib = require("zlib");
const cors = require("cors");

const MAX_CONTENT_LENGTH_ACCEPTED = 9999;

const { AccountRoutes } = require("../api/account/routes/account-routes");
const { UserRoutes } = require("../api/user/routes/user-routes");

// route definition - do not deletete this line

const { handleError } = require("../errors");

class RoutesConfig {
  static init(app, router) {
    app.use(compression({
      level: zlib.Z_BEST_COMPRESSION,
      threshold: "2kb"
    }));
    app.options("*", cors());
    app.use(cors());
    app.use(express.static(`${process.cwd()}/node_modules/`));
    app.use(bodyParser.json());
    app.use(contentLength.validateMax({
      max: MAX_CONTENT_LENGTH_ACCEPTED, status: 400, message: `Max content length exceeded: ${MAX_CONTENT_LENGTH_ACCEPTED}`
    }));
    app.use(helmet());

    AccountRoutes.init(router);
    UserRoutes.init(router);

    // routes initializers  - do not deletete this line

    app.use("/", router);
    app.use(handleError);
  }
}

module.exports = { RoutesConfig };
