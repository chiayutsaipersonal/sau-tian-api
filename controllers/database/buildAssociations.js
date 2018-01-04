const logging = require('../logging')

module.exports = db => {
  logging.console('Assign ORM table relationships')

  // following two lines does not work due to the reason stated in the following comment
  // db.Products.belongsToMany(db.Invoices, injectOptions('productId', 'id', db.Sales))
  // db.Invoices.belongsToMany(db.Products, injectOptions('invoiceId', 'id', db.Sales))
  // impossible to use unique keys
  // data seems to exist where one invoice may have multiple entries
  // of the same product but different in prices
  db.Products.belongsToMany(db.Invoices, {
    constraints: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    foreignKey: 'productId',
    targetKey: 'id',
    through: {
      model: db.Sales,
      unique: false,
    },
  })
  db.Invoices.belongsToMany(db.Products, {
    constraints: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    foreignKey: 'invoiceId',
    targetKey: 'id',
    through: {
      model: db.Sales,
      unique: false,
    },
  })

  db.Invoices.belongsTo(db.Clients, injectOptions('clientId', 'id'))
  db.Clients.hasMany(db.Invoices, injectOptions('clientId', 'id'))
}

function injectOptions (foreignKey, targetKey, throughModel = null, otherKey = null, constraints = true) {
  return Object.assign({
    constraints: constraints,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  }, {
    foreignKey: foreignKey,
    targetKey: targetKey,
  },
  throughModel === null ? {} : { through: throughModel },
  otherKey === null ? {} : { otherKey: otherKey }
  )
}
