"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Search, MoreHorizontal, X } from 'lucide-react';
import '../../../../../../global.css';
import { useParams } from 'next/navigation';
import { fetchAgentById, updateAgentStatus, fetchCustomers, fetchCollections, fetchLoans, fetchInvestmentTransactions, fetchCustomerWallets } from '../../../../../../services/api';

interface Customer {
  id: number;
  accountNumber?: string;
  fullName: string;
  phoneNumber: string;
  package?: string;
  createdAt?: string;
  dateCreated?: string;
  status?: 'Active' | 'Inactive';
  agentId?: number | string;
  agent?: { id?: number | string };
}

interface Collection {
  id: number;
  customerName?: string;
  amount?: number | string;
  date?: string;
  status?: 'Paid' | 'Pending' | string;
  agentId?: number | string;
  createdAt?: string;
}

interface AgentData {
  fullName: string;
  phoneNumber: string;
  email: string;
  branch: string;
  password?: string;
  dateCreated: string;
  status: 'Active' | 'Inactive';
}

export const DetailItem: React.FC<{ label: string; value: string; highlightColor?: string }> = ({ label, value, highlightColor }) => (
  <div>
    <p className="form-label">{label}</p>
    <p className={`font-medium text-black ${highlightColor}`}>{value}</p>
  </div>
);

