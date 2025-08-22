"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Ellipsis, ArrowRight, ArrowLeft, ChevronUp, ChevronDown, X } from 'lucide-react';

// Interfaces for data and component props
interface Charge {
  id: number;
  chargeName: string;
  type: string;
  amount: string;
  activeCustomers: number;
  lastUpdated: string;
}

interface HistoryItem {
  id: number;
  customerName: string;
  accountNumber: string;
  chargeName: string;
  amount: string;
  dueDate: string;
  dateApplied: string;
  status: string;
}

interface SortConfig {
  key: string | null;
  direction: 'ascending' | 'descending';
}

// Generic props for the SortableHeader component
interface SortableHeaderProps<T> {
  title: string;
  sortKey: keyof T;
  sortConfig: SortConfig;
  onSort: (key: keyof T) => void;
}

interface ChargesTableProps {
  data: Charge[];
  sortConfig: SortConfig;
  onSort: (key: keyof Charge) => void;
  rowsPerPage: number;
  searchTerm: string;
}

interface ChargesHistoryTableProps {
  data: HistoryItem[];
  sortConfig: SortConfig;
  onSort: (key: keyof HistoryItem) => void;
  rowsPerPage: number;
  searchTerm: string;
  statusFilter: string;
}

// Sidebar component props
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

// Reusable generic component for sortable table headers
const SortableHeader = <T,>({ title, sortKey, sortConfig, onSort }: SortableHeaderProps<T>) => {
  const isSorted = sortConfig.key === sortKey;
  const isAscending = isSorted && sortConfig.direction === 'ascending';
  const isDescending = isSorted && sortConfig.direction === 'descending';

  return (
    <th
      className="p-4 text-left text-sm font-medium text-gray-500 cursor-pointer select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{title}</span>
        <div className="flex flex-col">
          <ChevronUp
            size={12}
            className={`transition-colors duration-200 ${isAscending ? 'text-indigo-600' : 'text-gray-400'}`}
          />
          <ChevronDown
            size={12}
            className={`transition-colors duration-200 ${isDescending ? 'text-indigo-600' : 'text-gray-400'}`}
          />
        </div>
      </div>
    </th>
  );
};

