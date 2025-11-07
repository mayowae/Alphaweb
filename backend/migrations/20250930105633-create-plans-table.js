'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      billing_cycle: {
        type: Sequelize.ENUM('monthly', 'yearly'),
        allowNull: false
      },
      pricing: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      merchantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'merchants', // table name (lowercase, matches Merchant model's tableName)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      no_of_branches: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      no_of_customers: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      no_of_agents: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Plans');
  }
};
