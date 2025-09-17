"use client"
import React, { useState, useEffect } from 'react'
import { FaAngleDown } from 'react-icons/fa';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { 
  fetchInvestmentApplications, 
  fetchCustomers, 
  fetchAgents, 
  updateInvestmentApplicationStatus,
  deleteInvestmentApplication 
} from '../../../../../../../services/api';
import Swal from 'sweetalert2';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"

interface InvestmentApplication {
  id: number;
  customerName: string;
  accountNumber: string;
  targetAmount: number;
  duration: number;
  agentName: string;
  branch: string;
  dateApplied: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  notes?: string;
  rejectionReason?: string;
  customer?: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  agent?: {
    id: number;
    fullName: string;
    phoneNumber: string;
  };
}

interface Customer {
  id: number;
  fullName: string;
  accountNumber: string;
}

interface Agent {
  id: number;
  fullName: string;
  branch: string;
}

const Page = () => {
  const [applications, setApplications] = useState<InvestmentApplication[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState<boolean>(false);
  const [filter, setFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [currentPage, selectedStatus, fromDate, toDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [applicationsRes, customersRes, agentsRes] = await Promise.all([
        fetchInvestmentApplications({
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          search: searchTerm || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page: currentPage,
          limit: itemsPerPage
        }),
        fetchCustomers(),
        fetchAgents()
      ]);
      
      setApplications(applicationsRes.applications || []);
      setTotalPages(applicationsRes.pagination?.totalPages || 1);
      setCustomers(customersRes.customers || []);
      setAgents(agentsRes.agents || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load applications data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: string, rejectionReason?: string) => {
    try {
      await updateInvestmentApplicationStatus(applicationId, {
        status: newStatus,
        rejectionReason
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Application ${newStatus.toLowerCase()} successfully`,
      });
      
      fetchData(); // Refresh data
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update status',
      });
    }
  };

  const handleDelete = async (applicationId: number) => {
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
        await deleteInvestmentApplication(applicationId);
        Swal.fire(
          'Deleted!',
          'Application has been deleted.',
          'success'
        );
        fetchData(); // Refresh data
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete application',
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className='w-[100%]'>

      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Investment applications</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>View and manage customer investment applications. Track performance and monitor returns.</p>
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

              {filter &&
                <div className='fixed md:absolute flex flex-col justify-center  z-50 left-0 right-0 md:left-auto md:right-auto top-0 md:top-auto mx-auto md:mx-0 w-[95%] md:w-[400px] lg:w-[510px] max-w-full md:max-w-[510px] min-w-[230px] md:min-w-[250px] mb-0 md:mb-8 bg-white rounded-b-[8px] md:rounded-[4px] shadow-lg md:p-0' >

                  <div className="flex items-center justify-between max-md:flex-col max-md:gap-[5px] mb-2 md:p-4">
                    <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Choose your filters</h1>
                    <button 
                      onClick={() => {
                        setSelectedStatus('all');
                        setFromDate('');
                        setToDate('');
                        setFilter(false);
                      }} 
                      className='underline text-[14px] text-[#4E37FB] font-inter font-semibold'
                    >
                      Clear filters
                    </button>
                  </div>

                  <div className='border-t-[1px] w-full mb-1'></div>

                  <div className="w-full p-4">
                    <p className='mb-1 font-inter font-semibold text-[14px] leading-[20px]'>Status</p>
                    <div className='flex lg:items-center gap-[10px] mb-6 max-md:flex-col'>
                      <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                        <input 
                          type="radio" 
                          name='status' 
                          value="Completed"
                          checked={selectedStatus === 'Completed'}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className='' 
                        />
                        Completed
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
                  </div>
                </div>
              }
            </div>

            <div className="flex items-center h-[40px] w-full md:w-[311px] gap-[4px] border border-[#E5E7EB] rounded-[4px] px-3">
              <Image src="/icons/search.png" alt="dashboard" width={20} height={20} className="cursor-pointer" />

              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="  outline-none px-3 py-2 w-full text-sm"
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
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Target amount</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  Duration
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
                  Date Applied
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
              {applications.map((application) => (
                <tr key={application.id} className="bg-white transition-all duration-500 hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{application.customer?.fullName || application.customerName}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{application.accountNumber}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatCurrency(application.targetAmount)}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{application.duration} days</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{application.agent?.fullName || application.agentName || 'N/A'}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatDate(application.dateApplied)}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                    <div className="flex gap-2">
                      {application.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'Approved')}
                            className="text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <FaCheck size={16} />
                          </button>
                          <button
                            onClick={() => {
                              Swal.fire({
                                title: 'Reject Application',
                                input: 'text',
                                inputLabel: 'Rejection Reason',
                                inputPlaceholder: 'Enter reason for rejection...',
                                showCancelButton: true,
                                confirmButtonText: 'Reject',
                                showLoaderOnConfirm: true,
                                preConfirm: (reason) => {
                                  if (!reason) {
                                    Swal.showValidationMessage('Please enter a rejection reason');
                                  }
                                  return reason;
                                }
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleStatusUpdate(application.id, 'Rejected', result.value);
                                }
                              });
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <FaTimes size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(application.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile stacked row */}
          {applications.map((application) => (
            <div key={application.id} className="md:hidden block border-b p-2">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Customer:</span>
                  <span className="font-semibold">{application.customerName}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Account number:</span>
                  <span className="font-semibold">{application.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Target amount:</span>
                  <span className="font-semibold">{formatCurrency(application.targetAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Duration:</span>
                  <span className="font-semibold">{application.duration} days</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Agent:</span>
                  <span className="font-semibold">{application.agentName || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Date Applied:</span>
                  <span className="font-semibold">{formatDate(application.dateApplied)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Actions:</span>
                  <div className="flex gap-2">
                    {application.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'Approved')}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <FaCheck size={16} />
                        </button>
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: 'Reject Application',
                              input: 'text',
                              inputLabel: 'Rejection Reason',
                              inputPlaceholder: 'Enter reason for rejection...',
                              showCancelButton: true,
                              confirmButtonText: 'Reject',
                              showLoaderOnConfirm: true,
                              preConfirm: (reason) => {
                                if (!reason) {
                                  Swal.showValidationMessage('Please enter a rejection reason');
                                }
                                return reason;
                              }
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleStatusUpdate(application.id, 'Rejected', result.value);
                              }
                            });
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                        >
                          <FaTimes size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(application.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      
      <div className='border-t-[1px] w-full mt-[20px]'></div>

      <div className="flex flex-wrap flex-col md:flex-row pb-4 justify-between items-center gap-2 mt-4 px-2 md:px-6">
        {/* Prev Button */}
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center mb-2 md:mb-0 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Image src="/icons/left.svg" alt="Prev" width={10} height={10} className="mr-1" />
          Previous
        </button>
        {/* Page Numbers */}
        <div className="flex gap-2 items-center justify-center">
          <p>Page {currentPage} of {totalPages}</p>
        </div>
        {/* Next Button */}
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
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