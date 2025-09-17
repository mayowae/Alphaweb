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
import { fetchLoanApplications, fetchCustomers, fetchAgents, updateLoanApplicationStatus, deleteLoanApplication } from '../../../../../../../services/api';
import Swal from 'sweetalert2';

interface LoanApplication {
  id: number;
  customerName: string;
  accountNumber?: string;
  requestedAmount: number;
  interestRate: number;
  duration: number;
  agentName?: string;
  branch?: string;
  status: string;
  dateApplied: string;
  notes?: string;
  purpose?: string;
  collateral?: string;
}

interface Customer {
  id: number;
  fullName: string;
  accountNumber?: string;
}

interface Agent {
  id: number;
  fullName: string;
}

const Page = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState<boolean>(false);
  const [filter, setFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchCustomers().then(setCustomers);
    fetchAgents().then(setAgents);
  }, [selectedStatus, searchTerm, fromDate, toDate, currentPage, itemsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchLoanApplications({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchTerm || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      
      setApplications(response.applications);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching loan applications:', error);
      Swal.fire('Error', 'Failed to fetch loan applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      let rejectionReason;
      if (newStatus === 'Rejected') {
        const { value: reason } = await Swal.fire({
          title: 'Rejection Reason',
          input: 'textarea',
          inputLabel: 'Please provide a reason for rejection:',
          inputPlaceholder: 'Enter rejection reason...',
          showCancelButton: true,
          confirmButtonText: 'Reject',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value) {
              return 'You need to provide a rejection reason!';
            }
          }
        });
        
        if (reason === undefined) return; // User cancelled
        rejectionReason = reason;
      }

      await updateLoanApplicationStatus(id, {
        status: newStatus,
        rejectionReason
      });

      Swal.fire('Success', `Application ${newStatus.toLowerCase()} successfully`, 'success');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire('Error', 'Failed to update application status', 'error');
    }
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
        await deleteLoanApplication(id);
        Swal.fire('Deleted!', 'Loan application has been deleted.', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting application:', error);
        Swal.fire('Error', 'Failed to delete application', 'error');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='w-[100%]'>
      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Loan applications</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>Check applicant details, requested amounts, application status, and required actions for approval or rejection.</p>
        </div>
      </div>

      <div className='bg-white shadow-sm mt-[25px] w-full relative'>
        <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px] '>
          <div className='flex flex-wrap items-center gap-[10px] md:gap-[20px] w-full md:w-auto'>
            <div className='relative w-full md:w-auto'>
              <button onClick={() => setFilter(!filter)} className='h-[40px] outline-none leading-[24px] rounded-[4px] w-[90px] border border-[#D0D5DD] flex items-center justify-center gap-[9px] font-inter text-[14px] bg-white  transition-all'>
                <Image src="/icons/filters.svg" alt="filter" width={16} height={16} className="" />
                <p className='font-medium text-[14px]'>Filter</p>
              </button>

              {filter && (
                <div className='fixed md:absolute z-50 left-0 right-0 md:left-auto md:right-auto top-0 md:top-auto mx-auto md:mx-0 w-[95%] md:w-[400px] lg:w-[510px] max-w-full md:max-w-[510px] min-w-[230px] md:min-w-[250px] mb-0 md:mb-8 bg-white rounded-b-[8px] md:rounded-[4px] shadow-lg md:p-0' >
                  <div className="flex items-center justify-between max-md:flex-col max-md:gap-[5px] mb-2 md:p-4">
                    <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Choose your filters</h1>
                    <button 
                      onClick={() => {
                        setSelectedStatus('all');
                        setFromDate('');
                        setToDate('');
                      }}
                      className='underline text-[14px] text-[#4E37FB] font-inter font-semibold'
                    >
                      Clear filters
                    </button>
                  </div>

                  <div className='border-t-[1px] w-full mb-1'></div>

                  <div className="w-full p-4">
                    <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Status</p>
                    <div className='flex lg:items-center gap-[10px] mb-6 max-md:flex-col'>
                      <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                        <input 
                          type="radio" 
                          name='status' 
                          value="all"
                          checked={selectedStatus === 'all'}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className='' 
                        />
                        All
                      </div>
                      <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                        <input 
                          type="radio" 
                          name='status' 
                          value="Pending"
                          checked={selectedStatus === 'Pending'}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className='' 
                        />
                        Pending
                      </div>
                      <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                        <input 
                          type="radio" 
                          name='status' 
                          value="Approved"
                          checked={selectedStatus === 'Approved'}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className='' 
                        />
                        Approved
                      </div>
                      <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                        <input 
                          type="radio" 
                          name='status' 
                          value="Rejected"
                          checked={selectedStatus === 'Rejected'}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className='' 
                        />
                        Rejected
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Date Range</p>
                      <div className='flex gap-2'>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className='w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px]'
                        />
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className='w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px]'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='border-t-[1px] w-full mb-1'></div>

                  <div className='flex gap-[8px] justify-end items-end p-2 md:p-4 mb-2 '>
                    <button onClick={() => setFilter(!filter)} className='bg-[#F3F8FF] flex h-[40px] cursor-pointer w-[67px] rounded-[4px] items-center gap-[9px] justify-center'>
                      <p className='text-[14px] font-inter text-[#4E37FB] font-semibold' >Close</p>
                    </button>
                    <button onClick={handleSearch} className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-[99px] rounded-[4px] items-center gap-[9px] justify-center'>
                      <p className='text-[14px] font-inter text-white font-medium'>Apply filters</p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full md:w-[185px] border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                <SelectValue placeholder="Show 10 per row" />
              </SelectTrigger>
              <SelectContent className="w-[185px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                <SelectGroup>
                  <SelectItem value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]  ">Show 10 per row</SelectItem>
                  <SelectItem value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">Show 15 per row</SelectItem>
                  <SelectItem value="20" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">Show 20 per row</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-wrap gap-[10px] md:gap-[20px] w-full md:w-auto'>
            <div className='relative w-full md:w-auto'>
              <button onClick={() => setShow(!show)} className='bg-[#FAF9FF] h-[40px] cursor-pointer w-[105px] flex items-center justify-center gap-[7px] rounded-[4px]'>
                <p className='text-[#4E37FB] font-medium text-[14px]'>Export</p>
                <FaAngleDown className="w-[16px] h-[16px] text-[#4E37FB] my-[auto] " />
              </button>

              {show && <div onClick={() => setShow(!show)} className='absolute w-[90vw] max-w-[150px] min-w-[90px] md:w-[105px] bg-white rounded-[4px] shadow-lg'>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">PDF</p>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">CSV</p>
              </div>}
            </div>

            <div className="flex items-center h-[40px] w-full md:w-[311px] gap-[4px] border border-[#E5E7EB] rounded-[4px] px-3">
              <Image src="/icons/search.png" alt="dashboard" width={20} height={20} className="cursor-pointer" />
              <input
                type="text"
                placeholder="Search by customer name, account number, or agent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="outline-none px-3 py-2 w-full text-sm"
              />
            </div>
          </div>
        </div>

        <div className='overflow-auto w-full'>
          <table className="table-auto w-full whitespace-nowrap hidden md:table">
            <thead className="bg-gray-50 border-b border-[#D9D4D4]">
              <tr className="h-[40px] text-left">
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Customer</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Account number</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Loan amount</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Interest Rate</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Duration</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Agent</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Branch</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Date Applied</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Status</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Actions</th>
              </tr>
            </thead>

            <tbody className="border-b border-[#D9D4D4] w-full">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-4 text-center">Loading...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-4 text-center">No loan applications found</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="bg-white transition-all duration-500 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{app.customerName}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{app.accountNumber || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatCurrency(app.requestedAmount)}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{app.interestRate}%</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{app.duration} days</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{app.agentName || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{app.branch || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatDate(app.dateApplied)}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                      <div className="flex gap-2">
                        {app.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'Approved')}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Approve"
                            >
                              <FaCheck size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Reject"
                            >
                              <FaTimes size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile stacked rows */}
          {!loading && applications.length > 0 && (
            <div className="md:hidden block">
              {applications.map((app) => (
                <div key={app.id} className="border-b p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Customer:</span>
                      <span className="font-semibold">{app.customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Account Number:</span>
                      <span className="font-semibold">{app.accountNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Loan Amount:</span>
                      <span className="font-semibold">{formatCurrency(app.requestedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Interest Rate:</span>
                      <span className="font-semibold">{app.interestRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Duration:</span>
                      <span className="font-semibold">{app.duration} days</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Agent:</span>
                      <span className="font-semibold">{app.agentName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Branch:</span>
                      <span className="font-semibold">{app.branch || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Date Applied:</span>
                      <span className="font-semibold">{formatDate(app.dateApplied)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {app.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'Approved')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='border-t-[1px] w-full mt-[20px]'></div>

        <div className="flex flex-wrap flex-col md:flex-row pb-4 justify-between items-center gap-2 mt-4 px-2 md:px-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center mb-2 md:mb-0 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image src="/icons/left.svg" alt="Prev" width={10} height={10} className="mr-1" />
            Previous
          </button>
          
          <div className="flex gap-2 items-center justify-center">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <Image src="/icons/right.svg" alt="Next" width={10} height={10} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Page