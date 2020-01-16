require("dotenv").config();
require("./server/server");

process.env.NODE_ENV = process.env.NODE_ENV || "development";