module.exports = (sequelize, DataTypes) => {
  const Merchant = sequelize.define('Merchant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
  };

  return Merchant;
};
