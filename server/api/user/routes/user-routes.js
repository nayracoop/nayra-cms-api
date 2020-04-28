const { check, checkSchema } = require("express-validator");
const {
  checkJwt, shapeQuery, validateSchema
} = require("../../../middleware");
const { UserSchema, UserValidationSchema } = require("../model/user-model");
const { UserController } = require("../controller/user-controller");

class UserRoutes {
  static init(router) {
    const userController = new UserController();

    router
      .route("/api/users")
      .post([checkJwt, validateSchema(checkSchema(UserValidationSchema)), userController.createNew])
      .get([checkJwt, check("emailConfirmed").optional().isIn(["true", "false"]), shapeQuery(UserSchema), userController.getAll]);

    router
      .route("/api/users/signup")
      .post([validateSchema(checkSchema(UserValidationSchema)), userController.signup]);

    // router
    //   .route("/api/users/confirmEmail")
    //   .post(userController.confirmEmail);

    router
      .route("/api/users/:id")
      .get([checkJwt, userController.getById])
      .put([checkJwt, validateSchema(checkSchema(UserValidationSchema)), userController.updateById])
      .delete([checkJwt, userController.removeById]);

    router
      .route("/api/login")
      .post([check("username").exists().isString(), check("password").exists().isString(), userController.login]);
  }
}

module.exports = { UserRoutes };
