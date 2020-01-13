const { authJwt, checkJwt, shapeQuery } = require('../../../middleware');
const { AppVersionController } = require('../controller/app-version-controller');
const { AppVersionSchema } = require('../model/app-version-model');

class AppVersionRoutes {
  static init(router) {
    const appVersionController = new AppVersionController();

    router
      .route('/api/appVersions')
      .post([authJwt, checkJwt, appVersionController.createNew])
      .get([authJwt, checkJwt, shapeQuery(AppVersionSchema), appVersionController.getAll]);

    router
      .route('/api/appVersions/:id')
      .get([authJwt, checkJwt, appVersionController.getById])
      .patch([authJwt, checkJwt, appVersionController.updateById])
      .delete([authJwt, checkJwt, appVersionController.removeById]);

    router
      .route('/api/appVersions/:version/checkUpdates')
      .get([authJwt, checkJwt, appVersionController.checkUpdates]);
  }
}

module.exports = { AppVersionRoutes };
