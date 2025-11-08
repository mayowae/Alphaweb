"use client"
import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa'
import { FaAngleDown } from 'react-icons/fa';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"
import InvestmentTransactionForm from '@/components/InvestmentTransactionForm';
import { 
  fetchInvestmentTransactions, 
  deleteInvestmentTransaction,
  fetchAgents,
  fetchBranches 
} from '@/services/api';
import Swal from 'sweetalert2';

// Define the interface locally to avoid import issues
interface InvestmentTransaction {
  id: number;
  customer: string;
  accountNumber: string;
  package: string;
  amount: number;
  branch: string;
  agent: string;
  transactionDate: string;
  date?: string; // Fallback for sample data
  status?: 'pending' | 'completed' | 'cancelled';
  transactionType?: 'deposit' | 'withdrawal' | 'interest' | 'penalty';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Page = () => {
  const [show, setShow] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<InvestmentTransaction | null>(null);
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    agent: '',
    branch: '',
    package: '',
    fromDate: '',
    toDate: '',
    search: ''
  });

  // Sample data for demonstration - replace with actual API calls
  const sampleData: InvestmentTransaction[] = [
    { 
      id: 1, 
      customer: 'James Gibbins', 
      accountNumber: '9345456565', 
      package: 'Investment Package Alpha4000', 
      amount: 1000, 
      branch: "Yaro Area branch", 
      agent: 'Kola Adefarattti', 
      transactionDate: "2024-07-23T00:00:00Z",
      date: "23, July 2024",
      status: 'completed',
      transactionType: 'deposit'
    },
    { 
      id: 2, 
      customer: 'Sarah Johnson', 
      accountNumber: '9345456566', 
      package: 'Loan Package Alpha5000', 
      amount: 2500, 
      branch: "Main Branch", 
      agent: 'John Smith', 
      transactionDate: "2024-07-24T00:00:00Z",
      date: "24, July 2024",
      status: 'pending',
      transactionType: 'withdrawal'
    },
    { 
      id: 3, 
      customer: 'Michael Brown', 
      accountNumber: '9345456567', 
      package: 'Collection Package Alpha3000', 
      amount: 750, 
      branch: "Downtown Branch", 
      agent: 'Jane Doe', 
      transactionDate: "2024-07-25T00:00:00Z",
      date: "25, July 2024",
      status: 'completed',
      transactionType: 'interest'
    },
    { 
      id: 4, 
      customer: 'Emily Davis', 
      accountNumber: '9345456568', 
      package: 'Investment Package Beta2000', 
      amount: 1500, 
      branch: "Central Branch", 
      agent: 'Mike Wilson', 
      transactionDate: "2024-07-26T00:00:00Z",
      date: "26, July 2024",
      status: 'completed',
      transactionType: 'deposit'
    },
    { 
      id: 5, 
      customer: 'David Miller', 
      accountNumber: '9345456569', 
      package: 'Loan Package Gamma1000', 
      amount: 3000, 
      branch: "North Branch", 
      agent: 'Lisa Anderson', 
      transactionDate: "2024-07-27T00:00:00Z",
      date: "27, July 2024",
      status: 'pending',
      transactionType: 'withdrawal'
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
      const user = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
      if (!user) {
        setTransactions([]);
        setAgents([]);
        setBranches([]);
        return;
      }

      // Parse user to check if token exists
      let userData;
      try {
        userData = JSON.parse(user);
        if (!userData.token) {
          console.log('No authentication token found - showing empty state');
          setTransactions([]);
          setAgents([]);
          setBranches([]);
          return;
        }
      } catch (parseError) {
        console.log('Invalid user data - showing empty state');
        setTransactions([]);
        setAgents([]);
        setBranches([]);
        return;
      }

      // Build params without sending status=all which filters out everything on backend
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.agent && filters.agent !== 'all') params.agentId = filters.agent;
      if (filters.branch && filters.branch !== 'all') params.branch = filters.branch;
      if (filters.package && filters.package !== 'all') params.transactionType = filters.package;

      const response = await fetchInvestmentTransactions(params);
      
      setTransactions(response.transactions || []);
      
      // Fetch agents and branches for filters
      const [agentsRes, branchesRes] = await Promise.all([
        fetchAgents(),
        fetchBranches()
      ]);
      setAgents(agentsRes.agents || []);
      setBranches(branchesRes.branches || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // If it's an authentication error, show empty state
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Access token is required') || 
          errorMessage.includes('Invalid or expired token') ||
          errorMessage.includes('jwt malformed') ||
          errorMessage.includes('Authentication required')) {
        console.log('Authentication error - showing empty state');
        setTransactions([]);
        setAgents([]);
        setBranches([]);
      } else {
        console.log('Other error - showing empty state');
        setTransactions([]); // Show empty state for other errors
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (transaction: InvestmentTransaction) => {
    setEditData(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteInvestmentTransaction(id.toString());
        setTransactions(prev => prev.filter(t => t.id !== id));
        Swal.fire('Deleted!', 'Transaction has been deleted.', 'success');
      } catch (error: any) {
        Swal.fire('Error!', error.message || 'Failed to delete transaction', 'error');
      }
    }
  };

  const handleFormSuccess = () => {
    fetchData(); // Refresh the data
    setShowForm(false); // Close the form
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // No need for client-side filtering since backend handles it
  const filteredTransactions = transactions;


  //const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;


  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
      }).format(Number(amount) || 0);
    } catch {
      return `₦${Number(amount || 0).toLocaleString()}`;
    }
  };

  return (
    <div className='w-full'>
      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Investment transactions</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>View and manage customer investments. Track performance and monitor returns.</p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={handleCreate}
            disabled={typeof window !== 'undefined' && (!window.localStorage.getItem('user') || !JSON.parse(window.localStorage.getItem('user') || '{}').token)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              typeof window !== 'undefined' && (!window.localStorage.getItem('user') || !JSON.parse(window.localStorage.getItem('user') || '{}').token)
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-[#4E37FB] text-white hover:bg-[#3B2BC7]'
            }`}
          >
            <FaPlus size={14} />
            Create Transaction
          </button>
        </div>
      </div>

      <div className='bg-white shadow-sm mt-6 w-full relative'>
        <div>
          <div className="flex flex-wrap flex-col md:flex-row p-4 gap-4 md:gap-0 items-stretch md:items-center justify-between">
            <div className='w-full md:w-[330px]'>
              <p className='pb-2'>Agent</p>
              <Select onValueChange={(value) => handleFilterChange('agent', value)}>
                <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent className="w-full md:w-[330px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                  <SelectGroup>
                    <SelectItem value="all" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">All Agents</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.fullName} className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">
                        {agent.fullName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* <div className='w-full md:w-[330px]'>
              <p className='pb-2'>Package</p>
              <Select onValueChange={(value) => handleFilterChange('package', value)}>
                <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                  <SelectValue placeholder="All Packages" />
                </SelectTrigger>
                <SelectContent className="w-full md:w-[330px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                  <SelectGroup>
                    <SelectItem value="all" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">All Packages</SelectItem>
                    <SelectItem value="collection" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Collection</SelectItem>
                    <SelectItem value="loan" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Loan</SelectItem>
                    <SelectItem value="investment" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Investment</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div> */}
            <div className="outline-none leading-[24px] rounded-[4px] w-full md:w-[330px] font-inter text-[14px] bg-white transition-all">
              <p className="text-[14px] font-inter pb-2">From</p>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="w-full h-[40px]  border border-[#D0D5DD] rounded-[4px] font-inter p-1"
              />
            </div>
            <div className="outline-none leading-[24px] rounded-[4px] w-full md:w-[330px] font-inter text-[14px] bg-white transition-all">
              <p className='text-[14px] font-inter pb-2'>To</p>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="w-full h-[40px]  border border-[#D0D5DD] rounded-[4px] font-inter p-1"
              />
            </div>
          </div>

          <div className="flex flex-wrap flex-col md:flex-row p-4 gap-4 md:gap-[20px]">
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px] mb-2 md:mb-0">
              <p className='text-[#737373] font-inter font-normal'>Total transactions</p>
              <h1 className='font-inter font-semibold text-[20px]'>{filteredTransactions.length}</h1>
            </div>
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px]">
              <p className='text-[#737373] font-inter font-normal'>Total amount</p>
              <h1 className='font-inter font-semibold text-[20px]'>
                {formatCurrency(filteredTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0))}
              </h1>
            </div>
          </div>

          <div className='h-[20px] bg-gray-100 w-full mb-1'></div>
        </div>

        <div className='flex flex-wrap flex-col md:flex-row items-center justify-between gap-4 md:gap-10 p-2 md:p-5'>
          <div className='flex flex-wrap flex-col md:flex-row items-center gap-2 md:gap-5 w-full md:w-auto'>

            <Select onValueChange={(value) => handleFilterChange('branch', value)}>
              <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full md:w-[185px] border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                <SelectValue placeholder="All branch" />
              </SelectTrigger>
              <SelectContent className="w-full md:w-[185px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                <SelectGroup>
                  <SelectItem value="all" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name} className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select >
              <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full md:w-[185px] border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                <SelectValue placeholder="Show 10 per row" />
              </SelectTrigger>
              <SelectContent className="w-full md:w-[185px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                <SelectGroup>
                  <SelectItem value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]  ">Show 10 per row</SelectItem>
                  <SelectItem value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">Show 15 per row</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-wrap flex-col md:flex-row gap-2 md:gap-5 w-full md:w-auto'>

            <div className='relative w-full md:w-auto mb-2 md:mb-0'>
              <button onClick={() => setShow(!show)} className='bg-[#FAF9FF] h-[40px] cursor-pointer w-full md:w-[105px] flex items-center justify-center gap-[7px] rounded-[4px]'>
                <p className='text-[#4E37FB] font-medium text-[14px]'>Export</p>
                <FaAngleDown className="w-[16px] h-[16px] text-[#4E37FB] my-[auto] " />
              </button>
              {show && <div onClick={() => setShow(!show)} className='absolute w-[90vw] max-w-[150px] min-w-[90px] md:w-[105px] bg-white rounded-[4px] shadow-lg'>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">PDF</p>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">CSV</p>
              </div>}
            </div>
            <div className="flex items-center h-[40px] w-full md:w-[311px] gap-1 border border-[#E5E7EB] rounded-[4px] px-3">
              <Image src="/icons/search.png" alt="dashboard" width={20} height={20} className="cursor-pointer" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="outline-none px-3 py-2 w-full text-sm"
              />
            </div>
          </div>
        </div>

        <div className='overflow-auto w-full'>
          <table className="table-auto w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-[#D9D4D4]">
              <tr className="h-[40px] text-left">
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  <div className="flex items-center gap-[3px]">
                    Transaction ID
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                      <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    </div>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Customer</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Account number</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Package</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  Amount
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  Branch
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  <div className="flex items-center gap-[3px]">
                    Agent
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                      <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    </div>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] "><div className="flex items-center gap-[3px]">
                  Date
                  <div className="flex flex-col gap-[1px] shrink-0">
                    <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                  </div>
                </div></th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Status</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Actions</th>
              </tr>
            </thead>
            <tbody className="border-b border-[#D9D4D4] w-full">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-500">
                    {typeof window !== 'undefined' && (!window.localStorage.getItem('user') || !JSON.parse(window.localStorage.getItem('user') || '{}').token)
                      ? 'Please log in to view investment transactions' 
                      : 'No transactions found'
                    }
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((item, index) => (
                  <tr key={item.id} className="bg-white transition-all duration-500 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                      {item.id}
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.customer}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.accountNumber}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.package}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                      N{item.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.branch}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.agent}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                      {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString() : item.date}
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
          {/* Mobile stacked rows */}
          {!loading && filteredTransactions.length > 0 && (
            <div className="md:hidden block">
              {filteredTransactions.map((item) => (
                <div key={item.id} className="border-b p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Transaction ID:</span>
                      <span className="font-semibold">{item.id}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Customer:</span>
                      <span className="font-semibold">{item.customer}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Account number:</span>
                      <span className="font-semibold">{item.accountNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Package:</span>
                      <span className="font-semibold">{item.package}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Amount:</span>
                      <span className="font-semibold">N{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Branch:</span>
                      <span className="font-semibold">{item.branch}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Agent:</span>
                      <span className="font-semibold">{item.agent}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Date:</span>
                      <span className="font-semibold">
                        {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString() : item.date}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status || 'pending'}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='border-t w-full mt-5'></div>
        <div className="flex flex-wrap flex-col md:flex-row pb-4 justify-between items-center gap-2 mt-4 px-2 md:px-6">
          {/* Prev Button */}
          <button
            className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center mb-2 md:mb-0 hover:bg-gray-50 transition-colors"
          >
            <Image src="/icons/left.svg" alt="Prev" width={10} height={10} className="mr-1" />
            Previous
          </button>
          {/* Page Numbers */}
          <div className="flex gap-2 items-center justify-center">
            <p>1234</p>
          </div>
          {/* Next Button */}
          <button
            className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center hover:bg-gray-50 transition-colors"
          >
            Next
            <Image src="/icons/right.svg" alt="Next" width={10} height={10} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Investment Transaction Form Modal */}
      <InvestmentTransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
        editData={editData}
      />

    </div>
  )
}

export default Page