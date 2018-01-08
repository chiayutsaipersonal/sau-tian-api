module.exports = (sequelize, DataTypes) => {
  const Sales = sequelize.define('sales', {
    id: { // BNO
      type: DataTypes.STRING,
      primaryKey: true,
    },
    invoiceId: { // SNO
      type: DataTypes.STRING,
      allowNull: true,
    },
    productId: { // ITEMNO
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: { // QTY
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
    },
    price: { // PRICE
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
    },
  }, {
    name: {
      singular: 'sales',
      plural: 'sales',
    },
  })
  return Sales
}
