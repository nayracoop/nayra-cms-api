const mongoose = require("mongoose");
const { normalizeAndLogError } = require("../errors");

class DBConfig {
  static init() {
    const DB_URI = process.env.MONGO_DB_URI;

    mongoose.connect(DB_URI, { useNewUrlParser: true, useCreateIndex: true });
    mongoose.connection.on("error", (error) => {
      const throwable = normalizeAndLogError("dbConnection", { id: -1 }, error);
      throw throwable;
    });
  }
}

module.exports = { DBConfig };
