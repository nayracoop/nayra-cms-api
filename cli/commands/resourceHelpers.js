
require("dotenv").config({ path: "../.env" });
const inquirer = require("inquirer");
const chalk = require("chalk");
const boxen = require("boxen");

const path = require("path");
const fs = require("fs");
const ejs = require("ejs");


const log = require("../utils/logger");
const { createDir, createFile } = require("../utils/files");

const apiPath = "../server/api";


function askResourceQuestions() {
  const questions = [
    {
      name: "modelName",
      type: "input",
      message: `Enter the ${chalk.keyword("orange")("name")} of the new model (singular)`,
      validate: (value) => {
        const match = value.match(/^(?=.{2,30}$)[0-9a-zA-Z]+$/);
        return (match) ? true : "Please provide a valid plural model name (only alphanumeric characters, no spaces)";
      }
    },
    {
      name: "modelNamePlural",
      type: "input",
      message: `Enter the ${chalk.keyword("orange")("plural name")} of the new model`,
      validate: (value) => {
        const match = value.match(/^(?=.{2,30}$)[0-9a-zA-Z]+$/);
        return (match) ? true : "Please provide a valid plural model name (only alphanumeric characters, no spaces)";
      }
    }
  ];
  return inquirer.prompt(questions);
}

function createFoldersAndFiles(name) {
  const resourceFolders = [
    "controller", "dao", "model", "routes", "tests"
  ];

  const baseDir = `${apiPath}/${name}`;

  log.info(`Creating api resources for: ${name}`);

  createDir(`${baseDir}`);
  log.info(`created new folder ${baseDir}`);

  resourceFolders.forEach((f) => {
    const resourceSubDir = `${baseDir}/${f}`;
    createDir(resourceSubDir);
    createFile(`${resourceSubDir}/${name}-${f}.js`);
  });
}

const addNewResource = async () => {
  let { modelName, modelNamePlural } = await askResourceQuestions();
  const modelNameLower = modelName.toLowerCase();
  const modelNamePluralLower = modelNamePlural.toLowerCase();
  modelName = modelNameLower.charAt(0).toUpperCase() + modelNameLower.slice(1);
  modelNamePlural = modelNamePluralLower.charAt(0).toUpperCase() + modelNamePluralLower.slice(1);
  const templateData = {
    modelName,
    modelNameLower,
    modelNamePlural,
    modelNamePluralLower
  };
  const templatePath = path.join(__dirname, "..", "templates", "resources");

  const filesToCreate = fs.readdirSync(templatePath);

  const workingDirectory = process.cwd();

  const resourcePath = path.join(workingDirectory, "..", "server/api", modelNameLower);
  createDir(resourcePath);

  filesToCreate.forEach((file) => {
    const templateFilePath = path.join(templatePath, file);

    let fileContents = fs.readFileSync(templateFilePath, "utf8");
    fileContents = ejs.render(fileContents, templateData);
    const index = file.indexOf(".");
    if (index > 0) {
      const folderName = file.substring(0, index);
      const destinationFolderPath = path.join(workingDirectory, "..", "server","api", modelNameLower, folderName);
      const destinationFilePath = path.join(workingDirectory, "..", "server","api", modelNameLower, folderName, `${modelNameLower}-${folderName}.js`);

      createDir(destinationFolderPath);
      createFile(destinationFilePath, fileContents);
    }
  });
  log.info(boxen(`Resource ${chalk.keyword("orange")(modelName)} has been created succesfully!`, { padding: 1 }));
};


module.exports = {
  addNewResource,
  createFoldersAndFiles
};
