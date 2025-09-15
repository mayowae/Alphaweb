"use client"
import React, { useState, useEffect } from 'react'
import { FaPlus } from 'react-icons/fa'
import { FaAngleDown } from 'react-icons/fa';
import Image from 'next/image';
import { fetchInvestments, fetchAgents } from '@/services/api';
import Swal from 'sweetalert2';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"

interface Investment {
  id: number;
  customerName: string;
  amount: number;
  plan: string;
  duration: number;
  status: 'Active' | 'Matured' | 'Cancelled';
  dateCreated: string;
}

interface Agent {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  branch: string;
}

const Page = () => {
  const [show, setShow] = useState<boolean>(false)
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch investments and agents data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [investmentsRes, agentsRes] = await Promise.all([
          fetchInvestments(),
          fetchAgents()
        ]);
        
        setInvestments(investmentsRes.investments || []);
        setAgents(agentsRes.agents || []);
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to fetch data.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search investments
  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || investment.status === selectedStatus;
    const matchesDateRange = (!fromDate || new Date(investment.dateCreated) >= new Date(fromDate)) &&
                            (!toDate || new Date(investment.dateCreated) <= new Date(toDate));
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvestments = filteredInvestments.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalInvestments = investments.length;
  const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }


  return (
    <div className='w-full'>
      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[20px] md:text-[24px]'>Investments</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[13px] md:text-[14px] '>View and manage customer investments. Track performance and monitor returns.</p>
        </div>
      </div>

      <div className='bg-white shadow-sm mt-6 w-full relative'>
        <div>
          <div className="flex flex-wrap flex-col md:flex-row p-4 gap-4 md:gap-0 items-stretch md:items-center justify-between">
            <div className='w-full md:w-[330px]'>
              <p className='pb-2 text-[14px] font-inter'>Agent</p>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
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
              <p className='text-[#737373] font-inter font-normal text-[13px] md:text-[14px]'>Total investments</p>
              <h1 className='font-inter font-semibold text-[18px] md:text-[20px]'>{totalInvestments}</h1>
            </div>
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px]">
              <p className='text-[#737373] font-inter font-normal text-[13px] md:text-[14px]'>Total investment amount</p>
              <h1 className='font-inter font-semibold text-[18px] md:text-[20px]'>{formatCurrency(totalAmount)}</h1>
            </div>
          </div>

          <div className='h-[20px] bg-gray-100 w-full mb-1'></div>
        </div>

        <div className='flex flex-wrap flex-col md:flex-row items-center justify-between gap-4 md:gap-10 p-2 md:p-5'>
          <div className='flex flex-wrap flex-col md:flex-row items-center gap-2 md:gap-5 w-full md:w-auto'>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full md:w-[185px] border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="w-full md:w-[185px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                <SelectGroup>
                  <SelectItem value="all" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">All Status</SelectItem>
                  <SelectItem value="Active" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Active</SelectItem>
                  <SelectItem value="Matured" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Matured</SelectItem>
                  <SelectItem value="Cancelled" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full md:w-[185px] border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                <SelectValue placeholder="Show 10 per row" />
              </SelectTrigger>
              <SelectContent className="w-full md:w-[185px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                <SelectGroup>
                  <SelectItem value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 10 per row</SelectItem>
                  <SelectItem value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 15 per row</SelectItem>
                  <SelectItem value="25" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 25 per row</SelectItem>
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
              {show && <div onClick={() => setShow(!show)} className='absolute w-full md:w-[105px] bg-white rounded-[4px] shadow-lg z-10'>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">PDF</p>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">CSV</p>
              </div>}
            </div>
            <div className="flex items-center h-[40px] w-full md:w-[311px] gap-1 border border-[#E5E7EB] rounded-[4px] px-3">
              <Image src="/icons/search.png" alt="dashboard" width={20} height={20} className="cursor-pointer" />
              <input
                type="text"
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none px-3 py-2 w-full text-sm"
              />
            </div>
          </div>
        </div>
        <div className='overflow-auto w-full'>
          <table className="table-auto w-full whitespace-nowrap hidden md:table">
            <thead className="bg-gray-50 border-b border-[#D9D4D4]">
              <tr>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">
                  <div className="flex items-center gap-[3px]">
                    Customer
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} />
                      <Image src="/icons/downarr.svg" alt="downarrow" width={8} height={8} />
                    </div>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">Investment Plan</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">Amount</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">
                  <div className="flex items-center gap-[3px]">
                    Duration
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} />
                      <Image src="/icons/downarr.svg" alt="downarrow" width={8} height={8} />
                    </div>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">
                  <div className="flex items-center gap-[3px]">
                    Date Created
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} />
                      <Image src="/icons/downarr.svg" alt="downarrow" width={8} height={8} />
                    </div>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvestments.map((investment) => (
                <tr key={investment.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal">
                    {investment.customerName}
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal">
                    {investment.plan}
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal">
                    {formatCurrency(investment.amount)}
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal">
                    {investment.duration} days
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal">
                    {formatDate(investment.dateCreated)}
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      investment.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      investment.status === 'Matured' ? 'bg-blue-100 text-blue-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {investment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedInvestments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    No investments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    </div>
  )
}

export default Page