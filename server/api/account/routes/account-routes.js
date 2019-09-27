const {
  checkApiKey, checkJwt, shapeQuery, checkSuperAdmin,
} = require('../../../middleware');
const { AccountSchema } = require('../model/account-model');
const { AccountController } = require('../controller/account-controller');

class AccountRoutes {
  static init(router) {
    const accountController = new AccountController();

    router
      .route('/api/accounts')
      .post([checkApiKey, checkJwt, checkSuperAdmin, accountController.createNew])
      .get([checkApiKey, shapeQuery(AccountSchema), checkSuperAdmin, accountController.getAll]);

    router
      .route('/api/accounts/:id')
      .get([checkApiKey, accountController.getById])
      .patch([checkApiKey, checkJwt, accountController.updateById])
      .delete([checkApiKey, checkJwt, checkSuperAdmin, accountController.removeById]);
  }
}

module.exports = { AccountRoutes };
