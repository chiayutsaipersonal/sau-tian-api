module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define('products', {
    id: { // ITEMNO
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: { // ITEMNAME
      type: DataTypes.STRING,
      allowNull: true,
    },
    stockQty: { // original field: STOCKQTY, output field: inv
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unit: { // STKUNIT
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    name: {
      singular: 'product',
      plural: 'products',
    },
  })
  return Products
}
