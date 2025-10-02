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
import { fetchLoans, fetchCustomers, fetchAgents, updateLoanStatus, deleteLoan, fetchLoanStats, createLoan } from '../../../../../../../services/api';
import Swal from 'sweetalert2';
import LoadingButton from '../../../../../../../components/LoadingButton';

interface Loan {
  id: number;
  customerName: string;
  accountNumber?: string;
  loanAmount: number;
  interestRate: number;
  duration: number;
  agentName?: string;
  branch?: string;
  status: string;
  dateIssued: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  formUrl?: string;
}

interface Customer {
  id: number;
  fullName: string;
  phone?: string;
}

interface Agent {
  id: number;
  fullName: string;
  branch?: string;
}

const Page = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
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
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newLoan, setNewLoan] = useState({
    customerName: '',
    packageName: '',
    loanAmount: '',
    duration: '',
    dueDate: '',
    accountNumber: '',
    agentId: '',
    branch: '',
    interestRate: '10',
    notes: ''
  });
  const [loanFormFile, setLoanFormFile] = useState<File | null>(null);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [currentPage, itemsPerPage, selectedStatus, fromDate, toDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansData, customersData, agentsData] = await Promise.all([
        fetchLoans({
          status: 'Active',
          search: searchTerm || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page: currentPage,
          limit: itemsPerPage
        }),
        fetchCustomers(),
        fetchAgents()
      ]);

      setLoans(loansData.data || loansData.loans || loansData || []);
      setTotalPages(loansData.pagination?.totalPages || 1);
      setCustomers(customersData.customers || customersData.data || customersData || []);
      setAgents(agentsData.agents || agentsData.data || agentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await fetchLoanStats();
      setStats({
        totalCollection: statsData.data?.totalLoans || 0,
        totalCollectionAmount: statsData.data?.totalAmount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleStatusUpdate = async (loanId: number, newStatus: string) => {
    try {
      await updateLoanStatus(loanId, { status: newStatus });
      Swal.fire('Success', 'Loan status updated successfully', 'success');
      fetchData();
      fetchStats();
    } catch (error) {
      console.error('Error updating loan status:', error);
      Swal.fire('Error', 'Failed to update loan status', 'error');
    }
  };

  const handleDelete = async (loanId: number) => {
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
        await deleteLoan(loanId);
        Swal.fire('Deleted!', 'Loan has been deleted.', 'success');
        fetchData();
        fetchStats();
      } catch (error) {
        console.error('Error deleting loan:', error);
        Swal.fire('Error', 'Failed to delete loan', 'error');
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
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Completed': return 'text-blue-600 bg-blue-100';
      case 'Defaulted': return 'text-red-600 bg-red-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
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

  const handleCreateLoan = async () => {
    try {
      if (!newLoan.customerName || !newLoan.loanAmount || !newLoan.duration || !newLoan.dueDate) {
        return Swal.fire('Missing fields', 'Please fill required fields', 'warning');
      }
      setUploading(true);
      // Optional: upload file to a simple file endpoint if available; for now we skip and store loan without file
      await createLoan({
        customerName: newLoan.customerName,
        accountNumber: newLoan.accountNumber || undefined,
        loanAmount: Number(newLoan.loanAmount),
        interestRate: Number(newLoan.interestRate || 0),
        duration: Number(newLoan.duration),
        agentId: newLoan.agentId ? Number(newLoan.agentId) : undefined,
        branch: newLoan.branch || undefined,
        notes: newLoan.notes || undefined,
        dueDate: newLoan.dueDate,
        loanFormFile: loanFormFile || undefined,
      });
      setShowForm(false);
      setNewLoan({ customerName: '', packageName: '', loanAmount: '', duration: '', dueDate: '', accountNumber: '', agentId: '', branch: '', interestRate: '10', notes: '' });
      setLoanFormFile(null);
      await fetchData();
      await fetchStats();
      Swal.fire('Success', 'Loan created successfully', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Failed to create loan', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='w-full'>
      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Loans</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>View borrower details, loan amounts, due dates, and actions needed.</p>
        </div>
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
              <p className='text-[#737373] font-inter font-normal'>Approved loans</p>
              <h1 className='font-inter font-semibold text-[20px]'>{loans.length}</h1>
            </div>
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px]">
              <p className='text-[#737373] font-inter font-normal'>Approved loan amount</p>
              <h1 className='font-inter font-semibold text-[20px]'>
                {formatCurrency(loans.reduce((sum, l) => sum + Number(l.totalAmount || l.loanAmount || 0), 0))}
              </h1>
            </div>
          </div>

          <div className='h-[20px] bg-gray-100 w-full mb-1'></div>
        </div>

        <div className='flex flex-wrap flex-col md:flex-row items-center justify-between gap-4 md:gap-10 p-2 md:p-5'>
          <div className='flex flex-wrap flex-col md:flex-row items-center gap-2 md:gap-5 w-full md:w-auto'>
            <Select onValueChange={(value) => setSelectedStatus(value)} value={selectedStatus}>
              <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full md:w-[185px] border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="w-full md:w-[185px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                <SelectGroup>
                  <SelectItem value="All" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">All Status</SelectItem>
                  <SelectItem value="Pending" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Pending</SelectItem>
                  <SelectItem value="Active" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Active</SelectItem>
                  <SelectItem value="Completed" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Completed</SelectItem>
                  <SelectItem value="Defaulted" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Defaulted</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
            {/* <button onClick={() => setShowForm(true)} className='bg-[#4E37FB] text-white px-4 py-2 rounded-[4px] h-[40px]'>
              <div className='flex items-center gap-2'>
                <FaPlus className='w-4 h-4' />
                <span>Add loan</span>
              </div>
            </button> */}
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
            {showForm && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-[600px] rounded-[6px] p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[16px] font-semibold">Add Loan</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-500">✕</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm">Customer Name</label>
                      <div className="relative">
                        <input
                          value={newLoan.customerName}
                          onChange={(e)=>{
                            const val = e.target.value;
                            setNewLoan({...newLoan, customerName: val});
                            if (val.trim().length > 0) {
                              const term = val.toLowerCase();
                              const list = customers.filter(c => (c.fullName || '').toLowerCase().includes(term));
                              setFilteredCustomers(list.slice(0, 8));
                              setShowCustomerDropdown(true);
                            } else {
                              setFilteredCustomers([]);
                              setShowCustomerDropdown(false);
                            }
                          }}
                          onFocus={()=>{
                            if ((newLoan.customerName || '').length > 0 && filteredCustomers.length > 0) setShowCustomerDropdown(true);
                          }}
                          onBlur={()=>{
                            setTimeout(()=>setShowCustomerDropdown(false), 150);
                          }}
                          placeholder="Search or type"
                          className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2"
                        />
                        {showCustomerDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-[#E5E7EB] rounded-[4px] max-h-56 overflow-auto shadow">
                            {filteredCustomers.length === 0 && (
                              <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                            )}
                            {filteredCustomers.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={()=>{
                                  setNewLoan({
                                    ...newLoan,
                                    customerName: c.fullName,
                                    accountNumber: (c as any).accountNumber || ''
                                  });
                                  setShowCustomerDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                              >
                                <div className="font-medium">{c.fullName}</div>
                                <div className="text-gray-500">Acct: {(c as any).accountNumber || 'N/A'}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm">Account Number</label>
                      <input value={newLoan.accountNumber} onChange={(e)=>setNewLoan({...newLoan, accountNumber:e.target.value})} placeholder="Account number" className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2" />
                    </div>
                    <div>
                      <label className="text-sm">Loan Amount</label>
                      <input type="number" value={newLoan.loanAmount} onChange={(e)=>setNewLoan({...newLoan, loanAmount:e.target.value})} placeholder="Amount" className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2" />
                    </div>
                    <div>
                      <label className="text-sm">Interest Rate (%)</label>
                      <input type="number" value={newLoan.interestRate} onChange={(e)=>setNewLoan({...newLoan, interestRate:e.target.value})} placeholder="e.g. 10" className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2" />
                    </div>
                    <div>
                      <label className="text-sm">Duration (days)</label>
                      <input type="number" value={newLoan.duration} onChange={(e)=>setNewLoan({...newLoan, duration:e.target.value})} placeholder="e.g. 180" className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2" />
                    </div>
                    <div>
                      <label className="text-sm">Due Date</label>
                      <input type="date" value={newLoan.dueDate} onChange={(e)=>setNewLoan({...newLoan, dueDate:e.target.value})} className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2" />
                    </div>
                    <div>
                      <label className="text-sm">Agent</label>
                      <select value={newLoan.agentId} onChange={(e)=>{
                        const val = e.target.value;
                        const selected = agents.find(a => a.id.toString() === val);
                        setNewLoan({
                          ...newLoan,
                          agentId: val,
                          branch: selected?.branch || newLoan.branch
                        });
                      }} className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2">
                        <option value="">Select agent</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id.toString()}>{a.fullName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm">Branch</label>
                      <input value={newLoan.branch} onChange={(e)=>setNewLoan({...newLoan, branch:e.target.value})} placeholder="Branch" className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] px-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm">Notes</label>
                      <textarea value={newLoan.notes} onChange={(e)=>setNewLoan({...newLoan, notes:e.target.value})} placeholder="Notes" className="w-full min-h-[70px] border border-[#D0D5DD] rounded-[4px] px-2 py-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm">Upload loan form (PDF/Image)</label>
                      <input type="file" accept=".pdf,image/*" onChange={(e)=>setLoanFormFile(e.target.files?.[0] || null)} className="w-full" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={()=>setShowForm(false)} className="px-4 py-2 border rounded-[4px]">Cancel</button>
                    <LoadingButton loading={uploading} loadingText="Saving..." onClick={handleCreateLoan} className="px-4 py-2 bg-[#4E37FB] text-white rounded-[4px]">Save loan</LoadingButton>
                  </div>
                </div>
              </div>
            )}
            <div className='overflow-auto w-full'>
              <table className="table-auto w-full whitespace-nowrap hidden md:table">
                <thead className="bg-gray-50 border-b border-[#D9D4D4]">
                  <tr className="h-[40px] text-left">
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                      <div className="flex items-center gap-[3px]">
                        Customer
                        <div className="flex flex-col gap-[1px] shrink-0">
                          <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                        </div>
                      </div>
                    </th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Account number</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Loan amount</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                      <div className="flex items-center gap-[3px]">
                        Amount
                        <div className="flex flex-col gap-[1px] shrink-0">
                          <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                        </div>
                      </div>
                    </th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                      <div className="flex items-center gap-[3px]">
                        Due date
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
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                      <div className="flex items-center gap-[3px]">
                        Date added
                        <div className="flex flex-col gap-[1px] shrink-0">
                          <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                        </div>
                      </div>
                    </th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Status</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Actions</th>
                  </tr>
                </thead>
                <tbody className="border-b border-[#D9D4D4] w-full">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="bg-white transition-all duration-500 hover:bg-gray-50">
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{loan.customerName}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{loan.accountNumber || 'N/A'}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatCurrency(loan.loanAmount)}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatCurrency(loan.totalAmount)}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatDate(loan.dueDate)}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{loan.agentName || 'N/A'}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatDate(loan.dateIssued)}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                        <div className="flex gap-2">
                          {loan.formUrl && (
                            <button onClick={()=>{
                              const url = loan.formUrl as string;
                              window.open(url, '_blank');
                            }} className="text-blue-600 hover:text-blue-800" title="View form">
                              View Form
                            </button>
                          )}
                          {loan.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(loan.id, 'Active')}
                                className="text-green-600 hover:text-green-800"
                                title="Approve"
                              >
                                <FaCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(loan.id, 'Defaulted')}
                                className="text-red-600 hover:text-red-800"
                                title="Reject"
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(loan.id)}
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
              {loans.map((loan) => (
                <div key={loan.id} className="md:hidden block border-b p-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm text-gray-600"><span>Customer:</span><span className="font-semibold">{loan.customerName}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Account number:</span><span className="font-semibold">{loan.accountNumber || 'N/A'}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Loan amount:</span><span className="font-semibold">{formatCurrency(loan.loanAmount)}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Total amount:</span><span className="font-semibold">{formatCurrency(loan.totalAmount)}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Due date:</span><span className="font-semibold">{formatDate(loan.dueDate)}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Agent:</span><span className="font-semibold">{loan.agentName || 'N/A'}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Date added:</span><span className="font-semibold">{formatDate(loan.dateIssued)}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Status:</span><span className="font-semibold">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>Actions:</span>
                      <div className="flex gap-2">
                        {loan.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(loan.id, 'Active')}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(loan.id, 'Defaulted')}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(loan.id)}
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
    </div>
  )
}

export default Page