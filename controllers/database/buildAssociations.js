const logging = require('../logging')

module.exports = db => {
  logging.console('Assign ORM table relationships')

  db.ConversionFactors.belongsTo(db.Products, injectOptions('productId', 'id'))
  db.Products.hasOne(db.ConversionFactors, injectOptions('productId', 'id'))

  // db.Products.belongsToMany(db.Invoices, injectOptions('productId', 'id', db.Sales))
  // db.Invoices.belongsToMany(db.Products, injectOptions('invoiceId', 'id', db.Sales))
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
