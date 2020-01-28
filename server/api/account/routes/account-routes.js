const {
  checkJwt, shapeQuery, checkSuperAdmin
} = require("../../../middleware");
const { AccountSchema } = require("../model/account-model");
const { AccountController } = require("../controller/account-controller");

class AccountRoutes {
  static init(router) {
    const accountController = new AccountController();

    router
      .route("/api/accounts")
      .post([checkJwt, checkSuperAdmin, accountController.createNew])
      .get([checkJwt, shapeQuery(AccountSchema), checkSuperAdmin, accountController.getAll]);

    router
      .route("/api/accounts/:id")
      .get([checkJwt, accountController.getById])
      .patch([checkJwt, accountController.updateById])
      .delete([checkJwt, checkSuperAdmin, accountController.removeById]);
  }
}

module.exports = { AccountRoutes };
