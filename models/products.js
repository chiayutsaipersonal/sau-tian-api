module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define('products', {
    ITEMNO: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    SITEMNO: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ITEMNAME: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    STOCKQTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    STKUNIT: {
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
