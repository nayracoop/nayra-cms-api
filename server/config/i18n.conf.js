const i18n = require("i18n");

class LanguageConfig {
  static init(app) {
    i18n.configure({
      locales: ["en", "es", "de"],
      directory: `${__dirname}/locales`
    });

    i18n.setLocale(process.env.LOCALE || "es");
    app.use(i18n.init);
  }
}

module.exports = { LanguageConfig };
