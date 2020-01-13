const { authJwt, checkJwt, shapeQuery } = require('../../../middleware');
const { CurrencySchema } = require('../model/currency-model');
const { CurrencyController } = require('../controller/currency-controller');

class CurrencyRoutes {
  static init(router) {
    const currencyController = new CurrencyController();

    router
      .route('/api/currencies')
      .post([authJwt, checkJwt, currencyController.createNew])
      .get([authJwt, checkJwt, shapeQuery(CurrencySchema), currencyController.getAll]);

    router
      .route('/api/currencies/:id')
      .get([authJwt, checkJwt, currencyController.getById])
      .patch([authJwt, checkJwt, currencyController.updateById])
      .delete([authJwt, checkJwt, currencyController.removeById]);
  }
}

module.exports = { CurrencyRoutes };