const AgentProfilePage = () => {
  const params = useParams<{ id: string }>();
  const idParam = params?.id;
  const agentId = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;

  const [agentData, setAgentData] = useState<AgentData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    branch: '',
    password: '',
    dateCreated: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loansCount, setLoansCount] = useState<number>(0);
  const [investmentsCount, setInvestmentsCount] = useState<number>(0);
  const [totalWalletAmount, setTotalWalletAmount] = useState<number>(0);
  const [todaysCollectionAmount, setTodaysCollectionAmount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!agentId) throw new Error('Invalid agent id');
        const data = await fetchAgentById(agentId);
        const agent = (data as any)?.agent || data;
        if (isMounted) {
          setAgentData({
            fullName: agent.fullName || '',
            phoneNumber: agent.phoneNumber || '',
            email: agent.email || '',
            branch: agent.branch || '',
            password: '',
            dateCreated: agent.createdAt
              ? new Date(agent.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
                ' - ' +
                new Date(agent.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : '',
            status: (agent.status || 'Active') as 'Active' | 'Inactive',
          });
        }
        // Fetch related data in parallel
        const [custRes, collRes, loansRes, invTxRes, walletsRes] = await Promise.all([
          fetchCustomers().catch(() => ({ customers: [] })),
          fetchCollections().catch(() => ({ collections: [] })),
          fetchLoans({ agentId: String(agentId) }).catch(() => ({ loans: [] })),
          fetchInvestmentTransactions({ agentId: String(agentId) }).catch(() => ({ transactions: [] })),
          fetchCustomerWallets({ page: 1, limit: 1000 }).catch(() => ({ wallets: [] })),
        ]);

        const allCustomers: any[] = Array.isArray((custRes as any)?.customers)
          ? (custRes as any).customers
          : Array.isArray((custRes as any)?.data)
            ? (custRes as any).data
            : Array.isArray(custRes) ? (custRes as any) : [];
        const filteredCustomers = allCustomers.filter((c: any) => {
          const aId = c.agentId || c.agent?.id;
          return String(aId) === String(agentId);
        });
        const allCollections: any[] = Array.isArray((collRes as any)?.collections)
          ? (collRes as any).collections
          : Array.isArray((collRes as any)?.data)
            ? (collRes as any).data
            : Array.isArray(collRes) ? (collRes as any) : [];
        const filteredCollections = allCollections.filter((c: any) => String(c.agentId || c.agent?.id) === String(agentId));

        const todayStr = new Date().toISOString().slice(0, 10);
        const parseAmount = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const num = parseFloat(val.replace(/[^0-9.\-]/g, ''));
            return isNaN(num) ? 0 : num;
          }
          return 0;
        };
        const collectionsSum = filteredCollections.reduce((sum: number, c: any) => sum + parseAmount(c.amount), 0);
        const todaySum = filteredCollections.reduce((sum: number, c: any) => {
          const created = c.date || c.createdAt;
          const d = created ? new Date(created) : null;
          const dStr = d ? d.toISOString().slice(0, 10) : '';
          return dStr === todayStr ? sum + parseAmount(c.amount) : sum;
        }, 0);

        const loansArr: any[] = Array.isArray((loansRes as any)?.loans) ? (loansRes as any).loans : Array.isArray(loansRes) ? (loansRes as any) : [];
        const invTxArr: any[] = Array.isArray((invTxRes as any)?.transactions) ? (invTxRes as any).transactions : Array.isArray(invTxRes) ? (invTxRes as any) : [];
        const invCount = invTxArr.length; // proxy for investments related to this agent

        const walletsArr: any[] = Array.isArray((walletsRes as any)?.wallets)
          ? (walletsRes as any).wallets
          : Array.isArray((walletsRes as any)?.data)
            ? (walletsRes as any).data
            : Array.isArray(walletsRes) ? (walletsRes as any) : [];
        const filteredWallets = walletsArr.filter((w: any) => String(w.agentId || w.agent?.id) === String(agentId));
        const walletTotal = filteredWallets.reduce((sum: number, w: any) => sum + parseAmount(w.balance ?? w.totalBalance), 0);

        if (isMounted) {
          setCustomers(filteredCustomers.map((c: any) => ({
            id: c.id,
            accountNumber: c.accountNumber,
            fullName: c.fullName,
            phoneNumber: c.phoneNumber,
            package: c.packageName || c.package || c.package?.name,
            dateCreated: c.createdAt
              ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' - ' + new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : '',
            status: c.status || 'Active',
          })));
          setCollections(filteredCollections.map((col: any) => ({
            id: col.id,
            customerName: col.customerName || col.customer?.fullName,
            amount: parseAmount(col.amount),
            date: (col.createdAt || col.date) ? new Date(col.createdAt || col.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
            status: col.status || (col.paid ? 'Paid' : 'Pending'),
          })));
          setLoansCount(loansArr.length);
          setInvestmentsCount(invCount);
          setTotalWalletAmount(walletTotal);
          setTodaysCollectionAmount(todaySum);
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load agent');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [agentId]);

  const formatCurrency = (amount: number) => {
    try { return 'N' + amount.toLocaleString(); } catch { return 'N' + amount; }
  };

  // Dynamic data replaces mocks

  const [activeTab, setActiveTab] = useState<'customers' | 'collections'>('customers');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({
    key: '',
    direction: null,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const sortedData = useMemo(() => {
    const source = activeTab === 'customers' ? customers : collections;
    const term = search.toLowerCase();
    let filtered = source.filter((item: any) => {
      if (activeTab === 'customers') {
        const matches =
          (item.fullName || '').toLowerCase().includes(term) ||
          (item.phoneNumber || '').toLowerCase().includes(term) ||
          (item.accountNumber || '').toLowerCase().includes(term) ||
          (item.package || '').toLowerCase().includes(term);
        const statusOk = !statusFilter || String(item.status || '').toLowerCase() === statusFilter.toLowerCase();
        return matches && statusOk;
      } else {
        const matches =
          (item.customerName || '').toLowerCase().includes(term) ||
          String(item.amount || '').toLowerCase().includes(term) ||
          (item.date || '').toLowerCase().includes(term) ||
          (item.status || '').toLowerCase().includes(term);
        const statusOk = !statusFilter || String(item.status || '').toLowerCase() === statusFilter.toLowerCase();
        return matches && statusOk;
      }
    });
    let sortableItems = [...filtered];
    if (sortConfig.key) {
      sortableItems.sort((a: any, b: any) => {
        const keyA = a[sortConfig.key];
        const keyB = b[sortConfig.key];
        if (keyA < keyB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (keyA > keyB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [activeTab, customers, collections, sortConfig, search, statusFilter]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const renderPaginationButtons = () => {
    const pageButtons = [] as any[];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (endPage - startPage + 1 < maxPageButtons) startPage = Math.max(1, endPage - maxPageButtons + 1);
    if (startPage > 1) {
      pageButtons.push(<button key="1" onClick={() => handlePageChange(1)} className="w-10 h-10 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">1</button>);
      if (startPage > 2) pageButtons.push(<span key="ellipsis-start" className="text-gray-500">...</span>);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button key={i} onClick={() => handlePageChange(i)} className={`w-10 h-10 rounded-md font-semibold transition-colors ${currentPage === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{i}</button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageButtons.push(<span key="ellipsis-end" className="text-gray-500">...</span>);
      pageButtons.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)} className="w-10 h-10 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">{totalPages}</button>);
    }
    return pageButtons;
  };

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedCustomers(currentItems.map((item) => item.id));
    else setSelectedCustomers([]);
  };
  const handleCheckboxChange = (id: number) => {
    setSelectedCustomers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const customersTableHeaders = [
    { label: 'Account number', key: 'accountNumber' },
    { label: 'Full name', key: 'fullName' },
    { label: 'Phone number', key: 'phoneNumber' },
    { label: 'Package', key: 'package' },
    { label: 'Date created', key: 'dateCreated' },
    { label: 'Status', key: 'status' },
    { label: 'Action', key: 'action' },
  ];

  const collectionsTableHeaders = [
    { label: 'Customer Name', key: 'customerName' },
    { label: 'Amount', key: 'amount' },
    { label: 'Date', key: 'date' },
    { label: 'Status', key: 'status' },
    { label: 'Action', key: 'action' },
  ];
  const headers = activeTab === 'customers' ? customersTableHeaders : collectionsTableHeaders;

  const handleDeactivate = async () => {
    if (!agentId) return;
    try {
      const next = agentData.status === 'Active' ? 'Inactive' : 'Active';
      await updateAgentStatus(agentId, next);
      setAgentData((prev) => ({ ...prev, status: next }));
    } catch (e) {
      // noop simple feedback could be added
    }
  };

  const handleViewProfile = () => {
    // Implement navigation to a dedicated profile if available; currently stays on same page
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{loading ? 'Loading...' : agentData.fullName || 'Agent'}</h1>
        <div className="flex ml-auto space-x-3">
          <button type='button' onClick={handleViewProfile} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            View profile
          </button>
          <button onClick={handleDeactivate} className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-red-600 transition-colors">
            Deactivate account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total customer wallet</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalWalletAmount)}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
          <p className="text-gray-600 text-sm mb-1">Today's collection</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(todaysCollectionAmount)}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200">
          <p className="text-gray-600 text-sm mb-1">Total customer</p>
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-200">
          <p className="text-gray-600 text-sm mb-1">Total collections</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(collections.reduce((s: number, c: any) => s + Number(c.amount || 0), 0))}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200">
          <p className="text-gray-600 text-sm mb-1">Total loans</p>
          <p className="text-2xl font-bold text-gray-900">{loansCount}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
          <p className="text-gray-600 text-sm mb-1">Total Investments</p>
          <p className="text-2xl font-bold text-gray-900">{investmentsCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-t-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('customers')} className={`py-4 px-6 text-center text-lg font-medium transition-colors ${activeTab === 'customers' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Customers</button>
          <button onClick={() => setActiveTab('collections')} className={`py-4 px-6 text-center text-lg font-medium transition-colors ${activeTab === 'collections' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Collections</button>
        </div>

        <div className="p-4 sm:p-6 bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 hover:bg-gray-100 w-full sm:w-auto">
                <img src="/icons/filter.png" alt="" />
                <span>Filter</span>
              </button>
              <div className="relative w-full sm:w-auto">
                <select className="block w-full rounded-lg border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none cursor-pointer" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                  <option value={10}>Show 10 per row</option>
                  <option value={20}>Show 20 per row</option>
                  <option value={50}>Show 50 per row</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-4 text-gray-700">
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {activeTab === 'customers' && (
                <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors w-full sm:w-auto">Reassign</button>
              )}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pt-4 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" value={search} onChange={(e)=>{ setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search" className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
              </div>
              <div>
                <select value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value); setCurrentPage(1); }} className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'customers' && (
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" onChange={handleSelectAllChange} checked={selectedCustomers.length === currentItems.length && currentItems.length > 0} />
                    </th>
                  )}
                  {headers.map(({ label, key }) => (
                    <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => setSortConfig((prev) => ({ key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }))} className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-900">
                        {label}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((item: Customer | Collection) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {activeTab === 'customers' && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={selectedCustomers.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} />
                        </td>
                      )}
                      {activeTab === 'customers' ? (
                        <>
                          <td className="px-4 py-4 text-sm text-gray-900 font-medium">{(item as Customer).accountNumber}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{(item as Customer).fullName}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{(item as Customer).phoneNumber}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{(item as Customer).package}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{(item as Customer).dateCreated}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (item as Customer).status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {(item as Customer).status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-right flex items-center justify-end space-x-2">
                            <button className="px-4 py-2 rounded-lg text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-colors text-sm font-medium">View</button>
                            <button className="text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-4 text-sm text-gray-900 font-medium">{(item as Collection).customerName}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{(item as Collection).amount}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{(item as Collection).date}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{(item as Collection).status}</td>
                          <td className="px-4 py-4 text-sm text-right flex items-center justify-end space-x-2">
                            <button className="px-4 py-2 rounded-lg text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-colors text-sm font-medium">View</button>
                            <button className="text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'customers' ? 8 : 5} className="text-center py-8 text-gray-500">No data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm text-gray-700 w-full sm:w-auto">Previous</button>
            <div className="flex flex-wrap justify-center gap-2">{renderPaginationButtons()}</div>
            <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm text-gray-700 w-full sm:w-auto">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentProfilePage;


