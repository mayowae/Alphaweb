"use client"
import React, { useState, useEffect } from 'react'
import { FaPlus } from 'react-icons/fa'
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

const Page = () => {


  const [show, setShow] = useState<boolean>(false)
  const [approve, setApprove] = useState<boolean>(false)

  const data = [
    { id: 'COL-103-A45', package: 'Alpha 1K', account: '94565647567', amount: 'N1,000', customer: 'James Odunayo', date: '23 Jan, 2025' },
    { id: 'COL-203-B12', package: 'Alpha 2K', account: '94565647568', amount: 'N2,000', customer: 'Jane Doe', date: '24 Jan, 2025' },

  ];

  const [selectedRows, setSelectedRows] = useState<boolean[]>(() => Array(data.length).fill(false));
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedRows(Array(data.length).fill(newSelectAll));
  };


  const handleRowSelect = (index: number) => {
    const updated = [...selectedRows];
    updated[index] = !updated[index];
    setSelectedRows(updated);
    setSelectAll(updated.every(Boolean)); // sync "select all" state
  };

  useEffect(() => {
    // Reset select all if any row is deselected
    if (selectedRows.some(row => !row)) {
      setSelectAll(false);
    }
  }, [selectedRows]);


  const [modalopen, setModalopen] = useState(false)

  //const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;


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
              <Select >
                <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent className="w-full md:w-[330px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                  <SelectGroup>
                    <SelectItem value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]  ">1 Agent</SelectItem>
                    <SelectItem value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">2 Agent</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="outline-none leading-[24px] rounded-[4px] w-full md:w-[330px] font-inter text-[14px] bg-white transition-all">
              <p className="text-[14px] font-inter pb-2">From</p>
              <input
                type="date"
                className="w-full h-[40px]  border border-[#D0D5DD] rounded-[4px] font-inter p-1"
              />
            </div>
            <div className="outline-none leading-[24px] rounded-[4px] w-full md:w-[330px] font-inter text-[14px] bg-white transition-all">
              <p className='text-[14px] font-inter pb-2'>To</p>
              <input
                type="date"
                className="w-full h-[40px]  border border-[#D0D5DD] rounded-[4px] font-inter p-1"
              />
            </div>
          </div>

          <div className="flex flex-wrap flex-col md:flex-row p-4 gap-4 md:gap-[20px]">
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px] mb-2 md:mb-0">
              <p className='text-[#737373] font-inter font-normal'>Total collection</p>
              <h1 className='font-inter font-semibold text-[20px]'>200</h1>
            </div>
            <div className="bg-[#FFF8E5] px-5 py-4 rounded-[4px] w-full md:w-[229px] h-[82px]">
              <p className='text-[#737373] font-inter font-normal'>Total collection amount</p>
              <h1 className='font-inter font-semibold text-[20px]'>N1,000,000</h1>
            </div>
          </div>

          <div className='h-[20px] bg-gray-100 w-full mb-1'></div>
        </div>

        <div className='flex flex-wrap flex-col md:flex-row items-center justify-between gap-4 md:gap-10 p-2 md:p-5'>
          <div className='flex flex-wrap flex-col md:flex-row items-center gap-2 md:gap-5 w-full md:w-auto'>
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
              <button onClick={() => setApprove(!approve)} className='bg-[#4E37FB] h-[40px] cursor-pointer w-full md:w-[118px] flex items-center justify-center gap-[7px] rounded-[4px]'>
                <p className='text-white font-medium text-[14px]'>Approve</p>
                <FaAngleDown className="w-[16px] h-[16px] text-white my-[auto] " />
              </button>
              {approve && <div onClick={() => setApprove(!approve)} className='absolute z-50 w-[90vw] max-w-[150px] min-w-[90px] md:w-[150px] bg-white rounded-[4px] shadow-lg'>
                <p onClick={()=> setModalopen(!modalopen)} className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">Approve all</p>
                <p onClick={()=> setModalopen(!modalopen)} className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Approve selected</p>
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
                className="outline-none px-3 py-2 w-full text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="table-auto w-full min-w-[700px] hidden md:table">
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
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Package</th>
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
              {data.map((item, index) => (
                <tr key={item.id} className="bg-white transition-all duration-500 hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRows[index]}
                        onChange={() => handleRowSelect(index)}
                        className="w-5 h-5 border border-gray-300 rounded-md hover:border-indigo-500 hover:bg-indigo-100 checked:bg-indigo-100"
                      />
                      <span className="flex items-center gap-[3px] text-[12px] leading-[18px] font-lato font-normal text-[#141414]">
                        {item.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.package}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.account}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.amount}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.customer}</td>
                  <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{item.date}</td>
                </tr>
              ))}
            </tbody>

          </table>
          {/* Mobile stacked row */}
          <div className="md:hidden block border-b p-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm text-gray-600"><span>Transaction ID:</span><span className="font-semibold">COL-103-A45</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Package:</span><span className="font-semibold">Type 1</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Account number:</span><span className="font-semibold">94565647567</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Amount:</span><span className="font-semibold">N1,000</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Customer:</span><span className="font-semibold">James Odunayo</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Agent:</span><span className="font-semibold">John brown</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Date:</span><span className="font-semibold">23 Jan, 2025</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Status:</span><span className="font-semibold">Pending</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className='border-t w-full mt-5'></div>
      <div className="flex flex-wrap flex-col md:flex-row pb-4 justify-between items-center gap-2 mt-4 px-2 md:px-6">
        {/* Prev Button */}
        <button
          className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center mb-2 md:mb-0"
        >
          <Image src="/icons/left.svg" alt="Prev" width={10} height={10} className="mr-1" />
          Previous
        </button>
        {/* Page Numbers */}
        <div className="flex gap-2 items-center justify-center w-full md:w-auto">
          <p>1234</p>
        </div>
        {/* Next Button */}
        <button
          className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center"
        >
          Next
          <Image src="/icons/right.svg" alt="Prev" width={10} height={10} className="ml-1" />
        </button>
      </div>

      {modalopen && <div className='fixed inset-0 z-50 flex  items-center justify-center bg-black/20'>
        <div className='lg:w-[400px] absolute h-[220px] bg-white rounded-[12px] flex flex-col gap-[20px] p-[24px]'>
          <h1 className='font-inter font-semibold '>Are you sure?</h1>
          <p className='font-inter text-[14px]'>You are about to approve remittance of <span className='font-semibold'>121 collections</span> and amount of <span className='font-semibold'>N120,000 </span> for Agent <span className='font-semibold text-[#4E37FB]'>Mayowa Adegbenga</span></p>

          <div className="flex justify-center  gap-[15px]">

            <button onClick={()=> setModalopen(!modalopen)} className='bg-white flex h-[40px] cursor-pointer w-[167px] border border-[#D0D5DD] rounded-[8px] items-center gap-[9px] justify-center'>
              <p className='text-[14px] font-inter font-semibold'>Cancel</p>
            </button>



            <button className='bg-[#4E37FB] flex h-[40px]  cursor-pointer w-[167px] rounded-[8px] items-center gap-[9px] justify-center'>
              <p className='text-[14px] font-inter text-white font-semibold'>Confirm</p>
            </button>

          </div>
        </div>
      </div>}

    </div>
  )
}

export default Page