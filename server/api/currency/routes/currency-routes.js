const { checkJwt, shapeQuery } = require('../../../middleware');
const { CurrencySchema } = require('../model/currency-model');
const { CurrencyController } = require('../controller/currency-controller');

class CurrencyRoutes {
  static init(router) {
    const currencyController = new CurrencyController();

    router
      .route('/api/currencies')
      .post([checkJwt, currencyController.createNew])
      .get([checkJwt, shapeQuery(CurrencySchema), currencyController.getAll]);

    router
      .route('/api/currencies/:id')
      .get([checkJwt, currencyController.getById])
      .patch([checkJwt, currencyController.updateById])
      .delete([checkJwt, currencyController.removeById]);
  }
}

module.exports = { CurrencyRoutes };
