'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);

    await queryInterface.insert(null, "super_admins", {
      name: 'Super Admin',
      email: "superadmin@Alphakolect.com",
      password: hashedPassword,
      role: "superadmin",
      created_at: new Date(),
      updated_at: new Date(),
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("super_admins", { email: "superadmin@example.com" });
  }
};
