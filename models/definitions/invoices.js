module.exports = (sequelize, DataTypes) => {
  const Invoices = sequelize.define('invoices', {
    id: { // SNO
      type: DataTypes.STRING,
      primaryKey: true,
    },
    date: { // DATE2
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    clientId: { // CUSTNO
      type: DataTypes.STRING,
      allowNull: true,
    },
    employeeId: { // EMPNO
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
