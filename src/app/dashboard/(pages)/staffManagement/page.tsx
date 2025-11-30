// ...existing imports...
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X, Trash2, Pencil, Building, User, Mail, Phone, Briefcase, FileText, CheckCircle, Edit } from 'lucide-react';
import { createRole, fetchRoles, updateRole, createStaff, listStaff, updateStaff, fetchBranches } from '@/services/api';
import Swal from 'sweetalert2';

// Interfaces for data types
interface Role {
  id: number;
  roleId: string;
  roleName: string;
  cantView: number;
  canViewOnly: number;
  canEdit: number;
  lastUpdated: string;
  dateCreated: string;
}

interface StaffData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  date: string;
  status: string;
}

// A mock component for the Edit Staff Modal to resolve the import error.
// In a real application, you would have this in its own file.
const EditStaffModal = ({ isOpen, onClose, staffData, onSave }: { isOpen: boolean; onClose: () => void; staffData: StaffData | null; onSave: (data: StaffData) => void }) => {
  const [formData, setFormData] = useState<StaffData>({ id: '', name: '', email: '', phone: '', role: '', date: '', status: '' });

  useEffect(() => {
    if (staffData) {
      setFormData(staffData);
    }
  }, [staffData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStaff({
        id: Number(formData.id),
        branch: '',
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        role: formData.role,
        status: formData.status || 'Active',
      });
      Swal.fire({
        icon: 'success',
        title: 'Staff updated',
        text: 'The staff member was updated successfully.'
      });
      onSave(formData);
      onClose();
      // Refresh staff data after successful update
      try {
        document.dispatchEvent(new CustomEvent('staff-created'));
      } catch {}
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to update staff.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold">Edit Staff Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input type="text" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Unified sidebar component for creating staff and roles.
const CreateSidebar: React.FC<{ isOpen: boolean; onClose: () => void; type: 'staff' | 'role' }> = ({ isOpen, onClose, type }) => {
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    branch: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
  });
  const [branchOptions, setBranchOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (!isOpen || type !== 'staff') return;
    (async () => {
      try {
        const data = await fetchBranches();
        const branches = (data?.branches || data || []).map((b: any) => ({ value: String(b.id ?? b._id ?? b.name), label: b.name }));
        setBranchOptions(branches);
      } catch {
        setBranchOptions([]);
      }
    })();
  }, [isOpen, type]);

  // Role form state
  const [roleFormData, setRoleFormData] = useState({
    roleName: '',
    cantView: 0,
    canViewOnly: 0,
    canEdit: 0,
    permissions: {
      dashboard: "Can't view",
      accounting: "Can't view",
      branch: "Can't view",
      collection: "Can't view",
      loan: "Can't view",
      investments: "Can't view",
      agents: "Can't view",
      packages: "Can't view",
      customers: "Can't view",
      wallet: "Can't view",
      charges: "Can't view",
      staff_management: "Can't view"
    }
  });

  // Handles permission dropdown changes for role form
  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoleFormData((prevData) => ({
      ...prevData,
      permissions: {
        ...prevData.permissions,
        [name]: value,
      },
    }));
  };

  // Handles form input changes for staff form.
  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStaffFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles form input changes for role form.
  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoleFormData((prevData) => ({
      ...prevData,
      [name]: parseInt(value, 10) || 0,
    }));
  };

  // Handles the form submission for staff.
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError(null);
    try {
      await createStaff(staffFormData);
      Swal.fire({
        icon: 'success',
        title: 'Staff created',
        text: 'The staff member was created successfully.'
      });
      setStaffFormData({
        branch: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        role: '',
      });
      onClose();
      try {
        document.dispatchEvent(new CustomEvent('staff-created'));
        document.dispatchEvent(new CustomEvent('role-created')); // Also refresh roles in case staff creation affects role data
      } catch {}
    } catch (err: any) {
      setStaffError(err.message || 'Failed to create staff');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to create staff.'
      });
    } finally {
      setStaffLoading(false);
    }
  };

  // Handles the form submission for roles.
  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleLoading(true);
    setRoleError(null);
    const cantViewCount = Object.values(roleFormData.permissions).filter(
      value => value === "Can't view"
    ).length;
    const canViewOnlyCount = Object.values(roleFormData.permissions).filter(
      value => value === "Can view only"
    ).length;
    const canEditCount = Object.values(roleFormData.permissions).filter(
      value => value === "Can edit"
    ).length;
    const payload = {
      roleName: roleFormData.roleName,
      cantView: cantViewCount,
      canViewOnly: canViewOnlyCount,
      canEdit: canEditCount,
      permissions: roleFormData.permissions
    };
    createRole(payload)
      .then(() => {
        setRoleFormData({
          roleName: '',
          cantView: 0,
          canViewOnly: 0,
          canEdit: 0,
          permissions: {
            dashboard: "Can't view",
            accounting: "Can't view",
            branch: "Can't view",
            collection: "Can't view",
            loan: "Can't view",
            investments: "Can't view",
            agents: "Can't view",
            packages: "Can't view",
            customers: "Can't view",
            wallet: "Can't view",
            charges: "Can't view",
            staff_management: "Can't view"
          }
        });
        onClose();
        Swal.fire({
          icon: 'success',
          title: 'Role created',
          text: 'The role was created successfully.'
        });
        // Dispatch event to refresh roles data
        try {
          document.dispatchEvent(new CustomEvent('role-created'));
        } catch {}
      })
      .catch((err) => {
        setRoleError(err.message || 'Failed to create role');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to create role.'
        });
      })
      .finally(() => setRoleLoading(false));
  };

  // Reusable input component for the form.
  const FormInput = ({ label, name, type, placeholder, value, onChange, icon: Icon }: { label: string; name: string; type: string; placeholder: string; value: string | number; onChange: (e: any) => void; icon: React.ElementType }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
        </div>
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2
          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  );

  // Fetch roles for dynamic dropdown in staff form
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
  const fetchRoleOptions = async () => {
    try {
      const data = await fetchRoles();
      const roles = (Array.isArray(data) ? data : (data?.roles || [])) as any[];
      setRoleOptions(roles.map((r:any) => ({ value: String(r.id), label: r.roleName })));
    } catch {
      setRoleOptions([]);
    }
  };
  
  useEffect(() => {
    if (!isOpen || type !== 'staff') return;
    fetchRoleOptions();
  }, [isOpen, type]);

  // Listen for role creation events to refresh role options
  useEffect(() => {
    if (!isOpen || type !== 'staff') return;
    const handleRoleCreated = () => fetchRoleOptions();
    document.addEventListener('role-created', handleRoleCreated);
    return () => document.removeEventListener('role-created', handleRoleCreated);
  }, [isOpen, type]);

  // Reusable select component for the form.
  const FormSelect = ({ label, name, options, value, onChange, icon: Icon }: { label: string; name: string; options: { value: string; label: string; }[]; value: string; onChange: (e: any) => void; icon: React.ElementType }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
        </div>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="block w-full rounded-md border-gray-300 pl-10 pr-10 py-2
          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        >
          <option value="" disabled>Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {type === 'staff' ? 'Create staff' : 'Create role'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body - Staff */}
        {type === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <FormSelect
              label="Branch"
              name="branch"
              icon={Building}
              value={staffFormData.branch}
              onChange={handleStaffChange}
              options={branchOptions}
            />
            <FormInput
              label="Full name"
              name="fullName"
              type="text"
              placeholder="John Doe"
              icon={User}
              value={staffFormData.fullName}
              onChange={handleStaffChange}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              placeholder="johndoe@gmail.com"
              icon={Mail}
              value={staffFormData.email}
              onChange={handleStaffChange}
            />
            <FormInput
              label="Phone number"
              name="phoneNumber"
              type="tel"
              placeholder="+2347056454546"
              icon={Phone}
              value={staffFormData.phoneNumber}
              onChange={handleStaffChange}
            />
            <FormSelect
              label="Role"
              name="role"
              icon={Briefcase}
              value={staffFormData.role}
              onChange={handleStaffChange}
              options={roleOptions}
            />
            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-60"
                disabled={staffLoading}
              >
                {staffLoading ? 'Creating...' : 'Create user'}
              </button>
              {staffError && <div className="text-red-600 text-sm mt-2">{staffError}</div>}
            </div>
          </form>
        )}

        {/* Form Body - Role */}
        {type === 'role' && (
          <form onSubmit={handleRoleSubmit} className="flex-1 overflow-y-auto p-6">
            {/* Role Name */}
            <div className="mb-4">
              <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 mb-2">
                Role name
              </label>
              <input
                type="text"
                id="role-name"
                name="roleName"
                value={roleFormData.roleName}
                onChange={(e) => setRoleFormData(prev => ({ ...prev, roleName: e.target.value }))}
                placeholder="Enter name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Access Permissions Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mt-6 mb-4">
                Access permissions
              </h3>
              {Object.keys(roleFormData.permissions).map((key) => (
                <div key={key} className="mb-4">
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-700 capitalize mb-2"
                  >
                    {key.replace('_', ' ')}
                  </label>
                  <select
                    id={key}
                    name={key}
                    value={roleFormData.permissions[key as keyof typeof roleFormData.permissions]}
                    onChange={handlePermissionChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="">Choose</option>
                    <option value="Can't view">Can't view</option>
                    <option value="Can view only">Can view only</option>
                    <option value="Can edit">Can edit</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-60"
                disabled={roleLoading}
              >
                {roleLoading ? 'Creating...' : 'Create role'}
              </button>
              {roleError && <div className="text-red-600 text-sm mt-2">{roleError}</div>}
            </div>
          </form>
        )}
      </div>
    </>
  );
};
const EditRoleSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialRole: any;
  onSave: (data: any) => void;
}> = ({ isOpen, onClose, initialRole, onSave }) => {
  const defaultPermissions = {
    dashboard: "Can't view",
    accounting: "Can't view",
    branch: "Can't view",
    collection: "Can't view",
    loan: "Can't view",
    investments: "Can't view",
    agents: "Can't view",
    packages: "Can't view",
    customers: "Can't view",
    wallet: "Can't view",
    charges: "Can't view",
    staff_management: "Can't view"
  };
  const [roleFormData, setRoleFormData] = useState(() => {
    if (initialRole) {
      return {
        ...initialRole,
        permissions: initialRole.permissions && typeof initialRole.permissions === 'object'
          ? initialRole.permissions
          : defaultPermissions
      };
    }
    return {
      roleName: '',
      cantView: 0,
      canViewOnly: 0,
      canEdit: 0,
      permissions: defaultPermissions
    };
  });

  useEffect(() => {
    if (initialRole) {
      setRoleFormData({
        ...initialRole,
        permissions: initialRole.permissions && typeof initialRole.permissions === 'object'
          ? initialRole.permissions
          : defaultPermissions
      });
    }
  }, [initialRole]);

  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoleFormData((prevData: any) => ({
      ...prevData,
      permissions: {
        ...prevData.permissions,
        [name]: value,
      },
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoleFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleLoading(true);
    setRoleError(null);
    // Calculate permission counts
    const cantViewCount = Object.values(roleFormData.permissions).filter(
      value => value === "Can't view"
    ).length;
    const canViewOnlyCount = Object.values(roleFormData.permissions).filter(
      value => value === "Can view only"
    ).length;
    const canEditCount = Object.values(roleFormData.permissions).filter(
      value => value === "Can edit"
    ).length;
    const payload = {
      ...roleFormData,
      cantView: cantViewCount,
      canViewOnly: canViewOnlyCount,
      canEdit: canEditCount,
    };
    try {
      await updateRole(payload);
      Swal.fire({
        icon: 'success',
        title: 'Role updated',
        text: 'The role was updated successfully.'
      });
      onSave(payload); // Optionally refresh parent state
      onClose();
    } catch (err: any) {
      setRoleError(err.message || 'Failed to update role');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to update role.'
      });
    } finally {
      setRoleLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit role</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 mb-2">
              Role name
            </label>
            <input
              type="text"
              id="role-name"
              name="roleName"
              value={roleFormData.roleName}
              onChange={handleRoleChange}
              placeholder="Enter name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {/* Access Permissions Section */}
            <div>
            <h3 className="text-base font-semibold text-gray-800 mt-6 mb-4">
              Access permissions
            </h3>
            {roleFormData.permissions && typeof roleFormData.permissions === 'object' ? (
              Object.keys(roleFormData.permissions).map((key) => (
                <div key={key} className="mb-4">
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-700 capitalize mb-2"
                  >
                    {key.replace('_', ' ')}
                  </label>
                  <select
                    id={key}
                    name={key}
                    value={roleFormData.permissions[key as keyof typeof roleFormData.permissions]}
                    onChange={handlePermissionChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="">Choose</option>
                    <option value="Can't view">Can't view</option>
                    <option value="Can view only">Can view only</option>
                    <option value="Can edit">Can edit</option>
                  </select>
                </div>
              ))
            ) : null}
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-60"
              disabled={roleLoading}
            >
              {roleLoading ? 'Saving...' : 'Save changes'}
            </button>
            {roleError && <div className="text-red-600 text-sm mt-2">{roleError}</div>}
          </div>
        </form>
      </div>
    </>
  );
};

// Main Staff Page component
export default function StaffPage() {
  // Debug: log modal state and selected role
  // State for editing roles
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Handler to open edit modal
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditRoleOpen(true);
  };

  // Handler to save edited role
  const handleSaveRole = async (updatedRole: any) => {
    try {
      await updateRole(updatedRole);
      // Refresh roles data after successful update
      try {
        document.dispatchEvent(new CustomEvent('role-created'));
      } catch {}
      Swal.fire({
        icon: 'success',
        title: 'Role updated',
        text: 'The role was updated successfully.'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to update role.'
      });
    }
  };
  const [tab, setTab] = useState("members");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleDropdownId, setRoleDropdownId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState<'staff' | 'role'>('staff');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);
  
  const openSidebar = (type: 'staff' | 'role') => {
    setSidebarType(type);
    setIsSidebarOpen(true);
  }
  const closeSidebar = () => setIsSidebarOpen(false);

  // State for staff data
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Fetch staff from API
  useEffect(() => {
    const fetchStaff = async () => {
      setStaffLoading(true);
      setStaffError(null);
      try {
        const data = await listStaff();
        const raw = Array.isArray(data) ? data : (data?.staff || []);
        const mapped: StaffData[] = raw.map((s: any) => ({
          id: String(s.id),
          name: s.fullName,
          email: s.email,
          phone: s.phoneNumber,
          role: s?.Role?.roleName || s.role,
          date: s.createdAt
            ? new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : '',
          status: s.status || 'Active',
        }));
        setStaff(mapped);
      } catch (err: any) {
        setStaffError(err.message || 'Failed to fetch staff');
      } finally {
        setStaffLoading(false);
      }
    };
    fetchStaff();
    const onCreated = () => fetchStaff();
    const onRoleCreated = () => fetchStaff();
    document.addEventListener('staff-created', onCreated as any);
    document.addEventListener('role-created', onRoleCreated as any);
    return () => {
      document.removeEventListener('staff-created', onCreated as any);
      document.removeEventListener('role-created', onRoleCreated as any);
    };
  }, []);

  

  // State for roles data
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  // Fetch roles from API
  useEffect(() => {
    const fetchData = async () => {
      setRolesLoading(true);
      setRolesError(null);
      try {
        const data = await fetchRoles();
        const raw = Array.isArray(data) ? data : (data?.roles || []);
        const mapped = raw.map((r: any) => ({
          id: r.id,
          roleId: String(r.id),
          roleName: r.roleName,
          cantView: r.cantView,
          canViewOnly: r.canViewOnly,
          canEdit: r.canEdit,
          lastUpdated: r.updatedAt
            ? new Date(r.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : '',
          dateCreated: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : '',
        }));
        setRolesData(mapped);
      } catch (err: any) {
        setRolesError(err.message || 'Failed to fetch roles');
      } finally {
        setRolesLoading(false);
      }
    };
    fetchData();
    const onRoleCreated = () => fetchData();
    document.addEventListener('role-created', onRoleCreated as any);
    return () => document.removeEventListener('role-created', onRoleCreated as any);
  }, []);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Role; direction: 'ascending' | 'descending' } | null>(null);

  // Sorting logic using useMemo for performance
  const sortedRoles = useMemo(() => {
    let sortableItems = [...rolesData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [rolesData, sortConfig]);

  // Request sorting by a specific key
  const requestSort = (key: keyof Role) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get the sorting arrow icon
  const getSortIcon = (key: keyof Role) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    if (sortConfig.direction === 'ascending') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      );
  };
  
  // Toggles the dropdown menu for a specific role
  const roleDropdownOptions = (id: number) => {
    setRoleDropdownId(roleDropdownId === id ? null : id);
  };

  const handleRoleDeletion = (id: number) => {
    // Add deletion logic here
    console.log(`Deleting role with ID: ${id}`);
    setRoleDropdownId(null);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  function handleEditStaff(staff: StaffData): void {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
  }

  async function handleSaveStaff(updatedStaff: StaffData) {
    // Optionally refresh staff list after update
    try {
      const data = await listStaff();
      setStaff(Array.isArray(data) ? data : data.staff || []);
    } catch {}
    setIsEditModalOpen(false);
  }

  // Search and filters
  const [search, setSearch] = useState('');
  const filteredStaff = useMemo(() => {
    if (!search) return staff;
    const term = search.toLowerCase();
    return staff.filter((s) =>
      (s.name || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term) ||
      (s.phone || '').toLowerCase().includes(term) ||
      (s.role || '').toLowerCase().includes(term)
    );
  }, [staff, search]);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const pagedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen font-[Inter]">
      <div className="flex flex-col md:flex-row pt-3 justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Staff management</h1>
          <p className="text-gray-500 text-sm">Manage and monitor all platform staff.</p>
        </div>
        <button
          type="button"
          onClick={() => openSidebar(tab === "members" ? "staff" : "role")}
          className="px-4 py-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center justify-center w-full md:w-auto"
        >
          <Plus className="mr-2" /> {tab === "members" ? 'Create staff' : 'Create role'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b px-4 pt-4">
          <nav className="flex space-x-6 text-sm font-medium">
            <button onClick={() => setTab("members")} className={tab === "members" ? "text-indigo-600 border-b-2 border-indigo-600 pb-2" : "text-gray-500 hover:text-gray-700 pb-2"}>
              Staff members
            </button>
            <button onClick={() => setTab("roles")} className={tab === "roles" ? "text-indigo-600 border-b-2 border-indigo-600 pb-2" : "text-gray-500 hover:text-gray-700 pb-2"}>
              Roles
            </button>
          </nav>
        </div>

        {tab === "members" && (
          <>
            <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-2">
                <button className="border border-gray-300 text-sm px-3 py-1.5 rounded hover:bg-gray-50 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filter
                </button>
                <select
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[10, 25, 50].map((num) => (
                    <option key={num} value={num}>
                      Show {num} per row
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button className="border border-gray-300 text-sm px-3 py-1.5 rounded hover:bg-gray-50">Export</button>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <svg
                    className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-t border-gray-200">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Full name</th>
                    <th className="px-4 py-2">Phone number</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Date created</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {pagedStaff.map((staff) => (
                    <tr key={staff.id}>
                      <td className="px-4 py-2">{staff.name}</td>
                      <td className="px-4 py-2">{staff.phone}</td>
                      <td className="px-4 py-2">{staff.role}</td>
                      <td className="px-4 py-2">{staff.date}</td>
                      <td className="px-4 py-2">
                        <span className="text-green-600 font-medium">{staff.status}</span>
                      </td>
                      <td className="px-4 py-2 text-indigo-600 hover:text-indigo-800 cursor-pointer">
                        <button type="button" className="cursor-pointer" onClick={() => handleEditStaff(staff)}>
                          <Pencil className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center p-4 text-sm">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-gray-600 hover:text-indigo-600 disabled:text-gray-300"
              >
                ← Previous
              </button>

              <div className="flex gap-1 mt-2 sm:mt-0">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:text-indigo-600 disabled:text-gray-300"
              >
                Next →
              </button>
            </div>
          </>
        )}

        {tab === "roles" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <div className="p-4">
              <button type="button" onClick={() => openSidebar('role')} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium">
                Create role
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('roleId')}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon('roleId')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('roleName')}
                  >
                    <div className="flex items-center">
                      Role
                      {getSortIcon('roleName')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can't view</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can view only</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can edit</th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('lastUpdated')}
                  >
                    <div className="flex items-center">
                      Last updated
                      {getSortIcon('lastUpdated')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('dateCreated')}
                  >
                    <div className="flex items-center">
                      Date created
                      {getSortIcon('dateCreated')}
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3 w-16">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRoles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.roleId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.roleName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.cantView}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.canViewOnly}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.canEdit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.lastUpdated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.dateCreated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEditRole(role)} className="cursor-pointer">
                          <Pencil className="h-5 w-5 text-indigo-600 hover:text-indigo-800" />
                        </button>
                        <button onClick={() => roleDropdownOptions(role.id)} className="cursor-pointer text-gray-500 hover:text-gray-700">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                          </svg>
                        </button>
                      </div>
                      {/* Dropdown Menu */}
                      {roleDropdownId === role.id && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 focus:outline-none">
                          <button
                            onClick={() => handleRoleDeletion(role.id)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            role="menuitem"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Move EditRoleSidebar here, outside the table/tbody */}
            {isEditRoleOpen && selectedRole && (
              <EditRoleSidebar
                isOpen={isEditRoleOpen}
                onClose={() => setIsEditRoleOpen(false)}
                initialRole={selectedRole}
                onSave={handleSaveRole}
              />
            )}
          </div>
        )}
      </div>

      {/* The unified sidebar component */}
      <CreateSidebar isOpen={isSidebarOpen} onClose={closeSidebar} type={sidebarType} />
      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        staffData={selectedStaff}
        onSave={handleSaveStaff}
      />
    </div>
  );
}
