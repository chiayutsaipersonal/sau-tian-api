const path = require('path')

require('dotenv').config()
const eVars = process.env

// settings
const backup = false

module.exports = {
  location: path.resolve(eVars.LIVE_DATABASE_FILE_PATH),
  tableLookup: {
    Clients: 'customer.DBF',
    Products: 'item.DBF',
    Invoices: 'sal.DBF',
    Sales: 'saldet.DBF',
  },
  loadSequence: ['Clients', 'Products', 'Invoices', 'Sales'],
  convFactorLocation: path.resolve('./data/disConFactor.json'),
  backup,
}

/*
# client information
COMP_UCODE=42777910
DIS_NO=400005
*/
