module.exports = (sequelize, DataTypes) => {
  const Invoices = sequelize.define('invoices', {
    SNO: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    DATE2: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    CUSTNO: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    EMPNO: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    name: {
      singular: 'invoice',
      plural: 'invoices',
    },
  })
  return Invoices
}
