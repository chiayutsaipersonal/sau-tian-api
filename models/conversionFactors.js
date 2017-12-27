
module.exports = (sequelize, DataTypes) => {
  const ConversionFactors = sequelize.define('conversionFactors', {
    id: { // SITEMNO
      type: DataTypes.STRING,
      primaryKey: true,
    },
    productId: { // ITEMNO
      type: DataTypes.STRING,
      allowNull: false,
    },
    conversionFactor: { // DIS_CON_FACTOR
      type: DataTypes.DECIMAL(11, 4),
      allowNull: false,
    },
  }, {
    name: {
      singular: 'conversionFactor',
      plural: 'conversionFactors',
    },
  })
  return ConversionFactors
}
