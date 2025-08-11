"use client"
import { LuChevronDown, LuChevronUp, LuX, LuPlus, LuArrowUpDown } from 'react-icons/lu';
import React from 'react';
import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Sample data for the table
const customers: any = [
    { id: 1, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Inactive' },
    { id: 2, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Active' },
    { id: 3, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Active' },
    { id: 4, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Active' },
    { id: 5, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Active' },
    { id: 6, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Active' },
    { id: 7, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Active' },
    { id: 8, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Active' },
    { id: 9, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Active' },
    { id: 10, account: '9345645345', name: 'James Odunayo', branch: 'Tanke branch', agent: 'Modupe dotun', package: 'Alpha 1K', date: '23 Jan, 2025', time: '10:00', status: 'Active' },
    // Adding more data for pagination to be useful
    { id: 11, account: '9345645346', name: 'Ayo Adekunle', branch: 'Lagos Island Main Branch', agent: 'Femi Ade', package: 'Beta 2K', date: '24 Jan, 2025', time: '11:00', status: 'Active' },
    { id: 12, account: '9345645347', name: 'Chidi Eke', branch: 'Abuja Central Business District', agent: 'Ngozi Okafor', package: 'Gamma 3K', date: '25 Jan, 2025', time: '12:00', status: 'Inactive' },
    { id: 13, account: '9345645348', name: 'Fatima Bello', branch: 'Kano branch', agent: 'Sadiq Musa', package: 'Alpha 1K', date: '26 Jan, 2025', time: '13:00', status: 'Active' },
    { id: 14, account: '9345645349', name: 'Babatunde Olawale', branch: 'Oyo branch', agent: 'Tunde Olawale', package: 'Beta 2K', date: '27 Jan, 2025', time: '14:00', status: 'Active' },
    { id: 15, account: '9345645350', name: 'Grace Adebayo', branch: 'Delta branch', agent: 'Michael Obi', package: 'Gamma 3K', date: '28 Jan, 2025', time: '15:00', status: 'Inactive' },
];

const AddCustomerSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [formState, setFormState] = useState({
        branch: '',
        agent: '',
        fullName: '',
        alias: '',
        package: '',
        phoneNumber: '',
        address: '',
        email: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({
            ...formState,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Customer data submitted:', formState);
        // Add your form submission logic here
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity duration-300 ${
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
                    <h2 className="text-xl font-semibold text-gray-800">Add customer</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <LuX className="h-6 w-6" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Branch */}
                        <div>
                            <label htmlFor="branch" className="block text-sm font-semibold text-gray-700 mb-1">
                                Branch
                            </label>
                            <div className="relative">
                                <select
                                    id="branch"
                                    value={formState.branch}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Select branch</option>
                                    <option value="Tanke branch">Tanke branch</option>
                                    <option value="Lagos Island Main Branch">Lagos Island Main Branch</option>
                                    <option value="Abuja Central Business District">Abuja Central Business District</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <LuChevronDown className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        {/* Agent */}
                        <div>
                            <label htmlFor="agent" className="block text-sm font-semibold text-gray-700 mb-1">
                                Agent
                            </label>
                            <div className="relative">
                                <select
                                    id="agent"
                                    value={formState.agent}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Select Agent</option>
                                    <option value="Modupe dotun">Modupe dotun</option>
                                    <option value="Femi Ade">Femi Ade</option>
                                    <option value="Ngozi Okafor">Ngozi Okafor</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <LuChevronDown className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        {/* Full name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">
                                Full name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                value={formState.fullName}
                                onChange={handleChange}
                                placeholder="John doe"
                                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        {/* Alias */}
                        <div>
                            <label htmlFor="alias" className="block text-sm font-semibold text-gray-700 mb-1">
                                Alias
                            </label>
                            <input
                                type="text"
                                id="alias"
                                value={formState.alias}
                                onChange={handleChange}
                                placeholder="johndoebuddy"
                                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        {/* Package */}
                        <div>
                            <label htmlFor="package" className="block text-sm font-semibold text-gray-700 mb-1">
                                Package
                            </label>
                            <div className="relative">
                                <select
                                    id="package"
                                    value={formState.package}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Select package</option>
                                    <option value="Alpha 1K">Alpha 1K</option>
                                    <option value="Beta 2K">Beta 2K</option>
                                    <option value="Gamma 3K">Gamma 3K</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <LuChevronDown className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        {/* Phone number */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-1">
                                Phone number
                            </label>
                            <input
                                type="text"
                                id="phoneNumber"
                                value={formState.phoneNumber}
                                onChange={handleChange}
                                placeholder="John doe" // This placeholder seems to be a typo in the original image, but I'll keep it for consistency.
                                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1">
                                Address
                            </label>
                            <input
                                type="text"
                                id="address"
                                value={formState.address}
                                onChange={handleChange}
                                placeholder="1, King street, Ikeja, Lagos. Nigeria"
                                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formState.email}
                                onChange={handleChange}
                                placeholder="johndoe@example.com"
                                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer with buttons */}
                <div className="p-6 border-t border-gray-200">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Add customer
                    </button>
                </div>
            </div>
        </>
    );
};


export default function CustomersPage() {
    const [selectedCustomers, setSelectedCustomers] = useState<any>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // State for sorting
    const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'ascending' });

    // Sorting logic using useMemo to optimize performance
    const sortedCustomers = useMemo(() => {
        let sortableItems = [...customers];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                // Handle sorting for 'date created'
                if (sortConfig.key === 'date') {
                    const dateA = new Date(a.date.replace(/,/, '') + ' ' + a.time);
                    const dateB = new Date(b.date.replace(/,/, '') + ' ' + b.time);
                    if (dateA < dateB) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (dateA > dateB) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }
                
                // Handle sorting for other string properties
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
    }, [customers, sortConfig]);

    // Pagination logic now uses the sorted data
    const totalPages: number = Math.ceil(sortedCustomers.length / itemsPerPage);
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentCustomers = sortedCustomers.slice(firstIndex, lastIndex);

    // Function to handle sorting
    const handleSort = (key: any) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e: any) => {
        if (e.target.checked) {
            setSelectedCustomers(currentCustomers.map((customer: any) => customer.id));
        } else {
            setSelectedCustomers([]);
        }
    };

    const handleSelectCustomer = (id: any) => {
        setSelectedCustomers((prevSelected: any) =>
            prevSelected.includes(id)
                ? prevSelected.filter((customerId: any) => customerId !== id)
                : [...prevSelected, id]
        );
    };

    const areAllSelected = currentCustomers.length > 0 && selectedCustomers.length === currentCustomers.length;

    const isCustomerSelected = (id: any) => selectedCustomers.includes(id);

    const handlePageChange = (pageNumber: any) => {
        setCurrentPage(pageNumber);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Helper function to render the correct sort icon
    const renderSortIcon = (key: any) => {
        if (sortConfig.key !== key) {
            return <>
                <div className="flex flex-col text-gray-300">
                  <ChevronUp className="h-4 w-4 mb-[-4px]" />
                  <ChevronDown className="h-4 w-4" />
                </div>
            </>;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUp className="h-4 w-4 mb-[-4px]" />;
        }
        return <ChevronDown className="h-4 w-4" />;
    };

    return (
        <div className="font-sans min-h-screen p-6 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                    <p className="text-gray-500 mt-1">View and manage all your customers. Track their activity, status, and key details</p>
                </div>
                <div className="flex items-center justify-end space-x-2 w-full">
                    <div className="relative w-full sm:w-auto bg-[#e9e6ff] text-indigo-500 rounded-lg">
                        <select className="block w-full bg-[#e9e6ff] appearance-none rounded-lg text-indigo-500 pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>Export</option>
                            <option>PDF</option>
                            <option>CSV</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500 pt-5">
                            <LuChevronDown className="h-5 w-5" />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Add customer"
                        className="flex items-center px-4 py-3 bg-indigo-600 text-white rounded-lg shadow-sm font-medium text-sm hover:bg-indigo-700 transition-colors"
                    >
                        <LuPlus className="h-4 w-4 mr-0 sm:mr-1" />
                        <span className="hidden sm:inline">Add customer</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="flex w-full lg:w-auto items-stretch lg:items-center gap-4">
                        <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors w-full lg:w-auto">
                            <img src="/icons/filter.png" />
                            Filter
                        </button>
                        <div className="flex items-center rounded-md border border-gray-300 shadow-sm p-1.5 focus:ring-indigo-500 focus:border-indigo-500 w-full lg:w-auto">
                            <label htmlFor="rows-per-page" className="text-sm text-gray-700 mr-2">Show</label>
                            <select id="rows-per-page" className="text-sm w-full lg:w-auto" value={itemsPerPage} onChange={e => setItemsPerPage(parseInt(e.target.value))}>
                                <option value={10}>10 per row</option>
                                <option value={25}>25 per row</option>
                                <option value={50}>50 per row</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex w-full lg:w-auto items-stretch lg:items-center gap-4">
                        <button className="px-3 py-2 border border-gray-300 text-indigo-700 rounded-md text-sm hover:bg-gray-50 transition-colors w-full lg:w-auto">
                            Reassign
                        </button>
                        <div className="relative w-full lg:w-64">
                            <input type="text" placeholder="Search" className="pl-8 pr-4 border py-2 w-full text-sm rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4"><input type="checkbox" checked={areAllSelected} onChange={handleSelectAll} /></th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('account')}>
                                <div className="flex items-center">
                                    <span className="text-xs font-semibold">Account number</span>
                                    {renderSortIcon('account')}
                                </div>
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('name')}>
                                <div className="flex items-center">
                                    <span className="text-xs font-semibold">Full name</span>
                                    {renderSortIcon('name')}
                                </div>
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('branch')}>
                                <div className="flex items-center">
                                    <span className="text-xs font-semibold">Branch</span>
                                    {renderSortIcon('branch')}
                                </div>
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('agent')}>
                                <div className="flex items-center">
                                    <span className="text-xs font-semibold">Agent</span>
                                    {renderSortIcon('agent')}
                                </div>
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('package')}>
                                <div className="flex items-center">
                                    <span className="text-xs font-semibold">Package</span>
                                    {renderSortIcon('package')}
                                </div>
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('date')}>
                                <div className="flex items-center">
                                    <span className="text-xs font-semibold">Date created</span>
                                    {renderSortIcon('date')}
                                </div>
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('status')}>
                                <div className="flex items-center">
                                    <span className="text-xs font-semibold">Status</span>
                                    {renderSortIcon('status')}
                                </div>
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentCustomers.map((c: any) => (
                            <tr key={c.id} className={selectedCustomers.includes(c.id) ? 'bg-indigo-50' : ''}>
                                <td className="p-4"><input type="checkbox" checked={selectedCustomers.includes(c.id)} onChange={() => handleSelectCustomer(c.id)} /></td>
                                <td className="px-4 py-2 text-sm text-gray-900">{c.account}</td>
                                <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[150px]">{c.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[150px]">{c.branch}</td>
                                <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[150px]">{c.agent}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{c.package}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{c.date}, {c.time}</td>
                                <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right"><button className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors text-sm font-medium">View</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-white rounded-lg shadow-sm border-gray-200">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </button>
                <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                                ${currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* New Add Customer Sidebar */}
            <AddCustomerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
    );
}
