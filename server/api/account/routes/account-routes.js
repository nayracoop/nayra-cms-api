const {
  authJwt, checkJwt, shapeQuery, checkSuperAdmin
} = require('../../../middleware');
const { AccountSchema } = require('../model/account-model');
const { AccountController } = require('../controller/account-controller');

class AccountRoutes {
  static init(router) {
    const accountController = new AccountController();

    router
      .route('/api/accounts')
      .post([authJwt, checkJwt, checkSuperAdmin, accountController.createNew])
      .get([authJwt, checkJwt, shapeQuery(AccountSchema), checkSuperAdmin, accountController.getAll]);

    router
      .route('/api/accounts/:id')
      .get([authJwt, checkJwt, accountController.getById])
      .patch([authJwt, checkJwt, accountController.updateById])
      .delete([authJwt, checkJwt, checkSuperAdmin, accountController.removeById]);
  }
}

module.exports = { AccountRoutes };
