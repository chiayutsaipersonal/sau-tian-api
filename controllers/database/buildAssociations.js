const logging = require('../logging')

module.exports = db => {
  logging.console('Assign ORM table relationships')

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

  db.Invoices.belongsTo(
    db.Clients,
    {
      constraints: true,
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    {
      foreignKey: 'clientId',
      targetKey: 'id',
    }
  )

  db.Clients.hasMany(
    db.Invoices,
    {
      constraints: true,
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    {
      foreignKey: 'clientId',
      targetKey: 'id',
    }
  )
}
