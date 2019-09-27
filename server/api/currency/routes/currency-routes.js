const { checkApiKey, checkJwt, shapeQuery } = require('../../../middleware');
const { CurrencySchema } = require('../model/currency-model');
const { CurrencyController } = require('../controller/currency-controller');

class CurrencyRoutes {
  static init(router) {
    const currencyController = new CurrencyController();

    router
      .route('/api/currencies')
      .post([checkApiKey, checkJwt, currencyController.createNew])
      .get([checkApiKey, shapeQuery(CurrencySchema), currencyController.getAll]);

    router
      .route('/api/currencies/:id')
      .get([checkApiKey, currencyController.getById])
      .patch([checkApiKey, checkJwt, currencyController.updateById])
      .delete([checkApiKey, checkJwt, currencyController.removeById]);
  }
}

module.exports = { CurrencyRoutes };
