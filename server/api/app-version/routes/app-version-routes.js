const { checkJwt, shapeQuery } = require('../../../middleware');
const { AppVersionController } = require('../controller/app-version-controller');
const { AppVersionSchema } = require('../model/app-version-model');

class AppVersionRoutes {
  static init(router) {
    const appVersionController = new AppVersionController();

    router
      .route('/api/appVersions')
      .post([checkJwt, appVersionController.createNew])
      .get([checkJwt, shapeQuery(AppVersionSchema), appVersionController.getAll]);

    router
      .route('/api/appVersions/:id')
      .get([checkJwt, appVersionController.getById])
      .patch([checkJwt, appVersionController.updateById])
      .delete([checkJwt, appVersionController.removeById]);

    router
      .route('/api/appVersions/:version/checkUpdates')
      .get([checkJwt, appVersionController.checkUpdates]);
  }
}

module.exports = { AppVersionRoutes };
