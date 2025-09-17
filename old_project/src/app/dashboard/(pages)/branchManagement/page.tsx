"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import '../../../../../global.css';
import React, { useState, useRef, useEffect } from 'react';
import Link from "next/link";
import { Plus, Search, Edit, X, ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { LuChevronDown, LuX } from "react-icons/lu";

// Define a TypeScript interface for a Branch object
interface Branch {
  id: number;
  name: string;
  state: string;
  location: string;
  agents: number;
  customers: number;
}

// Define the props for the new sidebar component
interface CreateBranchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// The new sidebar component
const CreateBranchSidebar: React.FC<CreateBranchSidebarProps> = ({ isOpen, onClose }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // This effect handles closing the sidebar when a click occurs outside of it.
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted. Implement create branch logic here.");
    // Add your form submission logic here
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar container */}
      <aside 
        ref={sidebarRef}
        className={`
          fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl 
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create branch</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto space-y-6">
          {/* Name input */}
          <div>
            <label htmlFor="branch-name" className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="branch-name"
              name="branch-name"
              placeholder="Enter name"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* State dropdown */}
          <div>
            <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-1">
              State
            </label>
            <div className="relative">
              <select
                id="state"
                name="state"
                className="block w-full rounded-md border border-gray-300 pl-4 pr-10 py-3 pt-5 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer"
                defaultValue="Oyo"
              >
                <option value="Oyo">Oyo</option>
                <option value="Kwara">Kwara</option>
                <option value="Lagos">Lagos</option>
                {/* Add more states here */}
              </select>
              <div className="pointer-events-none pt-5 absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <LuChevronDown className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Location input */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Iwo road, Ibadan"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </form>

        {/* Footer with button */}
        <div className="p-6 border-t border-gray-200">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create branch
          </button>
        </div>
      </aside>
    </>
  );
};


export default function BranchManagement() {
  const router = useRouter();

  // Your dummy data
  const DUMMY_BRANCH_DATA: Branch[] = [
    { id: 1, name: 'Tanko Branch', state: 'Kwara', location: 'Tanko, Ilorin', agents: 4, customers: 2000 },
    { id: 2, name: 'Iwo road branch', state: 'Oyo state', location: 'Iwo road, Ibadan', agents: 4, customers: 2000 },
    { id: 3, name: 'Lagos Branch', state: 'Lagos state', location: 'Lekki, Lagos', agents: 5, customers: 3000 },
    { id: 4, name: 'Abeokuta Branch', state: 'Ogun state', location: 'Sapon, Abeokuta', agents: 3, customers: 1500 },
    { id: 5, name: 'Enugu Branch', state: 'Enugu state', location: 'Oji River, Enugu', agents: 4, customers: 2200 },
    { id: 6, name: 'Kaduna Branch', state: 'Kaduna state', location: 'Ungwan Sarki, Kaduna', agents: 5, customers: 2800 },
    { id: 7, name: 'Kano Branch', state: 'Kano state', location: 'Sabon Gari, Kano', agents: 6, customers: 3500 },
    { id: 8, name: 'Jos Branch', state: 'Plateau state', location: 'Bukuru, Jos', agents: 3, customers: 1800 },
    { id: 9, name: 'Port Harcourt Branch', state: 'Rivers state', location: 'Trans Amadi, Port Harcourt', agents: 7, customers: 4000 },
    { id: 10, name: 'Maiduguri Branch', state: 'Borno state', location: 'Customs Street, Maiduguri', agents: 2, customers: 1000 },
    { id: 11, name: 'Benin Branch', state: 'Edo state', location: 'Akpakpava Road, Benin City', agents: 5, customers: 2700 },
    { id: 12, name: 'Abuja Branch', state: 'FCT', location: 'Wuse, Abuja', agents: 8, customers: 5000 },
    { id: 13, name: 'Ibadan Branch', state: 'Oyo state', location: 'Challenge, Ibadan', agents: 4, customers: 2500 },
    { id: 14, name: 'Calabar Branch', state: 'Cross River state', location: 'Mary Slessor, Calabar', agents: 3, customers: 1900 },
  ];

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for the new sidebar
  
  // New state for sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof Branch | null; direction: 'ascending' | 'descending' | null }>({
    key: null,
    direction: null,
  });

  // Function to handle sorting
  const requestSort = (key: keyof Branch) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    // If the same key is clicked, toggle the direction
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get a sorted version of the data
  const sortedBranches = React.useMemo(() => {
    let sortableItems = [...DUMMY_BRANCH_DATA];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Branch];
        const bValue = b[sortConfig.key as keyof Branch];
        
        // Handle string comparison for 'name'
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (aValue.toLowerCase() < bValue.toLowerCase()) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue.toLowerCase() > bValue.toLowerCase()) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        // Handle numeric comparison for other columns if needed
        else {
           if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [DUMMY_BRANCH_DATA, sortConfig]);

  // Calculate the total number of pages based on the sorted data
  const totalPages = Math.ceil(sortedBranches.length / rowsPerPage);

  // Get the data for the current page from the sorted list
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentBranches = sortedBranches.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (branchId: number) => {
    console.log(`Editing branch with ID: ${branchId}`);
    // Implement your edit logic here, e.g., open a modal or navigate to a new page
  };
  
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to the first page when rows per page changes
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const pageButtons = [];
    const maxPageButtons = 5; // To show a limited number of buttons
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) {
        pageButtons.push(
            <button key="1" onClick={() => handlePageChange(1)} className={`w-10 h-10 rounded-md font-semibold transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200`}>1</button>
        );
        if (startPage > 2) {
            pageButtons.push(<span key="ellipsis-start" className="w-10 h-10 flex items-end justify-center text-gray-500">...</span>);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageButtons.push(
            <button 
                key={i}
                onClick={() => handlePageChange(i)}
                className={`w-10 h-10 rounded-md font-semibold transition-colors
                    ${currentPage === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
            >
                {i}
            </button>
        );
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageButtons.push(<span key="ellipsis-end" className="w-10 h-10 flex items-end justify-center text-gray-500">...</span>);
        }
        pageButtons.push(
            <button key={totalPages} onClick={() => handlePageChange(totalPages)} className={`w-10 h-10 rounded-md font-semibold transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200`}>{totalPages}</button>
        );
    }

    return pageButtons;
  };

  return (
    <div className="min-h-screen font-sans antialiased">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Branch managment</h1>
          <p className="text-gray-600">Create, update and manage branch details</p>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)} // Open the sidebar
          className="flex items-center space-x-2 bg-[#6b47ff] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-[#5a38e0] transition-colors mt-4 md:mt-0"
        >
          <Plus className="h-5 w-5" />
          <span>Create branch</span>
        </button>
      </div>

      {/* Control Panel Section */}
      <div className="bg-white p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Show rows dropdown (Left) */}
          <div className="relative w-full md:w-auto">
            <label htmlFor="show-rows" className="sr-only">Show rows per page</label>
            <select
              id="show-rows"
              className="block w-full rounded-lg border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value={10}>Show 10 per row</option>
              <option value={20}>Show 20 per row</option>
              <option value={50}>Show 50 per row</option>
            </select>
            <div className="pointer-events-none pt-5 absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <LuChevronDown className="h-5 w-5" />
            </div>
          </div>

          {/* Export and Search (Right) */}
          <div className="flex flex-col md:flex-row w-full md:w-auto space-y-4 md:space-y-0 md:space-x-4 ml-0 md:ml-auto">
            {/* Export Dropdown */}
            <div className="relative w-full sm:w-auto bg-[#e9e6ff] text-indigo-500 rounded-lg">
              <select className="block w-full bg-[#e9e6ff] appearance-none rounded-lg text-indigo-200 pl-4 pr-10 py-3 text-sm focus:outline-none">
                <option>Export</option>
                <option>PDF</option>
                <option>CSV</option>
              </select>
              <div className="pointer-events-none absolute pt-5 inset-y-0 right-0 flex items-center px-2 text-indigo-500">
                <LuChevronDown className="h-5 w-5" />
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-auto flex-grow">
              <label htmlFor="search-input" className="sr-only">Search</label>
              <div className="absolute inset-y-0 pt-5 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search-input"
                type="text"
                placeholder="Search"
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    <span>Branch name</span>
                    {/* Render a sort icon based on sort state */}
                    {sortConfig.key === 'name' ? (
                      sortConfig.direction === 'ascending' ? (
                        <ArrowUp className="h-4 w-4 ml-2" />
                      ) : (
                        <ArrowDown className="h-4 w-4 ml-2" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 ml-2 text-gray-400" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No of agents
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No of customers
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {branch.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {branch.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {branch.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {branch.agents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {branch.customers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(branch.id)}
                      className="text-gray-500 hover:text-[#6b47ff] transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <button 
            className="flex items-center space-x-2 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <span>Previous</span>
          </button>
          <div className="flex space-x-2">
            {renderPaginationButtons()}
          </div>
          <button 
            className="flex items-center space-x-2 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <span>Next</span>
          </button>
        </div>
      </div>
      
      {/* The sidebar component */}
      <CreateBranchSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>
  );
}
