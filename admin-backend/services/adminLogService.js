const { AdminLog, AdminStaff } = require('../models');

class  AdminLogService {
    static async createLog({ staffId, action, description = null, metadata = null }) {
    try {
      if (!staffId || !action) {
        throw new Error('staffId and action are required');
      }

       const staff = await AdminStaff.findByPk(staffId);
        if (!staff) {
        throw new Error(`Invalid staffId: ${staffId}`);
        }


      const log = await AdminLog.create({
        staffId,
        action,
        description,
        metadata,
      });

      return log;
    } catch (err) {
      console.error('Error creating AdminLog:', err);
      throw err;
    }
  }

  static async getAllLogs() {
    return AdminLog.findAll({
      include: [{ model: db.AdminStaff, as: 'staff' }],
      order: [['createdAt', 'DESC']],
    });
  }

    static async getLogsByStaff(staffId) {
        return db.AdminLog.findAll({
        where: { staffId },
        include: [{ model: db.AdminStaff, as: 'staff' }],
        order: [['createdAt', 'DESC']],
        });
    }
}