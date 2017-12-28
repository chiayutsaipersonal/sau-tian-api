const path = require('path')

require('dotenv').config()
const eVars = process.env
const config = {
  app: require('./app'),
}

const logging = require('../controllers/logging')

const ormVerbose = false

const sqlite = {
  dialect: 'sqlite',
  storage: path.resolve('./data/sauTian.db'),
  database: config.app.reference,
  logging: ormVerbose ? logging.warning : false,
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
    createdAt: null, // 'createdAt',
    updatedAt: null, // 'updatedAt',
    deletedAt: null, // 'deletedAt'
  },
  operatorsAliases: false,
}

const mysql = {
  dialect: 'mysql',
  host: 'asjgroup.ctqis38kfqvo.ap-northeast-1.rds.amazonaws.com',
  port: 3306,
  database: eVars.SYS_REF,
  username: eVars.MYSQL_ACCOUNT,
  password: eVars.MYSQL_PASS,
  logging: ormVerbose ? logging.warning : false,
  timezone: config.app.timezone,
  pool: {
    max: 5, // default: 5
    min: 0, // default: 0
    idle: 60000, // default: 10000
    acquire: 10000, // default: 10000
    evict: 10000, // default: 10000
    retry: { max: 3 },
  },
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
    createdAt: null, // 'createdAt',
    updatedAt: null, // 'updatedAt',
    deletedAt: null, // 'deletedAt'
  },
  operatorsAliases: false,
}

const dropSchemaSequence = [
  'sales',
  'invoices',
  'factors',
  'products',
  'clients',
]

module.exports = {
  workingDb: eVars.NODE_ENV === 'staging' ? mysql : sqlite,
  liveData: {
    location: eVars.LIVE_DATABASE_FILE_PATH,
    tableLookup: {
      Clients: 'customer.DBF',
      Products: 'item.DBF',
      Invoices: 'sal.DBF',
      Sales: 'saldet.DBF',
    },
    loadSequence: [
      'Clients',
      'Products',
      'Invoices',
      'Sales',
    ],
    disConFactorFile: path.resolve('./data/disConFactor.json'),
  },
  models: {
    path: path.resolve('./models'),
    fileNames: null,
    modelReferences: null,
  },
  dropSchemaSequence,
}

/*
# client information
COMP_UCODE=42777910
DIS_NO=400005
*/
