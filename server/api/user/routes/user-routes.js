const {
  authJwt, checkJwt, shapeQuery
} = require("../../../middleware");
const { UserSchema } = require("../model/user-model");
const { UserController } = require("../controller/user-controller");

class UserRoutes {
  static init(router) {
    const userController = new UserController();

    router
      .route("/api/users")
      .post([authJwt, checkJwt, userController.createNew])
      .get([authJwt, checkJwt, shapeQuery(UserSchema), userController.getAll]);

    router
      .route("/api/users/signup")
      .post(userController.signup);

    router
      .route("/api/users/confirmEmail")
      .post(userController.confirmEmail);

    router
      .route("/api/users/:id")
      .get([authJwt, checkJwt, userController.getById])
      .put([authJwt, checkJwt, userController.updateById])
      .delete([authJwt, checkJwt, userController.removeById]);

    router
      .route("/api/login")
      .post(userController.login);
  }
}

module.exports = { UserRoutes };
