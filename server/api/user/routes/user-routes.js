const { check, checkSchema } = require("express-validator");
const guard = require("express-jwt-permissions")();
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
      .post([checkJwt, guard.check(["user:create"]), validateSchema(checkSchema(UserValidationSchema)), userController.createNew])
      .get([checkJwt, guard.check(["user:read"]), validateSchema(checkSchema(UserValidationSchema)), check("emailConfirmed").optional().isIn(["true", "false"]), shapeQuery(UserSchema), userController.getAll]);

    router
      .route("/api/users/signup")
      .post(
        [
          [
            check("emailConfirmed").not().exists().withMessage("emailConfirmed field not allowed"),
            check("accountId").not().exists().withMessage("accountId field not allowed")
          ],
          validateSchema(checkSchema(UserValidationSchema)),
          userController.signup
        ]
      );

    // router
    //   .route("/api/users/confirmEmail")
    //   .post(userController.confirmEmail);

    router
      .route("/api/users/:id")
      .get([checkJwt, guard.check(["user:read"]), userController.getById])
      .put([checkJwt, guard.check(["user:update"]), validateSchema(checkSchema(UserValidationSchema)), userController.updateById])
      .delete([checkJwt, guard.check(["user:delete"]), userController.removeById]);

    router
      .route("/api/login")
      .post([check("username").exists().isString(), check("password").exists().isString(), userController.login]);
  }
}

module.exports = { UserRoutes };