// Reusable Sidebar component
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <div
            className={`fixed inset-0 z-50 transform ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            } transition-transform duration-300 ease-in-out`}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 transition-opacity duration-300"
                onClick={onClose}
            ></div>
            {/* Sidebar content */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Create Charge Sidebar Content
const CreateChargeSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [chargeName, setChargeName] = useState('');
    const [chargeType, setChargeType] = useState('');
    const [amount, setAmount] = useState('');

    const handleCreate = () => {
        // Add logic to handle the form submission
        console.log({ chargeName, chargeType, amount });
        onClose(); // Close after submission
    };

    return (
        <Sidebar isOpen={isOpen} onClose={onClose} title="Create charges">
            <div className="space-y-6">
                <div>
                    <label htmlFor="chargeName" className="block text-sm font-medium text-gray-700">Charge name</label>
                    <input
                        type="text"
                        name="chargeName"
                        id="chargeName"
                        value={chargeName}
                        onChange={(e) => setChargeName(e.target.value)}
                        placeholder="Enter name"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        style={{outline: 'none'}}
                    />
                </div>
                <div>
                    <label htmlFor="chargeType" className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                        id="chargeType"
                        name="chargeType"
                        value={chargeType}
                        onChange={(e) => setChargeType(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        style={{outline: 'none'}}
                    >
                        <option value="">Select type</option>
                        <option value="Loan">Loan</option>
                        <option value="Penalty">Penalty</option>
                        <option value="Service">Service</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                        type="text"
                        name="amount"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="N0.00"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        style={{outline: 'none'}}
                    />
                </div>
            </div>
            <div className="mt-8">
                <button
                    onClick={handleCreate}
                    className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2.5 shadow-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-indigo-700"
                >
                    Create charges
                </button>
            </div>
        </Sidebar>
    );
};

// Assign Charge Sidebar Content
const AssignChargeSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [chargeName, setChargeName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [customer, setCustomer] = useState('');

    const handleAssign = () => {
        // Add logic to handle the form submission
        console.log({ chargeName, amount, dueDate, customer });
        onClose(); // Close after submission
    };

    return (
        <Sidebar isOpen={isOpen} onClose={onClose} title="Assign charges">
            <div className="space-y-6">
                <div>
                    <label htmlFor="assignChargeName" className="block text-sm font-medium text-gray-700">Charge name</label>
                    <select
                        id="assignChargeName"
                        name="assignChargeName"
                        value={chargeName}
                        onChange={(e) => setChargeName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        style={{outline: 'none'}}
                    >
                        <option value="">Select charge</option>
                        <option value="Processing fee">Processing fee</option>
                        <option value="Late payment fee">Late payment fee</option>
                        <option value="Service fee">Service fee</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="assignAmount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                        type="text"
                        name="assignAmount"
                        id="assignAmount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="N0.00"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        style={{outline: 'none'}}
                    />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due date</label>
                    <input
                        type="date"
                        name="dueDate"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        style={{outline: 'none'}}
                    />
                </div>
                <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer(s)</label>
                    <select
                        id="customer"
                        name="customer"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        style={{outline: 'none'}}
                    >
                        <option value="">Select customer</option>
                        <option value="Adebayo Adeyemisi">Adebayo Adeyemisi</option>
                        <option value="John Doe">John Doe</option>
                        <option value="Jane Smith">Jane Smith</option>
                    </select>
                </div>
            </div>
            <div className="mt-8">
                <button
                    onClick={handleAssign}
                    className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2.5 shadow-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-indigo-700"
                >
                    Assign charges
                </button>
            </div>
        </Sidebar>
    );
};


// Dummy data for the "Charges" tab
const initialChargesData: Charge[] = [
  { id: 1, chargeName: 'Processing fee', type: 'Loan', amount: 'N1,000', activeCustomers: 2, lastUpdated: '23 Jan, 2025' },
  { id: 2, chargeName: 'Late payment fee', type: 'Penalty', amount: 'N500', activeCustomers: 5, lastUpdated: '22 Jan, 2025' },
  { id: 3, chargeName: 'Service fee', type: 'Service', amount: 'N2,500', activeCustomers: 1, lastUpdated: '21 Jan, 2025' },
  { id: 4, chargeName: 'Consultation fee', type: 'Service', amount: 'N1,500', activeCustomers: 3, lastUpdated: '20 Jan, 2025' },
  { id: 5, chargeName: 'Processing fee', type: 'Loan', amount: 'N1,000', activeCustomers: 2, lastUpdated: '19 Jan, 2025' },
  { id: 6, chargeName: 'Late payment fee', type: 'Penalty', amount: 'N500', activeCustomers: 5, lastUpdated: '18 Jan, 2025' },
  { id: 7, chargeName: 'Service fee', type: 'Service', amount: 'N2,500', activeCustomers: 1, lastUpdated: '17 Jan, 2025' },
  { id: 8, chargeName: 'Consultation fee', type: 'Service', amount: 'N1,500', activeCustomers: 3, lastUpdated: '16 Jan, 2025' },
  { id: 9, chargeName: 'Processing fee', type: 'Loan', amount: 'N1,000', activeCustomers: 2, lastUpdated: '15 Jan, 2025' },
  { id: 10, chargeName: 'Late payment fee', type: 'Penalty', amount: 'N500', activeCustomers: 5, lastUpdated: '14 Jan, 2025' },
  { id: 11, chargeName: 'Service fee', type: 'Service', amount: 'N2,500', activeCustomers: 1, lastUpdated: '13 Jan, 2025' },
  { id: 12, chargeName: 'Consultation fee', type: 'Service', amount: 'N1,500', activeCustomers: 3, lastUpdated: '12 Jan, 2025' },
  // Add more dummy data to fill out pages
  { id: 13, chargeName: 'Processing fee', type: 'Loan', amount: 'N1,000', activeCustomers: 2, lastUpdated: '11 Jan, 2025' },
  { id: 14, chargeName: 'Late payment fee', type: 'Penalty', amount: 'N500', activeCustomers: 5, lastUpdated: '10 Jan, 2025' },
  { id: 15, chargeName: 'Service fee', type: 'Service', amount: 'N2,500', activeCustomers: 1, lastUpdated: '09 Jan, 2025' },
  { id: 16, chargeName: 'Consultation fee', type: 'Service', amount: 'N1,500', activeCustomers: 3, lastUpdated: '08 Jan, 2025' },
];

// Dummy data for the "Charges history" tab
const initialHistoryData: HistoryItem[] = [
  { id: 1, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Pending' },
  { id: 2, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Paid' },
  { id: 3, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Pending' },
  { id: 4, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Pending' },
  { id: 5, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Pending' },
  { id: 6, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Pending' },
  { id: 7, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Paid' },
  { id: 8, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Pending' },
  { id: 9, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Pending' },
  { id: 10, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Pending' },
  { id: 11, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Paid' },
  { id: 12, customerName: 'Adebayo Adeyemisi', accountNumber: '9045675657', chargeName: 'Processing fee', amount: 'N2,000', dueDate: '24 Feb, 2025', dateApplied: '23 Jan, 2025', status: 'Pending' },
];

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const isPaid = status === 'Paid';
  const colorClass = isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
};

const ChargesTable: React.FC<ChargesTableProps> = ({ data, sortConfig, onSort, rowsPerPage, searchTerm }) => {
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader<Charge>
              title="Charge name"
              sortKey="chargeName"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<Charge>
              title="Type"
              sortKey="type"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<Charge>
              title="Amount"
              sortKey="amount"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<Charge>
              title="Active customer assigned"
              sortKey="activeCustomers"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<Charge>
              title="Last updated"
              sortKey="lastUpdated"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <th className="p-4 text-right"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.slice(0, rowsPerPage).length > 0 ? (
            filteredData.slice(0, rowsPerPage).map((row) => (
              <tr key={row.id}>
                <td className="p-4 text-sm font-medium text-gray-900">{row.chargeName}</td>
                <td className="p-4 text-sm text-gray-500">{row.type}</td>
                <td className="p-4 text-sm text-gray-500">{row.amount}</td>
                <td className="p-4 text-sm text-gray-500">{row.activeCustomers}</td>
                <td className="p-4 text-sm text-gray-500">{row.lastUpdated}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <img src="/icons/lucide_edit.svg" alt="" />
                    <img src="/icons/dots-bold.svg" alt="" />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const ChargesHistoryTable: React.FC<ChargesHistoryTableProps> = ({ data, sortConfig, onSort, rowsPerPage, searchTerm, statusFilter }) => {
  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'All status' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader<HistoryItem>
              title="Customer name"
              sortKey="customerName"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<HistoryItem>
              title="Account number"
              sortKey="accountNumber"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<HistoryItem>
              title="Charge name"
              sortKey="chargeName"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<HistoryItem>
              title="Amount"
              sortKey="amount"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<HistoryItem>
              title="Due date"
              sortKey="dueDate"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<HistoryItem>
              title="Date applied"
              sortKey="dateApplied"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader<HistoryItem>
              title="Status"
              sortKey="status"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <th className="p-4 text-right"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.slice(0, rowsPerPage).length > 0 ? (
            filteredData.slice(0, rowsPerPage).map((row) => (
              <tr key={row.id}>
                <td className="p-4 text-sm font-medium text-gray-900">{row.customerName}</td>
                <td className="p-4 text-sm text-gray-500">{row.accountNumber}</td>
                <td className="p-4 text-sm text-gray-500">{row.chargeName}</td>
                <td className="p-4 text-sm text-gray-500">{row.amount}</td>
                <td className="p-4 text-sm text-gray-500">{row.dueDate}</td>
                <td className="p-4 text-sm text-gray-500">{row.dateApplied}</td>
                <td className="p-4 text-sm text-gray-500">
                  <img src="/icons/lucide_edit.svg" alt="" />
                </td>
                <td className="p-4 text-right">
                  <img src="/icons/dots-bold.svg" alt="" />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="p-4 text-center text-gray-500">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


const App = () => {
  const [activeTab, setActiveTab] = useState('Charges');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [isCreateChargeSidebarOpen, setIsCreateChargeSidebarOpen] = useState(false);
  const [isAssignChargeSidebarOpen, setIsAssignChargeSidebarOpen] = useState(false);

  const data = activeTab === 'Charges' ? initialChargesData : initialHistoryData;

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key !== null) {
      sortableData.sort((a: any, b: any) => {
        const key = sortConfig.key as keyof (Charge | HistoryItem);
        if (a[key] < b[key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    let currentData = sortedData;
    if (activeTab === 'Charges') {
      return currentData.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else { // Charges history
      return currentData.filter((item:any) => {
        const matchesSearch = Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = statusFilter === 'All status' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }
  }, [sortedData, searchTerm, activeTab, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const requestSort = <T extends Charge | HistoryItem>(key: keyof T) => {
    let direction:any = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: key as string, direction });
  };

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
    const buttons = [];
    const maxButtons = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === i
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (startPage > 1) {
      buttons.unshift(
        <span key="ellipsis-start" className="px-2 text-gray-500">...</span>
      );
    }
    if (endPage < totalPages) {
      buttons.push(
        <span key="ellipsis-end" className="px-2 text-gray-500">...</span>
      );
    }

    return buttons;
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased">
      <div className="max-w-7xl mx-auto pt-3">
        {/* Header Section */}
        <div className="flex flex-col px-5 md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Charges</h1>
            <p className="text-gray-500 mt-1">
              Create charges and add charges to the customers who needs to pay them.
            </p>
          </div>
          <div className="flex flex-col gap-4 mt-4 md:mt-0 md:flex-row">
            <button
              onClick={() => setIsCreateChargeSidebarOpen(true)}
              className="bg-white text-indigo-600 border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-gray-50"
            >
              <Plus size={18} />
              Create charges
            </button>
            <button
              onClick={() => setIsAssignChargeSidebarOpen(true)}
              className="bg-indigo-600 text-white rounded-lg px-4 py-2.5 shadow-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-indigo-700"
            >
              <Plus size={18} />
              Assign charges
            </button>
          </div>
        </div>

        {/* Tabs and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center border-b border-gray-200 mb-6">
            <button
              className={`pb-4 px-4 text-sm font-medium ${
                activeTab === 'Charges'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('Charges');
                setSortConfig({ key: null, direction: 'ascending' });
                setCurrentPage(1);
              }}
            >
              Charges
            </button>
            <button
              className={`pb-4 px-4 text-sm font-medium ${
                activeTab === 'Charges history'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('Charges history');
                setSortConfig({ key: null, direction: 'ascending' });
                setCurrentPage(1);
              }}
            >
              Charges history
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              {activeTab === 'Charges history' && (
                <div className="relative w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none cursor-pointer"
                  >
                    <option value="All status">All status</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </div>
              )}
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <button className="bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm font-medium text-sm transition-colors duration-200 hover:bg-gray-50 w-full sm:w-auto">
                Reassign
              </button>
              <div className="relative w-full sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {activeTab === 'Charges' ? (
            <ChargesTable
              data={paginatedData as Charge[]}
              sortConfig={sortConfig}
              onSort={requestSort as (key: keyof Charge) => void}
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
            />
          ) : (
            <ChargesHistoryTable
              data={paginatedData as HistoryItem[]}
              sortConfig={sortConfig}
              onSort={requestSort as (key: keyof HistoryItem) => void}
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
            />
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft size={16} /> Previous
            </button>
            <div className="flex items-center space-x-1">
              {renderPaginationButtons()}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Sidebars */}
      <CreateChargeSidebar
          isOpen={isCreateChargeSidebarOpen}
          onClose={() => setIsCreateChargeSidebarOpen(false)}
      />
      <AssignChargeSidebar
          isOpen={isAssignChargeSidebarOpen}
          onClose={() => setIsAssignChargeSidebarOpen(false)}
      />
    </div>
  );
};

export default App;
