module.exports = (sequelize, DataTypes) => {
  const Clients = sequelize.define(
    'clients',
    {
      id: {
        // CUSTNO
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        // CUSTABBR
        type: DataTypes.STRING,
        allowNull: true,
      },
      registrationId: {
        // UNIFORM
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact: {
        // CON1
        type: DataTypes.STRING,
        allowNull: true,
      },
      zipCode: {
        // COMPZIP
        type: DataTypes.STRING,
        allowNull: true,
      },
      areaId: {
        // AREANO
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      address: {
        // COMPADDR
        type: DataTypes.STRING,
        allowNull: true,
      },
      telephone: {
        // TEL1
        type: DataTypes.STRING,
        allowNull: true,
      },
      fax: {
        // FAX
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      name: {
        singular: 'client',
        plural: 'clients',
      },
    }
  )
  return Clients
}
