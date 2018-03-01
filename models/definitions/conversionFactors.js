module.exports = (sequelize, DataTypes) => {
  const ConversionFactors = sequelize.define(
    'conversionFactors',
    {
      id: {
        // 3M SAP id
        type: DataTypes.STRING,
        allowNull: true,
        primaryKey: true,
        unique: 'uniqueConversionFactorEntry',
      },
      productId: {
        // ITEMNO
        type: DataTypes.STRING,
        unique: 'uniqueConversionFactorEntry',
      },
      conversionFactor: {
        // DIS_CON_FACTOR
        type: DataTypes.DECIMAL(11, 4),
        allowNull: false,
      },
      customStockQty: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      name: {
        singular: 'conversionFactor',
        plural: 'conversionFactors',
      },
    }
  )
  return ConversionFactors
}
