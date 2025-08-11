"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuPlus, LuTrash2, LuPencil, LuFlipHorizontal, LuX } from 'react-icons/lu';

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
interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose }) => {
  // Simple state for form inputs (optional, can be managed externally)
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState({
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
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle form submission, e.g., send data to an API
    console.log('New role data:', { roleName, permissions });
    onClose();
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPermissions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // The main component renders the overlay and the sidebar
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create role</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleFormSubmit}>
            {/* Role Name */}
            <div>
              <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 mb-2">
                Role name
              </label>
              <input
                type="text"
                id="role-name"
                name="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Access Permissions Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mt-6 mb-4">
                Access permissions
              </h3>
              {Object.keys(permissions).map((key) => (
                <div key={key} className="mb-4">
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-700 capitalize mb-2"
                  >
                    {key}
                  </label>
                  <select
                    id={key}
                    name={key}
                    value={permissions[key as keyof typeof permissions]}
                    onChange={handlePermissionChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option>Can't view</option>
                    <option>Can view only</option>
                    <option>Can edit</option>
                  </select>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Footer with buttons */}
        <div className="p-6 border-t border-gray-200">
          <button
            type="submit"
            onClick={handleFormSubmit}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Create role
          </button>
        </div>
      </div>
    </>
  );
};
export default function StaffPage() {
  const [tab, setTab] = useState("members");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleDropdownId, setRoleDropdownId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const staff = Array.from({ length: 100 }, (_, i) => ({
    id: `USR${i + 1002}`,
    name: "James Odunlami",
    email: "Jamesodunlami@gmail.com",
    phone: "+2347037645647",
    role: "Admin III",
    date: "Jan 25, 2025",
    status: "Active",
  }));

  const totalPages = Math.ceil(staff.length / itemsPerPage);
  const pagedStaff = staff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mock data for the roles table
  const rolesData: Role[] = [
    { id: 1, roleId: 'USR01A02', roleName: 'Admin', cantView: 0, canViewOnly: 0, canEdit: 24, lastUpdated: 'Jan 30, 2025', dateCreated: 'Jan 25, 2025' },
    { id: 2, roleId: 'USR01A02', roleName: 'Admin I', cantView: 0, canViewOnly: 4, canEdit: 10, lastUpdated: 'Jan 30, 2025', dateCreated: 'Jan 25, 2025' },
    { id: 3, roleId: 'USR01A02', roleName: 'Admin II', cantView: 9, canViewOnly: 5, canEdit: 0, lastUpdated: 'Jan 30, 2025', dateCreated: 'Jan 25, 2025' },
    { id: 4, roleId: 'USR01A02', roleName: 'Admin III', cantView: 9, canViewOnly: 3, canEdit: 0, lastUpdated: 'Jan 30, 2025', dateCreated: 'Jan 25, 2025' },
    { id: 5, roleId: 'USR01A03', roleName: 'Manager', cantView: 5, canViewOnly: 5, canEdit: 5, lastUpdated: 'Feb 1, 2025', dateCreated: 'Jan 26, 2025' },
    { id: 6, roleId: 'USR01A04', roleName: 'Editor', cantView: 2, canViewOnly: 3, canEdit: 15, lastUpdated: 'Feb 2, 2025', dateCreated: 'Jan 27, 2025' },
  ];
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

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row pt-3 justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Staff management</h1>
          <p className="text-gray-500 text-sm">Manage and monitor all platform staff.</p>
        </div>
        <button
          type="button"
          onClick={openSidebar}
          className="px-4 py-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center justify-center w-full md:w-auto"
        >
          <LuPlus className="mr-2" /> Create staff
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
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
                  <img src="/icons/filter.png" alt="" />
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
              <table className="min-w-full text-sm text-left border-t border-gray-200 ">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Full name</th>
                    <th className="px-4 py-2">Email</th>
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
                      <td className="px-4 py-2">{staff.id}</td>
                      <td className="px-4 py-2">{staff.name}</td>
                      <td className="px-4 py-2">{staff.email}</td>
                      <td className="px-4 py-2">{staff.phone}</td>
                      <td className="px-4 py-2">{staff.role}</td>
                      <td className="px-4 py-2">{staff.date}</td>
                      <td className="px-4 py-2">
                        <span className="text-green-600 font-medium">{staff.status}</span>
                      </td>
                      <td className="px-4 py-2 text-indigo-600 hover:text-indigo-800 cursor-pointer">
                        <button type="button" className="cursor-pointer">
                          <img src="/icons/lucide_edit.svg" alt="" />
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
                        <img src="/icons/lucide_edit.svg" alt="" />
                        <img onClick={() => roleDropdownOptions(role.id)} className="cursor-pointer" src="/icons/dots-bold.svg" alt="" />
                      </div>
                      {/* Dropdown Menu */}
                      {roleDropdownId === role.id && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 focus:outline-none">
                          <button
                            onClick={() => handleRoleDeletion(role.id)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            role="menuitem"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* The sidebar component */}
      <RightSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </div>
  );
}
