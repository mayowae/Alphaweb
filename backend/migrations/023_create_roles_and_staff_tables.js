const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Creating roles and staff tables...');
      
      // Create roles table
      await queryInterface.createTable('roles', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        roleName: {
          type: DataTypes.STRING,
          allowNull: false
        },
        cantView: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        canViewOnly: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        canEdit: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        permissions: {
          type: DataTypes.JSON,
          allowNull: false
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      });

      // Create staff table
      await queryInterface.createTable('staff', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        fullName: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        phoneNumber: {
          type: DataTypes.STRING,
          allowNull: false
        },
        branch: {
          type: DataTypes.STRING,
          allowNull: false
        },
        role: {
          type: DataTypes.STRING,
          allowNull: false
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: 'active'
        },
        merchantId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'merchants',
            key: 'id'
          }
        },
        roleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'roles',
            key: 'id'
          }
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      });

      // Add indexes for better performance
      await queryInterface.addIndex('staff', ['merchantId']);
      await queryInterface.addIndex('staff', ['roleId']);
      await queryInterface.addIndex('staff', ['email']);

      console.log('Successfully created roles and staff tables');
    } catch (error) {
      console.error('Error creating roles and staff tables:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Dropping roles and staff tables...');
      await queryInterface.dropTable('staff');
      await queryInterface.dropTable('roles');
      console.log('Successfully dropped roles and staff tables');
    } catch (error) {
      console.error('Error dropping roles and staff tables:', error);
      throw error;
    }
  }
};
