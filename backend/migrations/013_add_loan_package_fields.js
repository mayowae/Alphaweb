const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Adding loan-specific columns to packages table...');
      
      // Add loan-specific columns to packages table
      await queryInterface.addColumn('packages', 'loan_amount', {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Loan amount for loan packages'
      });

      await queryInterface.addColumn('packages', 'loan_interest_rate', {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Interest rate for loan packages'
      });

      await queryInterface.addColumn('packages', 'loan_period', {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Loan period in days'
      });

      await queryInterface.addColumn('packages', 'default_amount', {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Default amount for loan packages'
      });

      await queryInterface.addColumn('packages', 'grace_period', {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Grace period in days for loan packages'
      });

      await queryInterface.addColumn('packages', 'loan_charges', {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Additional charges for loan packages'
      });

      await queryInterface.addColumn('packages', 'package_category', {
        type: DataTypes.ENUM('Investment', 'Loan', 'Collection'),
        allowNull: true,
        defaultValue: 'Investment',
        comment: 'Package category: Investment, Loan, or Collection'
      });

      // Update existing records to set package_category
      await queryInterface.sequelize.query(`
        UPDATE packages 
        SET package_category = 'Investment' 
        WHERE package_category IS NULL
      `);

      // Add indexes for better performance
      await queryInterface.addIndex('packages', ['package_category'], {
        name: 'idx_packages_category'
      });

      await queryInterface.addIndex('packages', ['loan_amount'], {
        name: 'idx_packages_loan_amount'
      });

      await queryInterface.addIndex('packages', ['loan_period'], {
        name: 'idx_packages_loan_period'
      });

      console.log('Successfully added loan-specific columns to packages table');
    } catch (error) {
      console.error('Error adding loan-specific columns:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Rolling back loan-specific columns...');
      
      // Remove indexes
      await queryInterface.removeIndex('packages', 'idx_packages_category');
      await queryInterface.removeIndex('packages', 'idx_packages_loan_amount');
      await queryInterface.removeIndex('packages', 'idx_packages_loan_period');

      // Remove columns
      await queryInterface.removeColumn('packages', 'package_category');
      await queryInterface.removeColumn('packages', 'loan_charges');
      await queryInterface.removeColumn('packages', 'grace_period');
      await queryInterface.removeColumn('packages', 'default_amount');
      await queryInterface.removeColumn('packages', 'loan_period');
      await queryInterface.removeColumn('packages', 'loan_interest_rate');
      await queryInterface.removeColumn('packages', 'loan_amount');

      console.log('Successfully rolled back loan-specific columns');
    } catch (error) {
      console.error('Error rolling back loan-specific columns:', error);
      throw error;
    }
  }
};
