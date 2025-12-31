"use client"
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import StaffTable from '../../../../../../components/tables/Staff/Stafftable'
import RolesTable from '../../../../../../components/tables/Staff/Rolestable'
import Addpackage from '../../../../../../components/tables/Staff/modals/Add&EditstaffModal'
import Addroles from '../../../../../../components/tables/Staff/modals/Add&EditroleModal'

// Shared Types
interface StaffMember {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  status: 'active' | 'inactive'
  created: string
}

interface RoleMember {
  id: string
  roleName: string
  cantView: string
  canViewOnly: string
  canEdit: string
  lastUpdated: string
  created: string
}

type StaffFormData = {
  full_name: string
  Email: string
  phone_number: string
  role: string
}

type RoleFormData = {
  role_name: string
  dashboard: string
  merchants: string
  transactions: string
  billings: string
  audits: string
  support: string
}

const Page = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'staffs' | 'roles'>('staffs')

  // Modal states - Staff
  const [staffModalOpen, setStaffModalOpen] = useState(false)
  const [staffEditMode, setStaffEditMode] = useState(false)
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null)

  // Modal states - Roles
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [roleEditMode, setRoleEditMode] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<RoleMember | null>(null)

  // Data
  const [staffData, setStaffData] = useState<StaffMember[]>([
    { id: 'STF-001', fullName: 'Adebayo Tayo', email: 'adebayo@company.com', phoneNumber: '+2348012345678', role: 'Super Admin', status: 'active', created: '15 Dec, 2025' },
    { id: 'STF-002', fullName: 'Chinwe Okeke', email: 'chinwe@company.com', phoneNumber: '+2348098765432', role: 'Admin', status: 'active', created: '18 Dec, 2025' },
    { id: 'STF-003', fullName: 'Emeka Nwosu', email: 'emeka@company.com', phoneNumber: '+2348034567890', role: 'Compliance Officer', status: 'active', created: '20 Dec, 2025' },
    { id: 'STF-004', fullName: 'Fatima Yusuf', email: 'fatima@company.com', phoneNumber: '+2348076543210', role: 'Admin', status: 'inactive', created: '22 Dec, 2025' },
    { id: 'STF-005', fullName: 'Tolu Adeyemi', email: 'tolu@company.com', phoneNumber: '+2348054321098', role: 'Support Staff', status: 'active', created: '23 Dec, 2025' },
    { id: 'STF-006', fullName: 'Grace Okafor', email: 'grace@company.com', phoneNumber: '+2348112233445', role: 'Officer', status: 'active', created: '24 Dec, 2025' },
    { id: 'STF-007', fullName: 'Ibrahim Musa', email: 'ibrahim@company.com', phoneNumber: '+2348134567890', role: 'Admin II', status: 'inactive', created: '25 Dec, 2025' },
    { id: 'STF-008', fullName: 'Ngozi Eze', email: 'ngozi@company.com', phoneNumber: '+2348145678901', role: 'Super Admin', status: 'active', created: '26 Dec, 2025' },
    { id: 'STF-009', fullName: 'Samuel Ade', email: 'samuel@company.com', phoneNumber: '+2348067890123', role: 'Officer', status: 'active', created: '27 Dec, 2025' },
    { id: 'STF-010', fullName: 'Aisha Bello', email: 'aisha@company.com', phoneNumber: '+2348089012345', role: 'Admin III', status: 'active', created: '28 Dec, 2025' },
    { id: 'STF-011', fullName: 'David Chukwu', email: 'david@company.com', phoneNumber: '+2348023456789', role: 'Support Staff', status: 'inactive', created: '29 Dec, 2025' },
    { id: 'STF-012', fullName: 'Blessing John', email: 'blessing@company.com', phoneNumber: '+2348109876543', role: 'Admin', status: 'active', created: '30 Dec, 2025' },
  ])

  const [rolesData, setRolesData] = useState<RoleMember[]>([
    { id: 'ROL-001', roleName: 'Super Admin', cantView: 'None', canViewOnly: 'Dashboard, Reports', canEdit: 'All Modules', lastUpdated: '30 Dec, 2025', created: '01 Jan, 2025' },
    { id: 'ROL-002', roleName: 'Compliance Officer', cantView: 'Finance, Settings', canViewOnly: 'Transactions, Audit Logs', canEdit: 'KYC, Users', lastUpdated: '29 Dec, 2025', created: '05 Jan, 2025' },
    { id: 'ROL-003', roleName: 'Support Staff', cantView: 'Finance, Roles, Settings', canViewOnly: 'Transactions, Customers', canEdit: 'None', lastUpdated: '28 Dec, 2025', created: '10 Jan, 2025' },
    { id: 'ROL-004', roleName: 'Admin', cantView: 'None', canViewOnly: 'Reports', canEdit: 'Users, Merchants, Agents', lastUpdated: '31 Dec, 2025', created: '15 Jan, 2025' },
  ])

  // Staff Handlers
  const handleAddStaff = (data: StaffFormData) => {
    const newStaff: StaffMember = {
      id: `STF-${String(staffData.length + 1).padStart(3, '0')}`,
      fullName: data.full_name,
      email: data.Email,
      phoneNumber: data.phone_number,
      role: data.role,
      status: 'active',
      created: '31 Dec, 2025'
    }
    setStaffData(prev => [...prev, newStaff])
  }

  const handleUpdateStaff = (data: StaffFormData, id: string) => {
    setStaffData(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, fullName: data.full_name, email: data.Email, phoneNumber: data.phone_number, role: data.role }
          : item
      )
    )
  }

  const openStaffCreateModal = () => {
    setStaffToEdit(null)
    setStaffEditMode(false)
    setStaffModalOpen(true)
  }

  const openStaffEditModal = (staff: StaffMember) => {
    setStaffToEdit(staff)
    setStaffEditMode(true)
    setStaffModalOpen(true)
  }

  const closeStaffModal = () => {
    setStaffModalOpen(false)
    setStaffEditMode(false)
    setStaffToEdit(null)
  }

  // Roles Handlers
  const handleAddRole = (data: RoleFormData) => {
    const newRole: RoleMember = {
      id: `ROL-${String(rolesData.length + 1).padStart(3, '0')}`,
      roleName: data.role_name,
      cantView: [
        data.dashboard === 'none' && 'Dashboard',
        data.merchants === 'none' && 'Merchants',
        data.transactions === 'none' && 'Transactions',
        data.billings === 'none' && 'Plans & Billings',
        data.audits === 'none' && 'Audit Logs',
        data.support === 'none' && 'Support & Messages',
      ].filter(Boolean).join(', ') || 'None',
      canViewOnly: [
        data.dashboard === 'view' && 'Dashboard',
        data.merchants === 'view' && 'Merchants',
        data.transactions === 'view' && 'Transactions',
        data.billings === 'view' && 'Plans & Billings',
        data.audits === 'view' && 'Audit Logs',
        data.support === 'view' && 'Support & Messages',
      ].filter(Boolean).join(', ') || 'None',
      canEdit: [
        data.dashboard === 'full' && 'Dashboard',
        data.merchants === 'full' && 'Merchants',
        data.transactions === 'full' && 'Transactions',
        data.billings === 'full' && 'Plans & Billings',
        data.audits === 'full' && 'Audit Logs',
        data.support === 'full' && 'Support & Messages',
      ].filter(Boolean).join(', ') || 'None',
      lastUpdated: '31 Dec, 2025',
      created: '31 Dec, 2025'
    }
    setRolesData(prev => [...prev, newRole])
  }

  const handleUpdateRole = (data: RoleFormData, id: string) => {
    setRolesData(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              roleName: data.role_name,
              cantView: [
                data.dashboard === 'none' && 'Dashboard',
                data.merchants === 'none' && 'Merchants',
                data.transactions === 'none' && 'Transactions',
                data.billings === 'none' && 'Plans & Billings',
                data.audits === 'none' && 'Audit Logs',
                data.support === 'none' && 'Support & Messages',
              ].filter(Boolean).join(', ') || 'None',
              canViewOnly: [
                data.dashboard === 'view' && 'Dashboard',
                data.merchants === 'view' && 'Merchants',
                data.transactions === 'view' && 'Transactions',
                data.billings === 'view' && 'Plans & Billings',
                data.audits === 'view' && 'Audit Logs',
                data.support === 'view' && 'Support & Messages',
              ].filter(Boolean).join(', ') || 'None',
              canEdit: [
                data.dashboard === 'full' && 'Dashboard',
                data.merchants === 'full' && 'Merchants',
                data.transactions === 'full' && 'Transactions',
                data.billings === 'full' && 'Plans & Billings',
                data.audits === 'full' && 'Audit Logs',
                data.support === 'full' && 'Support & Messages',
              ].filter(Boolean).join(', ') || 'None',
              lastUpdated: '31 Dec, 2025'
            }
          : item
      )
    )
  }

  const openRoleCreateModal = () => {
    setRoleToEdit(null)
    setRoleEditMode(false)
    setRoleModalOpen(true)
  }

  const openRoleEditModal = (role: RoleMember) => {
    setRoleToEdit(role)
    setRoleEditMode(true)
    setRoleModalOpen(true)
  }

  const closeRoleModal = () => {
    setRoleModalOpen(false)
    setRoleEditMode(false)
    setRoleToEdit(null)
  }

  return (
    <div>
      {/* Header */}
      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Staff management</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px]'>
            Manage and monitor all platform staff.
          </p>
        </div>

        <div className='flex items-end mt-4 md:mt-0 w-full md:w-auto'>
          {activeTab === 'staffs' ? (
            <button
              onClick={openStaffCreateModal}
              className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'
            >
              <FaPlus className='text-white font-normal w-[12px]' />
              <p className='text-[14px] font-inter text-white font-medium'>Create Staff</p>
            </button>
          ) : (
            <button
              onClick={openRoleCreateModal}
              className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'
            >
              <FaPlus className='text-white font-normal w-[12px]' />
              <p className='text-[14px] font-inter text-white font-medium'>Create Role</p>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Content */}
      <div className='bg-white shadow-lg mt-6 mb-2'>
        <div className="flex items-center flex-nowrap pt-5 border-b border-gray-300 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {[
            { id: 'staffs', label: 'Staff Members' },
            { id: 'roles', label: 'Roles' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'staffs' | 'roles')}
              className={`flex-shrink-0 relative font-inter px-6 pb-2 text-sm sm:text-base transition-all ${
                activeTab === tab.id
                  ? 'font-semibold text-[#1E1E1E] text-base'
                  : 'font-normal text-[#9E9E9E] text-base'
              }`}
            >
              {tab.label}
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-10/12 transition-all ${
                  activeTab === tab.id ? 'bg-[#4E37FB] h-[3px]' : ''
                }`}
              />
            </button>
          ))}
        </div>

        <div className="overflow-x-auto mt-2">
          {activeTab === 'staffs' && (
            <StaffTable
              staffData={staffData}
              onOpenEditModal={openStaffEditModal}
            />
          )}
          {activeTab === 'roles' && (
            <RolesTable
              rolesData={rolesData}
              onOpenEditModal={openRoleEditModal}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <Addpackage
        packag={staffModalOpen}
        onClose={closeStaffModal}
        mode={staffEditMode ? 'edit' : 'add'}
        merchant={staffToEdit}
        onAddStaff={handleAddStaff}
        onUpdateStaff={handleUpdateStaff}
      />

      <Addroles
        packag={roleModalOpen}
        onClose={closeRoleModal}
        mode={roleEditMode ? 'edit' : 'add'}
        merchant={roleToEdit}
        onAddRole={handleAddRole}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  )
}

export default Page






