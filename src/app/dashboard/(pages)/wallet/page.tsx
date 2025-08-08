"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { ChevronDown, X, ChevronUp, ChevronRight, Menu } from 'lucide-react';
import Link from "next/link";
import '../../../../../global.css';

// The main Wallet component with tab functionality
export default function Wallet() {
  const router = useRouter();
  const [export_option, setExportOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterCardOpen, setIsFilterCardOpen] = useState(false);
  const filterCardRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
  
  // State to manage which tab is currently active
  const [activeTab, setActiveTab] = useState('activities');

  // Toggle the visibility of the filter card
  const toggleFilterCard = () => {
    setIsFilterCardOpen(!isFilterCardOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterCardRef.current &&
        !filterCardRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterCardOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener);
    };
  }, []);

  const mockData = [
    { refId: 'WRET10211A', type: 'Credit', amount: '₦200,000', transactionType: 'Cash', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211A', type: 'Credit', amount: '₦200,000', transactionType: 'Cash', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211A', type: 'Debit', amount: '₦200,000', transactionType: 'Bank account', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211A', type: 'Debit', amount: '₦200,000', transactionType: 'Bank account', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211A', type: 'Debit', amount: '₦200,000', transactionType: 'Bank account', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211A', type: 'Debit', amount: '₦200,000', transactionType: 'Bank account', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211A', type: 'Debit', amount: '₦200,000', transactionType: 'Bank account', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211A', type: 'Debit', amount: '₦200,000', transactionType: 'Bank account', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211A', type: 'Debit', amount: '₦200,000', transactionType: 'Bank account', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211A', type: 'Debit', amount: '₦100,000', transactionType: 'Bank account', date: '20/02/2025', status: 'Successful' },
    { refId: 'WRET10211B', type: 'Credit', amount: '₦50,000', transactionType: 'Cash', date: '21/02/2025', status: 'Successful' },
    { refId: 'WRET10211B', type: 'Debit', amount: '₦75,000', transactionType: 'Bank account', date: '21/02/2025', status: 'Successful' },
    { refId: 'WRET10211C', type: 'Credit', amount: '₦125,000', transactionType: 'Cash', date: '22/02/2025', status: 'Successful' },
    { refId: 'WRET10211C', type: 'Debit', amount: '₦25,000', transactionType: 'Bank account', date: '22/02/2025', status: 'Successful' },
    { refId: 'WRET10211D', type: 'Credit', amount: '₦150,000', transactionType: 'Cash', date: '23/02/2025', status: 'Successful' },
    { refId: 'WRET10211D', type: 'Debit', amount: '₦10,000', transactionType: 'Bank account', date: '23/02/2025', status: 'Successful' },
    { refId: 'WRET10211E', type: 'Credit', amount: '₦100,000', transactionType: 'Cash', date: '24/02/2025', status: 'Successful' },
    { refId: 'WRET10211E', type: 'Debit', amount: '₦60,000', transactionType: 'Bank account', date: '24/02/2025', status: 'Successful' },
    { refId: 'WRET10211F', type: 'Credit', amount: '₦25,000', transactionType: 'Cash', date: '25/02/2025', status: 'Successful' },
    { refId: 'WRET10211F', type: 'Debit', amount: '₦180,000', transactionType: 'Bank account', date: '25/02/2025', status: 'Successful' },
  ];
  
  // New mock data for the customer wallets tab
  const mockCustomerData = [
    { customerName: 'John Doe', accountNumber: '0123456789', balance: '₦50,000', lastTransactionDate: '25/02/2025' },
    { customerName: 'Jane Smith', accountNumber: '0987654321', balance: '₦120,000', lastTransactionDate: '24/02/2025' },
    { customerName: 'Peter Jones', accountNumber: '1122334455', balance: '₦75,000', lastTransactionDate: '23/02/2025' },
    { customerName: 'Mary Johnson', accountNumber: '5566778899', balance: '₦250,000', lastTransactionDate: '22/02/2025' },
    { customerName: 'Michael Brown', accountNumber: '9988776655', balance: '₦15,000', lastTransactionDate: '21/02/2025' },
    { customerName: 'Sarah Davis', accountNumber: '4455667788', balance: '₦90,000', lastTransactionDate: '20/02/2025' },
    { customerName: 'David Wilson', accountNumber: '3344556677', balance: '₦30,000', lastTransactionDate: '19/02/2025' },
    { customerName: 'Emily Clark', accountNumber: '2233445566', balance: '₦180,000', lastTransactionDate: '18/02/2025' },
    { customerName: 'Robert Evans', accountNumber: '6677889900', balance: '₦60,000', lastTransactionDate: '17/02/2025' },
    { customerName: 'Linda White', accountNumber: '7788990011', balance: '₦20,000', lastTransactionDate: '16/02/2025' },
    { customerName: 'John Doe', accountNumber: '0123456789', balance: '₦50,000', lastTransactionDate: '25/02/2025' },
    { customerName: 'Jane Smith', accountNumber: '0987654321', balance: '₦120,000', lastTransactionDate: '24/02/2025' },
    { customerName: 'Peter Jones', accountNumber: '1122334455', balance: '₦75,000', lastTransactionDate: '23/02/2025' },
    { customerName: 'Mary Johnson', accountNumber: '5566778899', balance: '₦250,000', lastTransactionDate: '22/02/2025' },
    { customerName: 'Michael Brown', accountNumber: '9988776655', balance: '₦15,000', lastTransactionDate: '21/02/2025' },
    { customerName: 'Sarah Davis', accountNumber: '4455667788', balance: '₦90,000', lastTransactionDate: '20/02/2025' },
    { customerName: 'David Wilson', accountNumber: '3344556677', balance: '₦30,000', lastTransactionDate: '19/02/2025' },
    { customerName: 'Emily Clark', accountNumber: '2233445566', balance: '₦180,000', lastTransactionDate: '18/02/2025' },
    { customerName: 'Robert Evans', accountNumber: '6677889900', balance: '₦60,000', lastTransactionDate: '17/02/2025' },
    { customerName: 'Linda White', accountNumber: '7788990011', balance: '₦20,000', lastTransactionDate: '16/02/2025' },
  ];

  const itemsPerPage = 10;

  // Use useMemo to sort the data efficiently based on the active tab
  const sortedItems = useMemo(() => {
    const dataToSort = activeTab === 'activities' ? mockData : mockCustomerData;
    let sortableItems = [...dataToSort];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        // Handle number sorting for amount and balance
        const valA = sortConfig.key === 'amount' || sortConfig.key === 'balance' ? parseInt(a[sortConfig.key].replace(/₦|,/g, ''), 10) : a[sortConfig.key];
        const valB = sortConfig.key === 'amount' || sortConfig.key === 'balance' ? parseInt(b[sortConfig.key].replace(/₦|,/g, ''), 10) : b[sortConfig.key];
        
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [mockData, mockCustomerData, sortConfig, activeTab]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  // A function to handle the sorting request
  const requestSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // A function to get the appropriate sorting icon
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp className="h-3 w-3 text-gray-400" />
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </div>
      );
    }
    if (sortConfig.direction === 'asc') {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp className="h-3 w-3 text-blue-500" />
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </div>
      );
    }
    return (
      <div className="flex flex-col ml-1">
        <ChevronUp className="h-3 w-3 text-gray-400" />
        <ChevronDown className="h-3 w-3 text-blue-500" />
      </div>
    );
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    // Show first page button
    buttons.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}
      >
        1
      </button>
    );

    // Show ellipsis if current page is far from the beginning
    if (currentPage > maxVisibleButtons - 1) {
      buttons.push(<span key="ellipsis-start" className="px-4 py-2 text-gray-700">...</span>);
    }

    // Determine the start and end of the visible page number range
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust the range if we are at the beginning or end of pages
    if (currentPage < 3) {
      endPage = Math.min(totalPages - 1, 3);
    }
    if (currentPage > totalPages - 2) {
      startPage = Math.max(2, totalPages - 2);
    }

    // Render the page number buttons in the visible range
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg ${currentPage === i ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          {i}
        </button>
      );
    }

    // Show ellipsis if current page is far from the end
    if (currentPage < totalPages - 2) {
      buttons.push(<span key="ellipsis-end" className="px-4 py-2 text-gray-700">...</span>);
    }

    // Show last page button, but only if there are more than 1 page
    if (totalPages > 1 && totalPages !== 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };
  
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    setCurrentPage(1); // Reset page to 1 on tab switch
    setSortConfig(null); // Reset sorting on tab switch
  };

  return (
    <div className="relative min-h-screen">
      <h1 className="font-inter font-semibold text-2xl leading-8 ">Wallets</h1>
      <div className="flex items-center">
        <p className="text-sm">Manage transactions and balances across organization and customer wallets.</p>
        <div className="ml-auto">
          <button type="button" onClick={() => setIsSidebarOpen(true)} className="auth-btn flex" style={{ background: 'none', border: '1px solid #4E37FB', color: '#4E37FB' }}> 
            {/* The icon can be an SVG or a library component like Lucide-React's Plus */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>&nbsp;&nbsp; Transfer
          </button>
        </div>
      </div>
      {/* The Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="w-full">
          <div className="dashboard-card bg-white flex items-center gap-4 flex-col md:flex-row">
            <div className="w-full md:w-4/12">
              <div className="balance-overview items-center">
                <p className="text-sm">Live wallet balance</p>
                <p className="text-md text-black">₦1,000,000</p>
              </div>
            </div>
            <div className="w-full md:w-6/12">
              <div className="balance-overview flex items-center">
                <div>
                  <p className="text-sm">Paga - Gbenga daniel</p>
                  <p className="text-md text-black">0112435467</p>
                </div>
                <div className="ml-auto">
                  <p className="live-text">Live account: Tier 3</p>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-card bg-white mt-3 gap-4">
            <div className="tab-section flex gap-5">
              <button 
                onClick={() => handleTabChange('activities')} 
                className={`tab-btn ${activeTab === 'activities' ? 'active-tab' : 'inactive-tab'}`}
              >
                Wallet activities
              </button>
              <button 
                onClick={() => handleTabChange('customer-wallets')} 
                className={`tab-btn ${activeTab === 'customer-wallets' ? 'active-tab' : 'inactive-tab'}`}
              >
                Customer wallets
              </button>
            </div>
            <div className="divider mt-3"></div>
            
            {activeTab === 'activities' && (
              <>
                <div className="flex mt-4">
                  <div className="relative inline-block">
                    <div className="flex filter-btn items-center px-4 py-3"
                      ref={filterButtonRef}
                      onClick={toggleFilterCard}
                    >
                      {/* Using inline SVG for filter icon for self-containment */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>&nbsp;&nbsp;
                      <p>Filter</p>
                    </div>
                    {isFilterCardOpen && (
                      <div
                        ref={filterCardRef}
                        className="cursor-pointer filter-card absolute p-2 rounded-lg bg-white transition-colors duration-200"
                        style={{ zIndex: 10 }}
                      >
                        <div className="p-4 space-y-4">
                          {/* Header */}
                          <div className="flex w-full">
                            <h3 className="filter-title">Choose your filters</h3>
                            <div className="ml-auto">
                              <button type="button" className="clear-btn">Clear filters</button>
                            </div>
                          </div>

                          {/* Status Section */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                            <div className="flex space-x-4">
                              <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded" />
                                <span className="ml-2 text-sm text-gray-700">Successful</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded" />
                                <span className="ml-2 text-sm text-gray-700">Failed</span>
                              </label>
                            </div>
                          </div>

                          {/* Type Section */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Type</p>
                            <div className="flex space-x-4">
                              <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded" />
                                <span className="ml-2 text-sm text-gray-700">Credit</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded" />
                                <span className="ml-2 text-sm text-gray-700">Debit</span>
                              </label>
                            </div>
                          </div>

                          {/* Source/To Section */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Source/To</p>
                            <div className="flex space-x-4">
                              <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded" />
                                <span className="ml-2 text-sm text-gray-700">Cash</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded" />
                                <span className="ml-2 text-sm text-gray-700">Bank account</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end p-4 space-x-2 border-t border-gray-200">
                          <button
                            onClick={() => setIsFilterCardOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                          >
                            Close
                          </button>
                          <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-md duration-200">
                            Add filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex gap-3">
                    <div className="relative" style={{ width: '100px' }}>
                      <select
                        className="input-field appearance-none"
                        value={export_option}
                        onChange={(e) => setExportOption(e.target.value)}
                      >
                        <option value="Last 12 months">Export</option>
                        <option value="PDF">PDF</option>
                        <option value="CSV">CSV</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-9 flex items-center">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-1">
                      <div className="relative">
                        <input type="text" className="search-input" placeholder="Search" />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white max-w-6xl mx-auto mt-3">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="table-header">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button onClick={() => requestSort('refId')} className="flex items-center focus:outline-none">
                              Ref ID
                              {getSortIcon('refId')}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button onClick={() => requestSort('type')} className="flex items-center focus:outline-none">
                              Type
                              {getSortIcon('type')}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button onClick={() => requestSort('amount')} className="flex items-center focus:outline-none">
                              Amount
                              {getSortIcon('amount')}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button onClick={() => requestSort('transactionType')} className="flex items-center focus:outline-none">
                              Transaction Type
                              {getSortIcon('transactionType')}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button onClick={() => requestSort('date')} className="flex items-center focus:outline-none">
                              Date
                              {getSortIcon('date')}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button onClick={() => requestSort('status')} className="flex items-center focus:outline-none">
                              Status
                              {getSortIcon('status')}
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item:any, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.refId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.transactionType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="rotate-180 h-4 w-4 mr-2" />
                      Previous
                    </button>

                    <div className="flex space-x-2">
                      {renderPaginationButtons()}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'customer-wallets' && (
              <>
                <div className="flex mt-4">
                  <div className="relative w-full sm:w-auto">
                    <select
                      className="block w-full rounded-lg border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none cursor-pointer"
                    >
                      <option value={10}>All account tier</option>
                    </select>
                    <div className="pointer-events-none pt-5 absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown className="h-5  w-5" />
                    </div>
                  </div>
                  <div className="ml-auto flex gap-3">
                    <div className="relative" style={{ width: '100px' }}>
                      <select
                        className="input-field appearance-none"
                        value={export_option}
                        onChange={(e) => setExportOption(e.target.value)}
                      >
                        <option value="">Export</option>
                        <option value="PDF">PDF</option>
                        <option value="CSV">CSV</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-9 flex items-center">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-1">
                      <div className="relative">
                        <input type="text" className="search-input" placeholder="Search" />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white max-w-6xl mx-auto mt-3">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="table-header">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button onClick={() => requestSort('customerName')} className="flex items-center focus:outline-none">
                              Customer
                              {getSortIcon('customerName')}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button className="flex items-center focus:outline-none">
                              Wallet Account Number
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button className="flex items-center focus:outline-none">
                              Account Level
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button className="flex items-center focus:outline-none">
                              Wallet Balance
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <button onClick={() => requestSort('lastTransactionDate')} className="flex items-center focus:outline-none">
                              Date activated
                              {getSortIcon('lastTransactionDate')}
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item: any, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.accountNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.balance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lastTransactionDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="rotate-180 h-4 w-4 mr-2" />
                      Previous
                    </button>

                    <div className="flex space-x-2">
                      {renderPaginationButtons()}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, setIsSidebarOpen]);

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        ref={sidebarRef as React.LegacyRef<HTMLElement>}
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out z-50
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Transfer to customer</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="amount"
                id="amount"
                className="block w-full rounded-md border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="N0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="transfer-to" className="block text-sm font-medium text-gray-700 mb-1">
              Transfer to
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <select
                id="transfer-to"
                name="transfer-to"
                className="block w-full rounded-md border-gray-300 pl-4 pr-10 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer"
              >
                <option>Select customer</option>
                <option>Customer A</option>
                <option>Customer B</option>
                <option>Customer C</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-1">
              Account number
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="account-number"
                id="account-number"
                className="block w-full rounded-md border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="01234565"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-center">
          <button
            className="btn-sm"
          >
            Transfer
          </button>
        </div>
      </aside>
    </>
  );
};
