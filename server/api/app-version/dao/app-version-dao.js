const { BaseDao } = require('../../_base/dao/base-dao');

class AppVersionDao extends BaseDao {
  constructor(theSchema, theModelName) {
    super(theSchema, theModelName);

    this.theSchema.statics.checkUpdates = async function checkUpdates(version) {
      const currentVersion = await this.model(theModelName).findOne({}).sort({ version: -1 });
      const clientVersion = await this.model(theModelName).findOne({ version });
      let needsUpdate = false;
      let uri = clientVersion && clientVersion.updateUri;
      if (!clientVersion || (currentVersion && currentVersion.version > version)) {
        needsUpdate = true;
        uri = currentVersion.updateUri;
      }
      return { needsUpdate, uri };
    };

    this.theSchema.statics.getAll = async function getAll({
      skip,
      limit,
      select,
      sort,
      query,
    }) {
      const appVersions = await this.model(theModelName).find({
        ...query,
      }).skip(skip)
        .limit(limit)
        .select(select)
        .sort(sort);
      return appVersions;
    };

    this.theSchema.statics.getById = async function getById(_id) {
      const appVersion = await this.model(theModelName).findOne({ _id });
      return appVersion;
    };

    this.theSchema.statics.removeById = async function removeById(_id, { _id: userId }) {
      const deleteResults = await this.model(theModelName).delete({ _id, deleted: false }, userId);
      return deleteResults;
    };
  }
}

module.exports = {
  AppVersionDao,
};
