const { Role } = require('../models');

// Create role
const createRole = async (req, res) => {
  try {
    const { roleName, cantView, canViewOnly, canEdit, permissions } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ where: { roleName } });
    if (existingRole) {
      return res.status(400).json({ message: 'Role name already exists' });
    }

    // Create role
    const role = await Role.create({
      roleName,
      cantView,
      canViewOnly,
      canEdit,
      permissions,
    });

    res.status(201).json({
      message: 'Role created successfully',
      role: {
        id: role.id,
        roleName: role.roleName,
        cantView: role.cantView,
        canViewOnly: role.canViewOnly,
        canEdit: role.canEdit,
        permissions: role.permissions,
      },
    });
  } catch (error) {
    console.error('Role creation error:', error);
    res.status(500).json({ message: 'Role creation failed', error: error.message });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const { id, roleName, cantView, canViewOnly, canEdit, permissions } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check if name is being changed and if it's already taken
    if (roleName !== role.roleName) {
      const existingRole = await Role.findOne({ where: { roleName } });
      if (existingRole) {
        return res.status(400).json({ message: 'Role name already taken' });
      }
    }

    // Update role
    await role.update({
      roleName,
      cantView,
      canViewOnly,
      canEdit,
      permissions,
    });

    res.json({
      message: 'Role updated successfully',
      role: {
        id: role.id,
        roleName: role.roleName,
        cantView: role.cantView,
        canViewOnly: role.canViewOnly,
        canEdit: role.canEdit,
        permissions: role.permissions,
      },
    });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ message: 'Role update failed', error: error.message });
  }
};

// List all roles
const listRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'roleName', 'cantView', 'canViewOnly', 'canEdit', 'permissions', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      message: 'Roles retrieved successfully',
      roles,
    });
  } catch (error) {
    console.error('List roles error:', error);
    res.status(500).json({ message: 'Failed to retrieve roles', error: error.message });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({
      message: 'Role retrieved successfully',
      role,
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ message: 'Failed to retrieve role', error: error.message });
  }
};

module.exports = {
  createRole,
  updateRole,
  listRoles,
  getRoleById,
};
