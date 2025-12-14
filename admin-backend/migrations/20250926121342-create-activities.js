'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activities', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      merchantId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'merchants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      agentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'agents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      staffId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'staff', // ⚠️ replace with actual staff table name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      person: {
        type: Sequelize.ENUM('merchant', 'agent', 'staff'),
        allowNull: false,
      },

      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activities');
  }
};
