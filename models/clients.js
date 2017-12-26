
module.exports = (sequelize, DataTypes) => {
  const Clients = sequelize.define('clients', {
    CUSTNO: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    CUSTABBR: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CON1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    UNIFORM: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    COMPZIP: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    AREANO: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    COMPADDR: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    TEL1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    FAX: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    name: {
      singular: 'client',
      plural: 'clients',
    },
  })
  return Clients
}
