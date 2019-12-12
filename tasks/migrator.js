const fs = require('fs');
const _ = require('lodash');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: '../.env' });

const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbLocalPort = process.env.DB_PORT;

const url = `mongodb://${dbUsername}:${dbPassword}@localhost:${dbLocalPort}`;
const dbName = process.env.DB_DATABASE;
const client = new MongoClient(url, { useNewUrlParser: true });
const migrationsPath = './migrations';

let db = null;
let dbVersion = null;
let somethingRan = false;

const up = async (cb) => {
  await setup()
  getFiles((err, files) => {
    if (err) {
      console.error(err)
      process.exit(0)
    }
    if (!files || !files.length) {
      console.log('Nothing to migrate: no files')
      if (!cb) {
        process.exit(0)
      } else {
        cb(null)
        return
      }
    }

    (function run (files) {
      const file = files.shift()
      if (file) {
        tryToRun(file, () => {
          run(files)
        })
      } else {
        console.log(somethingRan ? 'Migration successful' : 'Nothing to migrate: already up to date')
        client.close()
        if (!cb) {
          process.exit(0)
        } else {
          cb(null)
        }
      }
    }(files))
  })
}

const setup = async () => {
  console.log(`Connecting to this MongoDB: ${dbName}`)
  await client.connect()
  db = client.db(dbName)
  dbVersion = db.collection('db_version')
}

const getFiles = (cb) => {
  let files = fs.readdirSync(migrationsPath)
  files = _.sortBy(files, (file) => {
    return file
  })
  cb(null, files)
}

const setVersion = (version) => {
  console.log(`Migrated to version: ${version}`)
  somethingRan = true

  try {
    dbVersion.insertOne({
      script: version,
      applied: new Date().getTime()
    })
  } catch (err) {
    console.log(`Couldn't set the version to: ${version} ${err.message}`)
    process.exit(1)
  }
}

const checkIfRun = (version, cb) => {
  dbVersion.findOne({ script: version }, (err, result) => {
    cb(err, !result)
  })
}

const tryToRun = (file, cb) => {
  const migration = require(`${migrationsPath}/${file}`)
  const version = migration.getVersion()

  checkIfRun(version, (err, not) => {
    if (err) {
      console.error(err)
      cb(err)
    } else if (not) {
      console.log(`Start migration to version: ${version}`)
      migration.up(db, (err, result) => {
        if (err) {
          console.error(err)
          if (!cb) {
            process.exit(1)
          } else {
            cb(err)
          }
        }
        if (result) {
          setVersion(version)
        }
        cb()
      })
    } else {
      cb()
    }
  })
}

exports.up = up
