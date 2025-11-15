'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('collections', 'cycle', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 31,
      comment: 'Total cycle days (always 31)'
    });

    await queryInterface.addColumn('collections', 'cycle_counter', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Current day in cycle (1-31)'
    });

    await queryInterface.addColumn('collections', 'package_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'packages',
        key: 'id'
      },
      comment: 'Reference to collection package'
    });

    await queryInterface.addColumn('collections', 'package_name', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Collection package name'
    });

    await queryInterface.addColumn('collections', 'package_amount', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Package amount for autofill'
    });

    await queryInterface.addColumn('collections', 'is_first_collection', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this is the first collection of the 31-day cycle'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('collections', 'cycle');
    await queryInterface.removeColumn('collections', 'cycle_counter');
    await queryInterface.removeColumn('collections', 'package_id');
    await queryInterface.removeColumn('collections', 'package_name');
    await queryInterface.removeColumn('collections', 'package_amount');
    await queryInterface.removeColumn('collections', 'is_first_collection');
  }
};
