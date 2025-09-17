"use client"
import React, { useState, useEffect } from 'react'
import { FaPlus } from 'react-icons/fa'
import { FaAngleDown } from 'react-icons/fa';
import Image from 'next/image';
import { fetchCollections, fetchAgents } from '../../../../../../../services/api';
import Swal from 'sweetalert2';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"

interface Collection {
  id: number;
  customerName: string;
  amount: number;
  dueDate: string;
  type: string;
  status: 'Pending' | 'Collected' | 'Overdue';
  dateCreated: string;
  agentName?: string;
  transactionId?: string;
  accountNumber?: string;
}

const Page = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState<boolean>(false);
  const [approve, setApprove] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [modalopen, setModalopen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [collectionsRes, agentsRes] = await Promise.all([
        fetchCollections(),
        fetchAgents()
      ]);
      
      // Transform collections data to match interface and filter for collected status
      const transformedCollections = (collectionsRes.collections || [])
        .filter((collection: any) => collection.status === 'Collected')
        .map((collection: any, index: number) => ({
          ...collection,
          transactionId: `COL-${collection.id}-${String.fromCharCode(65 + (index % 26))}${(index % 100).toString().padStart(2, '0')}`,
          accountNumber: `${Math.floor(Math.random() * 900000000) + 100000000}`,
          agentName: 'John Brown' // Default agent name, can be enhanced with real agent data
        }));
      
      setCollections(transformedCollections);
      setAgents(agentsRes.agents || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load remittance data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter collections based on search, agent, and date range
  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgent = selectedAgent === 'all' || collection.agentName === selectedAgent;
    
    let matchesDateRange = true;
    if (fromDate && toDate) {
      const collectionDate = new Date(collection.dateCreated);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      matchesDateRange = collectionDate >= from && collectionDate <= to;
    }
    
    return matchesSearch && matchesAgent && matchesDateRange;
  });

  // Pagination
  const totalItems = filteredCollections.length;
  const totalPages = Math.ceil(totalItems / parseInt(rowsPerPage));
  const startIndex = (currentPage - 1) * parseInt(rowsPerPage);
  const paginatedCollections = filteredCollections.slice(startIndex, startIndex + parseInt(rowsPerPage));

  const [selectedRows, setSelectedRows] = useState<boolean[]>(() => Array(paginatedCollections.length).fill(false));
  const [selectAll, setSelectAll] = useState(false);

  // Update selectedRows when paginatedCollections changes
  useEffect(() => {
    setSelectedRows(Array(paginatedCollections.length).fill(false));
    setSelectAll(false);
  }, [paginatedCollections.length]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedRows(Array(paginatedCollections.length).fill(newSelectAll));
  };

  const handleRowSelect = (index: number) => {
    const updated = [...selectedRows];
    updated[index] = !updated[index];
    setSelectedRows(updated);
    setSelectAll(updated.every(Boolean));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleApproveSelected = () => {
    const selectedCount = selectedRows.filter(Boolean).length;
    const selectedAmount = paginatedCollections
      .filter((_, index) => selectedRows[index])
      .reduce((sum, collection) => sum + collection.amount, 0);
    
    if (selectedCount === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select collections to approve.',
      });
      return;
    }

    Swal.fire({
      title: 'Approve Selected Collections',
      text: `You are about to approve ${selectedCount} collections totaling ${formatCurrency(selectedAmount)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Selected collections have been approved.',
        });
        // Reset selections
        setSelectedRows(Array(paginatedCollections.length).fill(false));
        setSelectAll(false);
      }
    });
  };

  const handleApproveAll = () => {
    const totalAmount = filteredCollections.reduce((sum, collection) => sum + collection.amount, 0);
    
    Swal.fire({
      title: 'Approve All Collections',
      text: `You are about to approve ${filteredCollections.length} collections totaling ${formatCurrency(totalAmount)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve All',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'All collections have been approved.',
        });
      }
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
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Remittance</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>View and verify collections made by agents for the day.</p>
        </div>
      </div>

      <div className='bg-white shadow-sm mt-6 w-full relative'>
        <div>
          <div className="flex flex-wrap flex-col md:flex-row p-4 gap-4 md:gap-0 items-stretch md:items-center justify-between">
            <div className='w-full md:w-[330px]'>
              <p className='pb-2'>Agent</p>
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
                className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] font-inter p-1"
              />
            </div>
            <div className="outline-none leading-[24px] rounded-[4px] w-full md:w-[330px] font-inter text-[14px] bg-white transition-all">
              <p className='text-[14px] font-inter pb-2'>To</p>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] font-inter p-1"
              />
            </div>
          </div>

          <div className="flex flex-wrap flex-col md:flex-row p-4 gap-4 md:gap-[20px]">
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px] mb-2 md:mb-0">
              <p className='text-[#737373] font-inter font-normal'>Total collection</p>
              <h1 className='font-inter font-semibold text-[20px]'>{filteredCollections.length}</h1>
            </div>
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px]">
              <p className='text-[#737373] font-inter font-normal'>Total collection amount</p>
              <h1 className='font-inter font-semibold text-[20px]'>
                {formatCurrency(filteredCollections.reduce((sum, collection) => sum + collection.amount, 0))}
              </h1>
            </div>
          </div>

          <div className='h-[20px] bg-gray-100 w-full mb-1'></div>
        </div>

        <div className='flex flex-wrap flex-col md:flex-row items-center justify-between gap-4 md:gap-10 p-2 md:p-5'>
          <div className='flex flex-wrap flex-col md:flex-row items-center gap-2 md:gap-5 w-full md:w-auto'>
            <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
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
              <button onClick={() => setApprove(!approve)} className='bg-[#4E37FB] h-[40px] cursor-pointer w-full md:w-[118px] flex items-center justify-center gap-[7px] rounded-[4px]'>
                <p className='text-white font-medium text-[14px]'>Approve</p>
                <FaAngleDown className="w-[16px] h-[16px] text-white my-[auto] " />
              </button>
              {approve && <div className='absolute z-50 w-[90vw] max-w-[150px] min-w-[90px] md:w-[150px] bg-white rounded-[4px] shadow-lg'>
                <p onClick={handleApproveAll} className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">Approve all</p>
                <p onClick={handleApproveSelected} className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Approve selected</p>
              </div>}
            </div>

            <div className='cursor-pointer'>
              <Image src="/icons/delete.svg" alt='delete' width={40} height={40} />
            </div>

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
                className="outline-none px-3 py-2 w-full text-sm"
              />
            </div>
          </div>
        </div>

        <div className='overflow-auto w-full'>
          <table className="table-auto w-full whitespace-nowrap hidden md:table">
            <thead className="bg-gray-50 border-b border-[#D9D4D4]">
              <tr className="h-[40px] text-left">
                <th className="px-5 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-5 h-5 border border-gray-300 rounded-md hover:border-indigo-500 hover:bg-indigo-100 checked:bg-indigo-100"
                    />
                    <span className="flex items-center gap-[3px] text-[12px] leading-[18px] font-lato font-normal text-[#141414]">
                      Transaction ID
                      <div className="flex flex-col gap-[1px] shrink-0">
                        <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                        <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                      </div>
                    </span>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Type</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Account number</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Amount</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  <div className="flex items-center gap-[3px]">
                    Customer
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                      <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    </div>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  <div className="flex items-center gap-[3px]">
                    Date
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                      <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="border-b border-[#D9D4D4] w-full">
              {paginatedCollections.map((collection, index) => (
                <tr key={collection.id} className="bg-white transition-all duration-500 hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRows[index]}
                        onChange={() => handleRowSelect(index)}
                        className="w-5 h-5 border border-gray-300 rounded-md hover:border-indigo-500 hover:bg-indigo-100 checked:bg-indigo-100"
                      />
                      <span className="flex items-center gap-[3px] text-[12px] leading-[18px] font-lato font-normal text-[#141414]">
                        {collection.transactionId}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{collection.type}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{collection.accountNumber}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatCurrency(collection.amount)}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{collection.customerName}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatDate(collection.dateCreated)}</td>
                </tr>
              ))}
              {paginatedCollections.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    No collections found for remittance
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Mobile stacked rows */}
          <div className="md:hidden">
            {paginatedCollections.map((collection, index) => (
              <div key={collection.id} className="block border-b p-2">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      <input
                        type="checkbox"
                        checked={selectedRows[index]}
                        onChange={() => handleRowSelect(index)}
                        className="w-4 h-4 mr-2"
                      />
                      Transaction ID:
                    </span>
                    <span className="font-semibold">{collection.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Type:</span><span className="font-semibold">{collection.type}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Account number:</span><span className="font-semibold">{collection.accountNumber}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Amount:</span><span className="font-semibold">{formatCurrency(collection.amount)}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Customer:</span><span className="font-semibold">{collection.customerName}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Date:</span><span className="font-semibold">{formatDate(collection.dateCreated)}</span></div>
                </div>
              </div>
            ))}
            {paginatedCollections.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No collections found for remittance
              </div>
            )}
          </div>
        </div>
      
        <div className='border-t w-full mt-5'></div>
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
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({totalItems} total)
            </span>
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
