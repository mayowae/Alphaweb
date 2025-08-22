"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Swal from "sweetalert2";
import { addAgent, updateAgent, fetchAgents } from "../../../../../services/api";
import { Plus, ChevronDown, ChevronUp, Search, Filter, MoreHorizontal, Edit, PowerOff, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define the Agent interface
interface Agent {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  branch: string;
  customers: number;
  status: string;
  createdAt: string;
}

// Props interface for the sidebar components
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add Agent Sidebar Component
interface AddAgentSidebarProps extends SidebarProps {
  onAddAgent: (newAgent: Omit<Agent, 'id' | 'customers' | 'dateCreated' | 'status'>) => void;
}

const AddAgentSidebar: React.FC<AddAgentSidebarProps> = ({ isOpen, onClose, onAddAgent }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    branch: '',
    createdAt: '',
  });
  const [formError, setFormError] = useState('');

  // Effect to handle clicks outside the sidebar to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError(''); // Clear error on input change
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.branch) {
      setFormError("Full Name, Phone Number, Email, and Branch are required.");
      return;
    }

    try {
      const result = await addAgent(formData);
      Swal.fire({
        icon: "success",
        title: "Agent Added",
        text: result.message || "Agent has been added successfully.",
        showConfirmButton: false,
        timer: 2000
      });
      onAddAgent(formData); // Only add to state if API call succeeds
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        password: '',
        branch: '',
        createdAt: '',
      });
      setFormError('');
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to Add Agent",
        text: error?.message || "An error occurred while adding the agent."
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-30 z-40 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
        ></div>
      )}
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-full sm:max-w-md bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out z-50
          flex flex-col overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add agent</h2>
          <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto space-y-6">
          <div>
            <label htmlFor="branch" className="block text-sm font-semibold text-gray-700 mb-1">Branch</label>
            <div className="relative">
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>Select branch</option>
                <option value="Tanko Branch">Tanko Branch</option>
                <option value="Iwo road branch">Iwo road branch</option>
                <option value="Lagos Island">Lagos Island</option>
                <option value="Abuja Central">Abuja Central</option>
                <option value="Port Harcourt">Port Harcourt</option>
                <option value="Kano North">Kano North</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John doe"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-1">Phone number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="08045454645"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="johndoe@gmail.com"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Add agent
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

// Edit Agent Sidebar Component
interface EditAgentSidebarProps extends SidebarProps {
  agentToEdit: Agent | null;
  onUpdateAgent: (updatedAgent: Agent) => void;
}

const EditAgentSidebar: React.FC<EditAgentSidebarProps> = ({ isOpen, onClose, agentToEdit, onUpdateAgent }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [editedAgentData, setEditedAgentData] = useState<Agent | any>(null);
  const [formError, setFormError] = useState('');

  // Populate form data when agentToEdit changes
  useEffect(() => {
    if (agentToEdit) {
      setEditedAgentData({ ...agentToEdit });
    }
  }, [agentToEdit]);

  // Effect to handle clicks outside the sidebar to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedAgentData((prev:any) => prev ? { ...prev, [name]: value } : null);
    if (formError) setFormError(''); // Clear error on input change
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editedAgentData) {
      setFormError("No agent data to update.");
      return;
    }

    // Basic validation
    if (!editedAgentData.fullName || !editedAgentData.phoneNumber || !editedAgentData.email || !editedAgentData.branch) {
      setFormError("Full Name, Phone Number, Email, and Branch are required.");
      return;
    }

    try {
      const result = await updateAgent(editedAgentData);
      Swal.fire({
        icon: "success",
        title: "Agent Updated",
        text: result.message || "Agent details updated successfully.",
        showConfirmButton: false,
        timer: 2000
      });
      onUpdateAgent(editedAgentData); // Only update state if API call succeeds
      setFormError('');
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to Update Agent",
        text: error?.message || "An error occurred while updating the agent."
      });
    }
  };

  if (!editedAgentData && isOpen) return null; // Don't render if no agent data and sidebar is supposed to be open

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-30 z-40 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
        ></div>
      )}
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-full sm:max-w-md bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out z-50
          flex flex-col overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit agent</h2>
          <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto space-y-6">
          <div>
            <label htmlFor="branch" className="block text-sm font-semibold text-gray-700 mb-1">Branch</label>
            <div className="relative">
              <select
                id="branch"
                name="branch"
                value={editedAgentData?.branch || ''}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>Select branch</option>
                <option value="Tanko Branch">Tanko Branch</option>
                <option value="Iwo road branch">Iwo road branch</option>
                <option value="Lagos Island">Lagos Island</option>
                <option value="Abuja Central">Abuja Central</option>
                <option value="Port Harcourt">Port Harcourt</option>
                <option value="Kano North">Kano North</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={editedAgentData?.fullName || ''}
              onChange={handleChange}
              placeholder="John doe"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-1">Phone number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={editedAgentData?.phoneNumber || ''}
              onChange={handleChange}
              placeholder="08045454645"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={editedAgentData?.email || ''}
              onChange={handleChange}
              placeholder="johndoe@gmail.com"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={editedAgentData?.password || ''} // Consider if you want to pre-fill password or leave empty for security
              onChange={handleChange}
              placeholder="••••••••"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Update details
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};


