module.exports = (sequelize, DataTypes) => {
  const Merchant = sequelize.define('Merchant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessAlias: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accountLevel: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Tier 0',
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'merchants',
    timestamps: true,
  });

  Merchant.associate = (models) => {
    Merchant.hasMany(models.InvestmentApplication, { foreignKey: 'merchantId' });
    Merchant.hasMany(models.LoanApplication, { foreignKey: 'merchantId' });
    Merchant.hasMany(models.CustomerWallet, { foreignKey: 'merchantId' });
    Merchant.hasMany(models.Agent, { foreignKey: 'merchantId', as: 'agents' });
    Merchant.hasMany(models.Customer, { foreignKey: 'merchantId', as: 'customers' });
  };

  return Merchant;
};
