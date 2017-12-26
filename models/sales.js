module.exports = (sequelize, DataTypes) => {
  const Sales = sequelize.define('sales', {
    BNO: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    SNO: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ITEMNO: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    QTY: {
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
    },
    PRICE: {
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