// Main Page Component
export default function Page() {
  const [agents, setAgents] = useState<Agent[]>([]);
  useEffect(() => {
    const getAgents = async () => {
      try {
        const result = await fetchAgents();
        setAgents(result.agents || []);
      } catch (error) {
        // Optionally handle error (e.g., show a message)
      }
    };
    getAgents();
  }, []);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddAgentSidebarOpen, setIsAddAgentSidebarOpen] = useState(false); // State for Add Agent Sidebar
  const [isEditAgentSidebarOpen, setIsEditAgentSidebarOpen] = useState(false); // State for Edit Agent Sidebar
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null); // Agent data to pass to Edit sidebar

  const [sortConfig, setSortConfig] = useState<{ key: keyof Agent | any; direction: 'ascending' | 'descending' }>({
    key: null,
    direction: 'ascending',
  });

  const sortedAgents = useMemo(() => {
    let sortableItems = [...agents];
    if (sortConfig.key !== null) {
      sortableItems.sort((a:any, b:any) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [agents, sortConfig]);

  const requestSort = (key: keyof Agent) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof Agent) => {
    const isSorted = sortConfig.key === key;
    const isAsc = sortConfig.direction === 'ascending';
  
    return (
      <span className="flex flex-col items-center ml-1">
        <ChevronUp 
          className={`h-4 w-4 ${isSorted && isAsc ? 'text-gray-900' : 'text-gray-400'}`}
        />
        <ChevronDown 
          className={`h-4 w-4 -mt-2 ${isSorted && !isAsc ? 'text-gray-900' : 'text-gray-400'}`}
        />
      </span>
    );
  };


  const totalPages = Math.ceil(agents.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentAgents = sortedAgents.slice(indexOfFirstItem, indexOfLastItem);
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null); // For the MoreHorizontal dropdown

  // Pagination Handlers
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const pageButtons = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    if (startPage > 1) {
      pageButtons.push(<button key="1" onClick={() => handlePageChange(1)} className="w-10 h-10 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">1</button>);
      if (startPage > 2) pageButtons.push(<span key="ellipsis-start" className="text-gray-500">...</span>);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-md font-semibold transition-colors
          ${currentPage === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {i}
        </button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageButtons.push(<span key="ellipsis-end" className="text-gray-500">...</span>);
      pageButtons.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)} className="w-10 h-10 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">{totalPages}</button>);
    }
    return pageButtons;
  };

  // Dropdown for MoreHorizontal icon
  const toggleDropdown = (id: number) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Function to open the Edit Agent Sidebar
  const openEditAgentSidebar = (agent: Agent) => {
    setAgentToEdit(agent);
    setIsEditAgentSidebarOpen(true);
    setOpenDropdownId(null); // Close the MoreHorizontal dropdown
  };

  // Function to handle deactivating an agent
  const handleDeactivate = (agentId: number) => {
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.id === agentId ? { ...agent, status: 'Inactive' } : agent
      )
    );
    setOpenDropdownId(null); // Close dropdown after action
  };

  // Function to add a new agent
  const handleAddAgent = (newAgentData: Omit<Agent, 'id' | 'customers' | 'dateCreated' | 'status'>) => {
    const newId = agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1;
    const newAgent: Agent = {
      id: newId,
      ...newAgentData,
      customers: 0, // Default for new agent
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' - ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Active', // Default for new agent
    };
    setAgents(prevAgents => [...prevAgents, newAgent]);
  };

  // Function to update an existing agent
  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.id === updatedAgent.id ? updatedAgent : agent
      )
    );
  };
  const viewAgent = (agent_id:any)=>{
    router.push('/dashboard/view-agent');
  }
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Agents</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your agents. View profiles, track performance, and control access to agent accounts.
          </p>
        </div>
        <div className='ml-auto'>
          <button
            onClick={() => setIsAddAgentSidebarOpen(true)} // Open Add Agent Sidebar
            aria-label="Add agent"
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-colors w-full sm:w-auto max-w-xs mx-auto md:mx-0 mt-4 md:mt-0"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add agent</span>
          </button>
        </div>
      </div>

      {/* Filter/Search */}
      <div className="bg-white p-4 sm:p-6 shadow-sm mb-6 rounded-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 hover:bg-gray-100 w-full sm:w-auto">
              <img src="/icons/filter.png" alt="" />
              <span>Filter</span>
            </button>
            <div className="relative w-full sm:w-auto">
              <select
                className="block w-full rounded-lg border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none cursor-pointer"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value={10}>Show 10 per row</option>
                <option value={20}>Show 20 per row</option>
                <option value={50}>Show 50 per row</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <select className="block w-full appearance-none rounded-lg border border-gray-300 pl-4 pr-10 py-3 text-gray-900 sm:text-sm">
                <option>Export</option>
                <option>PDF</option>
                <option>CSV</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-sm overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('fullName')}
              >
                <div className="flex items-center">
                  Full name
                  {getSortIcon('fullName')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer"
                onClick={() => requestSort('phoneNumber')}
              >
                <div className="flex items-center">
                  Phone number
                  {getSortIcon('phoneNumber')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer"
                onClick={() => requestSort('branch')}
              >
                <div className="flex items-center">
                  Branch
                  {getSortIcon('branch')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer"
                onClick={() => requestSort('createdAt')}
              >
                <div className="flex items-center">
                  Date created
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentAgents.map(agent => (
              <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm text-gray-900 font-medium truncate max-w-xs">{agent.fullName}</td>
                <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">{agent.phoneNumber}</td>
                <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">{agent.branch}</td>
                <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">{agent.createdAt}</td>
                <td className="px-4 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {agent.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-right relative">
                  <button onClick={()=>viewAgent(agent.id)} className="px-4 py-2 rounded-lg text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-colors text-sm font-medium">
                    View
                  </button>
                  
                  <button
                    onClick={() => toggleDropdown(agent.id)}
                    className="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={openDropdownId === agent.id}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdownId === agent.id && (
                    <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 focus:outline-none">
                      <button
                        onClick={() => openEditAgentSidebar(agent)} // Open Edit Agent Sidebar
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit agent
                      </button>
                      <button
                        onClick={() => handleDeactivate(agent.id)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        <PowerOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm text-gray-700 w-full sm:w-auto"
          >
            Previous
          </button>
          <div className="flex flex-wrap justify-center gap-2">{renderPaginationButtons()}</div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm text-gray-700 w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Agent Sidebar */}
      <AddAgentSidebar isOpen={isAddAgentSidebarOpen} onClose={() => setIsAddAgentSidebarOpen(false)} onAddAgent={handleAddAgent} />

      {/* Edit Agent Sidebar */}
      <EditAgentSidebar isOpen={isEditAgentSidebarOpen} onClose={() => setIsEditAgentSidebarOpen(false)} agentToEdit={agentToEdit} onUpdateAgent={handleUpdateAgent} />
    </div>
  );
}
