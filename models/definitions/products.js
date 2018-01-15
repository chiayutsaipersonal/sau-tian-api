module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define('products', {
    id: { // ITEMNO
      type: DataTypes.STRING,
      primaryKey: true,
    },
    sapId: { // 秀田 POS SITEMNO
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: { // ITEMNAME
      type: DataTypes.STRING,
      allowNull: true,
    },
    stockQty: { // STOCKQTY
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unit: { // STKUNIT
      type: DataTypes.STRING,
      allowNull: true,
    },
    length: {
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
    },
    width: {
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
    },
    asp: {
      type: DataTypes.DECIMAL(9, 2),
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
