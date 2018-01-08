const path = require('path')

require('dotenv').config()
const eVars = process.env

// settings
const backup = false

module.exports = {
  location: path.resolve(eVars.LIVE_DATA_LOCATION),
  tableLookup: {
    Clients: 'customer.DBF',
    Products: 'item.DBF',
    Invoices: 'sal.DBF',
    Sales: 'saldet.DBF',
  },
  loadSequence: ['Clients', 'Products', 'Invoices', 'Sales'],
  convFactorLocation: path.resolve('./data/disConFactor.json'),
  customDataLocation: path.resolve('./data/customSalesData.json'),
  backup,
}

/*
# client information
COMP_UCODE=42777910
DIS_NO=400005
*/
