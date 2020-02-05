
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
const routesConfig = "../../server/config/routes.config.js";


const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

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

function askSchemaFields() {
  const questions = [
    {
      name: "fieldName",
      type: "input",
      message: `Enter the ${chalk.keyword("green")("field name")} using camel case:`
    },
    {
      name: "fieldType",
      type: "list",
      message: `Select the ${chalk.keyword("green")("field type")} from the following list:`,
      choices: ["String", "Number", "Date", "Buffer", "Boolean", "Mixed", { value: "mongoose.Schema.Types.ObjectId", name: "ObjectId" }, "Array", "Decimal128", "Map"]
    },
    {
      name: "fieldProps",
      type: "checkbox",
      message: `Select with space bar if the field is ${chalk.keyword("green")("required")} and/or ${chalk.keyword("green")("unique")} or none:`,
      choices: ["required", "unique"]
    },
    {
      name: "addNew",
      message: "Add a new field?",
      type: "confirm",
      default: true
    }
  ];

  return inquirer.prompt(questions);
}

/**
 * read route file for register new routes
 */

const registerNewRoutes = (resourceSingular) => {
  // these markers are used to find the required line numbers for route registering
  const routeFileMarker = /route definition/;
  const routeInitMarker = /routes initializers/;

  let fileLineNumber = null;
  let initLineNumber = null;

  const data = fs.readFileSync(`${__dirname}/${routesConfig}`).toString().split("\n");

  // search for marker strings and get line numbers. maybe not the best way
  data.forEach((line, index) => {
    if (line.match(routeFileMarker)) {
      fileLineNumber = index;
      // console.log(`${index} - ${line}`);
    }

    if (line.match(routeInitMarker)) {
      initLineNumber = index;
      // console.log(`${index} - ${line}`);
    }
  });

  if (fileLineNumber && initLineNumber) {
    data.splice(fileLineNumber, 0, `const { ${capitalize(resourceSingular)}Routes } = require("../api/${resourceSingular}/routes/${resourceSingular}-routes");\n`);
    data.splice(initLineNumber, 0, `    ${capitalize(resourceSingular)}Routes.init(router);`);
  }

  const text = data.join("\n");

  fs.writeFile(`${__dirname}/${routesConfig}`, text, (err) => {
    if (err) return console.log(err);
  });
};

const addNewResource = async () => {
  let { modelName, modelNamePlural } = await askResourceQuestions();
  const fieldList = [];
  let continueAskingFields = true;

  // ask for fields - not generating the schema template yet (WIP)
  log.info("\n");
  log.info(`Insert the fields for ${chalk.keyword("yellow")(modelName)} schema`);
  while (continueAskingFields) {
    const { addNew, fieldName, fieldType, fieldProps } = await askSchemaFields();
    fieldList.push({ fieldName, fieldType, fieldProps });
    continueAskingFields = addNew;
    log.info(`${chalk.keyword("yellow")("-------------------------")}`);
  }

  const modelNameLower = modelName.toLowerCase();
  const modelNamePluralLower = modelNamePlural.toLowerCase();
  modelName = modelNameLower.charAt(0).toUpperCase() + modelNameLower.slice(1);
  modelNamePlural = modelNamePluralLower.charAt(0).toUpperCase() + modelNamePluralLower.slice(1);
  const templateData = {
    modelName,
    modelNameLower,
    modelNamePlural,
    modelNamePluralLower,
    fieldList
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
      const destinationFolderPath = path.join(workingDirectory, "..", "server", "api", modelNameLower, folderName);
      let destinationFilePath = null;

      if (folderName === "test") {
        destinationFilePath = path.join(workingDirectory, "..", "server", "api", modelNameLower, folderName, `${modelNameLower}.${folderName}.js`);
      } else {
        destinationFilePath = path.join(workingDirectory, "..", "server", "api", modelNameLower, folderName, `${modelNameLower}-${folderName}.js`);
      }

      createDir(destinationFolderPath);
      createFile(destinationFilePath, fileContents);
    }
  });

  registerNewRoutes(modelNameLower);

  log.info(boxen(`Resource ${chalk.keyword("orange")(modelName)} has been created succesfully!`, { padding: 1 }));
};

module.exports = {
  addNewResource,
  registerNewRoutes
};
