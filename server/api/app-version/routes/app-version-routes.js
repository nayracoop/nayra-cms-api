const { checkApiKey, checkJwt, shapeQuery } = require('../../../middleware');
const { AppVersionController } = require('../controller/app-version-controller');
const { AppVersionSchema } = require('../model/app-version-model');

class AppVersionRoutes {
  static init(router) {
    const appVersionController = new AppVersionController();

    router
      .route('/api/appVersions')
      .post([checkApiKey, checkJwt, appVersionController.createNew])
      .get([checkApiKey, shapeQuery(AppVersionSchema), appVersionController.getAll]);

    router
      .route('/api/appVersions/:id')
      .get([checkApiKey, appVersionController.getById])
      .patch([checkApiKey, checkJwt, appVersionController.updateById])
      .delete([checkApiKey, checkJwt, appVersionController.removeById]);

    router
      .route('/api/appVersions/:version/checkUpdates')
      .get([checkApiKey, appVersionController.checkUpdates]);
  }
}

module.exports = { AppVersionRoutes };
