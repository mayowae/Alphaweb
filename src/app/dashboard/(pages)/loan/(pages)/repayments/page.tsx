"use client"
import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa'
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
import { fetchRepayments, fetchCustomers, fetchAgents, updateRepaymentStatus, deleteRepayment, fetchRepaymentStats, createRepayment, fetchLoans, fetchLoanPackages, fetchLoanById } from '../../../../../../../services/api';
import Swal from 'sweetalert2';

interface Repayment {
  id: number;
  transactionId: string;
  customerName: string;
  accountNumber?: string;
  package?: string;
  amount: number;
  branch?: string;
  agentName?: string;
  date: string;
  status: string;
  paymentMethod?: string;
  reference?: string;
}

interface Customer {
  id: number;
  fullName: string;
  phone?: string;
}

interface Agent {
  id: number;
  fullName: string;
}

interface LoanItem {
  id: number;
  customerName: string;
  accountNumber?: string;
}

const CreateRepaymentModal = ({
  onClose,
  onSuccess,
  customers,
  agents,
  loans,
  loanPackages
}: {
  onClose: () => void;
  onSuccess: () => void;
  customers: Customer[];
  agents: Agent[];
  loans: LoanItem[];
  loanPackages: any[];
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    loanId: '',
    customerName: '',
    accountNumber: '',
    packageName: '',
    packageAmount: '',
    outstandingAmount: '',
    amountToPay: '',
    agentId: '',
    branch: '',
    paymentMethod: 'Cash',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    if (loans.length > 0 && form.loanId) {
      const loan = loans.find((l) => String(l.id) === form.loanId);
      if (loan) {
        setForm((prev) => ({ ...prev, customerName: loan.customerName }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.loanId]);

  useEffect(() => {
    if (form.packageName) {
      const pkg = loanPackages.find((p:any) => p.name === form.packageName);
      if (pkg) {
        setForm((prev)=> ({ ...prev, packageAmount: String(pkg.loanAmount || pkg.amount || '') }));
      }
    }
  }, [form.packageName, loanPackages]);

  const loadOutstanding = async (loanId: string) => {
    try {
      const data:any = await fetchLoanById(parseInt(loanId));
      const out = data.data?.outstandingAmount ?? (parseFloat(data.data?.totalAmount || 0) - parseFloat(data.data?.amountPaid || 0));
      setForm(prev=> ({ 
        ...prev, 
        outstandingAmount: String(out || 0),
        agentId: data.data?.agentId ? String(data.data.agentId) : prev.agentId,
        branch: data.data?.branch ? String(data.data.branch) : prev.branch,
        accountNumber: data.data?.accountNumber ? String(data.data.accountNumber) : prev.accountNumber
      }));
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRepayment({
        loanId: parseInt(form.loanId),
        customerName: form.customerName,
        accountNumber: form.accountNumber || undefined,
        package: form.packageName || undefined,
        amount: parseFloat(form.amountToPay),
        agentId: form.agentId ? parseInt(form.agentId) : undefined,
        branch: form.branch || undefined,
        reference: form.reference || undefined
      });

      Swal.fire('Success', 'Repayment created successfully', 'success');
      onSuccess();
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Failed to create repayment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-[6px] w-full max-w-[520px] shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-[18px] font-semibold">Add repayment</h2>
          <button onClick={onClose} className="text-sm underline">Close</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Customer</label>
            <select
              value={form.customerName}
              onChange={(e) => {
                const selectedName = e.target.value;
                // Find a loan that matches this customer to auto-fill loanId
                const linkedLoan = loans.find((l) => l.customerName === selectedName);
                const nextState = { ...form, customerName: selectedName, loanId: linkedLoan ? String(linkedLoan.id) : '', accountNumber: linkedLoan?.accountNumber || '' };
                setForm(nextState);
                if (linkedLoan) {
                  loadOutstanding(String(linkedLoan.id));
                } else {
                  setForm((prev) => ({ ...prev, outstandingAmount: '', accountNumber: '' }));
                }
              }}
              className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2"
              required
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.fullName}>{c.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Package name</label>
            <select
              value={form.packageName}
              onChange={(e)=> setForm({ ...form, packageName: e.target.value })}
              className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2"
              required
            >
              <option value="">Select package</option>
              {loanPackages.map((p:any)=> (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Package amount</label>
              <input
                type="number"
                value={form.packageAmount}
                onChange={(e)=> setForm({ ...form, packageAmount: e.target.value })}
                className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2"
                placeholder="Auto-filled"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Outstanding amount</label>
              <input
                type="number"
                value={form.outstandingAmount}
                onChange={(e)=> setForm({ ...form, outstandingAmount: e.target.value })}
                className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2"
                placeholder="Outstanding"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Amount to pay</label>
            <input
              type="number"
              value={form.amountToPay}
              onChange={(e)=> setForm({ ...form, amountToPay: e.target.value })}
              className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Account number</label>
              <input
                value={form.accountNumber}
                onChange={(e)=> setForm({ ...form, accountNumber: e.target.value })}
                className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Reference</label>
              <input
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2"
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-[40px] px-4 rounded-[4px] border">Cancel</button>
            <button type="submit" disabled={submitting} className="h-[40px] px-4 rounded-[4px] bg-[#4E37FB] text-white disabled:opacity-50">{submitting ? 'Saving...' : 'Post repayment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Page = () => {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(false);
  const [show, setShow] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalCollection: 0,
    totalCollectionAmount: 0
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [loanPackages, setLoanPackages] = useState<any[]>([]);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [currentPage, itemsPerPage, selectedStatus, fromDate, toDate]);

  useEffect(() => {
    fetchLoanPackages({ limit: 100 }).then((res:any)=> setLoanPackages(res.data || res.packages || res || [])).catch(()=>setLoanPackages([]));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repaymentsData, customersData, agentsData, loansResp] = await Promise.all([
        fetchRepayments({
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          search: searchTerm || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page: currentPage,
          limit: itemsPerPage
        }),
        fetchCustomers(),
        fetchAgents(),
        fetchLoans({})
      ]);

      setRepayments(repaymentsData.data || []);
      setTotalPages(repaymentsData.pagination?.totalPages || 1);
      setCustomers(customersData.data || customersData.customers || customersData || []);
      setAgents(agentsData.data || []);
      setLoans((loansResp.loans || loansResp?.data || []).map((l: any) => ({ id: l.id, customerName: l.customerName, accountNumber: l.accountNumber })));
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await fetchRepaymentStats();
      setStats({
        totalCollection: statsData.data?.totalRepayments || 0,
        totalCollectionAmount: statsData.data?.totalAmount || statsData.data?.totalCollection || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleStatusUpdate = async (repaymentId: number, newStatus: string) => {
    try {
      await updateRepaymentStatus(repaymentId, { status: newStatus });
      Swal.fire('Success', 'Repayment status updated successfully', 'success');
      fetchData();
      fetchStats();
    } catch (error) {
      console.error('Error updating repayment status:', error);
      Swal.fire('Error', 'Failed to update repayment status', 'error');
    }
  };

  const handleDelete = async (repaymentId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteRepayment(repaymentId);
        Swal.fire('Deleted!', 'Repayment has been deleted.', 'success');
        fetchData();
        fetchStats();
      } catch (error) {
        console.error('Error deleting repayment:', error);
        Swal.fire('Error', 'Failed to delete repayment', 'error');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  return (
    <div className='w-full'>
      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Loan repayments</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>Monitor and record all loan repayment activities.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className='bg-[#4E37FB] text-white flex items-center gap-2 h-[40px] px-4 rounded-[4px]'>
          <FaPlus className='w-4 h-4' />
          Add repayment
        </button>
      </div>

      <div className='bg-white shadow-sm mt-6 w-full relative'>
        <div>
          <div className="flex flex-wrap flex-col md:flex-row p-4 gap-4 md:gap-0 items-stretch md:items-center justify-between">
            <div className='w-full md:w-[330px]'>
              <p className='pb-2'>Agent</p>
              <Select onValueChange={(value) => setSelectedStatus(value)}>
                <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent className="w-full md:w-[330px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                  <SelectGroup>
                    <SelectItem value="All" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">All Agents</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()} className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">
                        {agent.fullName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="outline-none leading-[24px] rounded-[4px] w-full md:w-[330px] font-inter text-[14px] bg-white transition-all">
              <p className="text-[14px] font-inter pb-2">From</p>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full h-[40px]  border border-[#D0D5DD] rounded-[4px] font-inter p-1"
              />
            </div>
            <div className="outline-none leading-[24px] rounded-[4px] w-full md:w-[330px] font-inter text-[14px] bg-white transition-all">
              <p className='text-[14px] font-inter pb-2'>To</p>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-[40px]  border border-[#D0D5DD] rounded-[4px] font-inter p-1"
              />
            </div>
          </div>

          <div className="flex flex-wrap flex-col md:flex-row p-4 gap-4 md:gap-[20px]">
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px] mb-2 md:mb-0">
              <p className='text-[#737373] font-inter font-normal'>Total repayment</p>
              <h1 className='font-inter font-semibold text-[20px]'>{stats.totalCollection}</h1>
            </div>
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px]">
              <p className='text-[#737373] font-inter font-normal'>Total repayment amount</p>
              <h1 className='font-inter font-semibold text-[20px]'>{formatCurrency(stats.totalCollectionAmount)}</h1>
            </div>
          </div>

          <div className='h-[20px] bg-gray-100 w-full mb-1'></div>
        </div>

        <div className='flex flex-wrap flex-col md:flex-row items-center justify-between gap-4 md:gap-10 p-2 md:p-5'>
          <div className='flex flex-wrap flex-col md:flex-row items-center gap-2 md:gap-5 w-full md:w-auto'>

            <div className='relative w-full md:w-auto'>
              <button onClick={() => setFilter(!filter)} className='h-[40px] outline-none leading-[24px] rounded-[4px] w-[90px] border border-[#D0D5DD] flex items-center justify-center gap-[9px] font-inter text-[14px] bg-white  transition-all'>
                <Image src="/icons/filters.svg" alt="filter" width={16} height={16} className="" />
                <p className='font-medium text-[14px]'>Filter</p>
              </button>

              {filter &&
                <div className='fixed md:absolute flex flex-col justify-center  z-50 left-0 right-0 md:left-auto md:right-auto top-0 md:top-auto mx-auto md:mx-0 w-[95%] md:w-[400px] lg:w-[510px] max-w-full md:max-w-[510px] min-w-[230px] md:min-w-[250px] mb-0 md:mb-8 bg-white rounded-b-[8px] md:rounded-[4px] shadow-lg md:p-0' >

                  <div className="flex items-center justify-between max-md:flex-col max-md:gap-[5px] mb-2 md:p-4">
                    <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Choose your filters</h1>
                    <button className='underline text-[14px] text-[#4E37FB] font-inter font-semibold'>Clear filters</button>
                  </div>

                  <div className='border-t-[1px] w-full mb-1'></div>

                  <div className="w-full p-4">
                    <p className='mb-1 font-inter font-semibold text-[14px] leading-[20px]'>Status</p>
                    <div className='flex lg:items-center gap-[10px] mb-6 max-md:flex-col'>
                      <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                        <input 
                          type="checkbox" 
                          name='completed' 
                          checked={selectedStatus === 'Completed'}
                          onChange={() => setSelectedStatus(selectedStatus === 'Completed' ? 'All' : 'Completed')}
                          className='' 
                        />
                        Completed
                      </div>

                      <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                        <input 
                          type="checkbox" 
                          name='pending' 
                          checked={selectedStatus === 'Pending'}
                          onChange={() => setSelectedStatus(selectedStatus === 'Pending' ? 'All' : 'Pending')}
                          className='' 
                        />
                        Pending
                      </div>
                    </div>

                    <p className='mb-1 font-inter font-semibold text-[14px] leading-[20px]'>Date</p>

                    <div className='flex gap-[15px]'>
                      <div className="outline-none leading-[24px] rounded-[4px] w-full md:w-[330px] font-inter text-[14px] bg-white transition-all">
                        <p className="text-[12px] font-inter pb-2">From</p>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full h-[40px]  border border-[#D0D5DD] rounded-[4px] font-inter p-1"
                        />
                      </div>
                      <div className="outline-none leading-[24px] rounded-[4px] w-full md:w-[330px] font-inter text-[14px] bg-white transition-all">
                        <p className='text-[12px] font-inter pb-2'>To</p>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full h-[40px]  border border-[#D0D5DD] rounded-[4px] font-inter p-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className='border-t-[1px] w-full mb-1  '></div>

                  <div className='flex gap-[8px] justify-end items-end p-2 md:p-4 mb-2 '>
                    <button onClick={() => setFilter(!filter)} className='bg-[#F3F8FF] flex h-[40px] cursor-pointer w-[67px] rounded-[4px] items-center gap-[9px] justify-center'>
                      <p className='text-[14px] font-inter text-[#4E37FB] font-semibold' >Close</p>
                    </button>

                    <button onClick={() => { setFilter(false); handleSearch(); }} className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-[99px] rounded-[4px] items-center gap-[9px] justify-center'>
                      <p className='text-[14px] font-inter text-white font-medium'>Add filters</p>
                    </button>
                  </div>

                </div>}
            </div>
            <Select onValueChange={handleItemsPerPageChange} value={itemsPerPage.toString()}>
              <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full md:w-[185px] border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                <SelectValue placeholder="Show 10 per row" />
              </SelectTrigger>
              <SelectContent className="w-full md:w-[185px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                <SelectGroup>
                  <SelectItem value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 10 per row</SelectItem>
                  <SelectItem value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 15 per row</SelectItem>
                  <SelectItem value="20" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 20 per row</SelectItem>
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
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="outline-none px-3 py-2 w-full text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className='overflow-auto w-full'>
              <table className="table-auto w-full whitespace-nowrap hidden md:table">
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
                      <div className="flex items-center gap-[3px]">
                        Branch
                        <div className="flex flex-col gap-[1px] shrink-0">
                          <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                        </div>
                      </div>
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
                  {repayments.map((repayment) => (
                    <tr key={repayment.id} className="bg-white transition-all duration-500 hover:bg-gray-50">
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                        {repayment.transactionId}
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{repayment.customerName}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{(repayment as any).accountNumber || (repayment as any).customer?.accountNumber || (repayment as any).loan?.accountNumber || 'N/A'}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{repayment.package || 'N/A'}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatCurrency(repayment.amount)}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{repayment.branch || 'N/A'}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{repayment.agentName || 'N/A'}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatDate(repayment.date)}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repayment.status)}`}>
                          {repayment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                        <div className="flex gap-2">
                          {repayment.status === 'Pending' && (
                            <button
                              onClick={() => handleStatusUpdate(repayment.id, 'Completed')}
                              className="text-green-600 hover:text-green-800"
                              title="Mark as Completed"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(repayment.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
              
              {/* Mobile stacked rows */}
              {repayments.map((repayment) => (
                <div key={repayment.id} className="md:hidden block border-b p-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm text-gray-600"><span>Transaction ID:</span><span className="font-semibold">{repayment.transactionId}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Customer:</span><span className="font-semibold">{repayment.customerName}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Account number:</span><span className="font-semibold">{(repayment as any).accountNumber || (repayment as any).customer?.accountNumber || (repayment as any).loan?.accountNumber || 'N/A'}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Package:</span><span className="font-semibold">{repayment.package || 'N/A'}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Amount:</span><span className="font-semibold">{formatCurrency(repayment.amount)}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Branch:</span><span className="font-semibold">{repayment.branch || 'N/A'}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Agent:</span><span className="font-semibold">{repayment.agentName || 'N/A'}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Date:</span><span className="font-semibold">{formatDate(repayment.date)}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Status:</span><span className="font-semibold">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repayment.status)}`}>
                        {repayment.status}
                      </span>
                    </span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Actions:</span>
                      <div className="flex gap-2">
                        {repayment.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusUpdate(repayment.id, 'Completed')}
                            className="text-green-600 hover:text-green-800"
                            title="Mark as Completed"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(repayment.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='border-t w-full mt-5'></div>
            <div className="flex flex-wrap flex-col md:flex-row pb-4 justify-between items-center gap-2 mt-4 px-2 md:px-6">
              {/* Prev Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center mb-2 md:mb-0 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image src="/icons/left.svg" alt="Prev" width={10} height={10} className="mr-1" />
                Previous
              </button>
              {/* Page Numbers */}
              <div className="flex gap-2 items-center justify-center">
                <span>Page {currentPage} of {totalPages}</span>
              </div>
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <Image src="/icons/right.svg" alt="Next" width={10} height={10} className="ml-1" />
              </button>
            </div>
          </>
        )}
      </div>

      {isCreateOpen && (
        <CreateRepaymentModal 
          onClose={() => setIsCreateOpen(false)} 
          onSuccess={() => { setIsCreateOpen(false); fetchData(); fetchStats(); }} 
          customers={customers}
          agents={agents}
          loans={loans}
          loanPackages={loanPackages}
        />
      )}

    </div>
  )
}

export default Page