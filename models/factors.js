
module.exports = (sequelize, DataTypes) => {
  const Factors = sequelize.define('factors', {
    sku_no: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    dis_sku_no: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    dis_con_factor: {
      type: DataTypes.DECIMAL(11, 4),
      allowNull: true,
    },
  }, {
    name: {
      singular: 'factor',
      plural: 'factors',
    },
  })
  return Factors
}
