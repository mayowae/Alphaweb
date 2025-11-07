'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('merchants', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'deleted'),
      defaultValue: 'active',
    });
    await queryInterface.addColumn('merchants', 'lastLogin', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('merchants', 'inactiveDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('merchants', 'status');
    await queryInterface.removeColumn('merchants', 'lastLogin');
    await queryInterface.removeColumn('merchants', 'inactiveDate');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_merchants_status";'); // cleanup ENUM type in Postgres
  }
};
