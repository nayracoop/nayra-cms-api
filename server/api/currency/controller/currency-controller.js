const { BaseController } = require('../../_base/controller/base-controller');
const { CurrencyDao } = require('../dao/currency-dao');
const { CurrencySchema } = require('../model/currency-model');

class CurrencyController extends BaseController {
  constructor() {
    const currency = new CurrencyDao(CurrencySchema, 'Currency').getModel();
    super(currency);
  }
}

module.exports = {
  CurrencyController,
};
