const uuidV4 = require('uuid/v4')

module.exports = (sequelize, DataTypes) => {
  const CustomSalesData = sequelize.define('customSalesData', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidV4().toUpperCase(),
      validate: { isUUID: 4 },
    },
    date: { // DATE2
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    invoiceId: { // SNO
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientId: { // CUSTNO
      type: DataTypes.STRING,
      allowNull: false,
    },
    salesId: { // BNO
      type: DataTypes.STRING,
      allowNull: false,
    },
    productId: { // ITEMNO
      type: DataTypes.STRING,
      allowNull: false,
    },
    conversionFactorId: { // 3M SAP id
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: { // PRICE
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
    },
    _preserved: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    _clientId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    _price: {
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
    },
    _quantity: {
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
    },
    _employeeId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // deletedAt: {
    //   allowNull: true,
    //   type: DataTypes.DATE,
    // },
  }, {
    name: {
      singular: 'customSalesData',
      plural: 'customSalesData',
    },
    timestamps: true,
    paranoid: false,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    // deletedAt: 'deletedAt',
  })
  return CustomSalesData
}
