const _ = require('lodash');
const assert = require('assert');

const { BaseController } = require('../../_base/controller/base-controller');
const { AppVersionDao } = require('../dao/app-version-dao');
const { AppVersionSchema } = require('../model/app-version-model');

const { normalizeAndLogError } = require('../../../errors');

class AppVersionController extends BaseController {
  constructor() {
    const appVersion = new AppVersionDao(AppVersionSchema, 'AppVersion').getModel();
    super(appVersion);

    this.appVersion = appVersion;
    this.checkUpdates = this.checkUpdates.bind(this);
  }

  async checkUpdates(req, res, next) {
    try {
      const { version } = req.params;

      assert(_.isString(version), 'Version is not a valid string.');

      const details = await this.appVersion.checkUpdates(version);
      res.status(200).json(details);
    } catch (error) {
      const throwable = normalizeAndLogError(this.theModuleName, res, error);
      next(throwable);
    }
  }
}

module.exports = {
  AppVersionController,
};
