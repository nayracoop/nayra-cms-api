const { BaseDao } = require("../../_base/dao/base-dao");

class AccountDao extends BaseDao {
  constructor(theSchema, theModelName) {
    super(theSchema, theModelName);

    this.theSchema.statics.getAll = async function getAll({
      skip,
      limit,
      select,
      sort,
      query
    }) {
      const things = await this.model(theModelName).find({
        ...query
      }).skip(skip)
        .limit(limit)
        .select(select)
        .sort(sort);
      return things;
    };

    this.theSchema.statics.getById = async function getById(_id) {
      const thing = await this.model(theModelName).findOne({ _id });
      return thing;
    };

    /**
     * Read (get is super admin by id)
     */
    this.theSchema.statics.isSuperAdmin = async (_id) => {
      const account = await this.model(theModelName).findById(_id);
      return account.isSuperAdmin;
    };
  }
}

module.exports = {
  AccountDao
};
