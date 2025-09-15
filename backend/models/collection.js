const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Collection = sequelize.define('Collection', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Amount to be collected'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Date when collection is due'
    },
    type: {
      type: DataTypes.ENUM('Loan Repayment', 'Savings Collection', 'Investment Return', 'Package Payment', 'Other'),
      allowNull: false,
      comment: 'Type of collection'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Collected', 'Overdue', 'Partial', 'Cancelled', 'Deleted'),
      defaultValue: 'Pending'
    },
    merchantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'merchants',
        key: 'id'
      }
    },
    dateCreated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    collectedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when collection was actually made'
    },
    amountCollected: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Actual amount collected (may differ from expected amount)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about the collection'
    },
    collectionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes added when collection is made'
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
      defaultValue: 'Medium'
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether reminder has been sent to customer'
    },
    reminderDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when last reminder was sent'
    }
  }, {
    tableName: 'collections',
    timestamps: true,
    hooks: {
      beforeUpdate: (collection) => {
        // Auto-set collected date when status changes to Collected
        if (collection.changed('status') && collection.status === 'Collected' && !collection.collectedDate) {
          collection.collectedDate = new Date();
        }
        
        // Set amount collected to expected amount if not specified
        if (collection.status === 'Collected' && !collection.amountCollected) {
          collection.amountCollected = collection.amount;
        }
        
        // Update priority based on due date
        const today = new Date();
        const dueDate = new Date(collection.dueDate);
        const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) {
          collection.priority = 'Urgent';
          if (collection.status === 'Pending') {
            collection.status = 'Overdue';
          }
        } else if (daysDiff <= 3) {
          collection.priority = 'High';
        } else if (daysDiff <= 7) {
          collection.priority = 'Medium';
        } else {
          collection.priority = 'Low';
        }
      }
    }
  });

  Collection.associate = (models) => {
    // Collection belongs to Customer
    Collection.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });

    // Collection belongs to Merchant
    Collection.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant'
    });
  };

  return Collection;
};
