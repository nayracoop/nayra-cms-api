const mongoose = require("mongoose");
const { normalizeAndLogError } = require("../errors");

class DBConfig {
  static init() {
    const env = process.env.NODE_ENV.toUpperCase();
    const uri_string = `DB_URI_${env}`;
    const DB_URI = process.env[uri_string];
    
    mongoose.connect(DB_URI, { useNewUrlParser: true, useCreateIndex: true });
    mongoose.connection.on("error", (error) => {
      const throwable = normalizeAndLogError("dbConnection", { id: -1 }, error);
      throw throwable;
    });
  }
}

module.exports = { DBConfig };
