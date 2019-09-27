const {
  checkApiKey, checkJwt, shapeQuery,
} = require('../../../middleware');
const { UserSchema } = require('../model/user-model');
const { UserController } = require('../controller/user-controller');

class UserRoutes {
  static init(router) {
    const userController = new UserController();

    router
      .route('/api/users')
      .post([checkApiKey, checkJwt, userController.createNew])
      .get([checkApiKey, shapeQuery(UserSchema), userController.getAll]);

    router
      .route('/api/users/signup')
      .post(userController.signup);

    router
      .route('/api/users/confirmEmail')
      .post(userController.confirmEmail);

    router
      .route('/api/users/:id')
      .get([checkApiKey, userController.getById])
      .put([checkApiKey, checkJwt, userController.updateById])
      .delete([checkApiKey, checkJwt, userController.removeById]);

    router
      .route('/api/login')
      .post(userController.login);
  }
}

module.exports = { UserRoutes };
