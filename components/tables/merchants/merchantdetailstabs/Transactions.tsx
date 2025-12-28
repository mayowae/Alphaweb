"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa';
import { MerchantData } from '../../../../interface/type';
import Pagination from '../../../admin/pagination';


const Transactions = () => {

  const [show, setShow] = useState<boolean>(false)

  const [filter, setFilter] = useState(false)

  const data: MerchantData[] = [
    { id: 'COL-103-A45', package: 'Alpha 1K', account: '94565647567', amount: 'N1,000', customer: 'James Odunayo', method:"wallet", status: 'active', created: '23 Jan, 2025' },
    { id: 'COL-203-B12', package: 'Alpha 2K', account: '94565647568', amount: 'N2,000', customer: 'Jane Doe', method:"wallet", status: 'active', created: '23 Jan, 2025' },
  ];

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <div>
      <div className='bg-white dark:bg-gray-900 dark:text-white shadow-sm w-full relative'>

        <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px] '>

          <div className='flex flex-wrap items-center gap-[10px] md:gap-[20px] w-full md:w-auto'>

            <div className='relative w-full md:w-auto'>
              <button onClick={() => setFilter(!filter)} className='h-[40px] outline-none leading-[24px] rounded-[4px] w-[90px] border border-[#D0D5DD] flex items-center justify-center gap-[9px] font-inter text-[14px] bg-white  transition-all'>
                <Image src="/icons/filters.svg" alt="filter" width={16} height={16} className="" />
                <p className='font-medium text-[14px]'>Filter</p>
              </button>

              {filter &&
                <div className='fixed inset-0 z-50 flex  items-center justify-center bg-black/20'>

                  <div className='lg:w-[500px] sm:w-[400px] w-[90%] absolute  bg-white max-h-[90vh]  overflow-y-auto flex flex-col gap-[20px] p-[15px]'>

                    <div className="flex items-center justify-between max-md:flex-col max-md:gap-[5px] ">
                      <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Choose your filters</h1>
                      <button className=' text-[14px] text-[#4E37FB] font-inter font-semibold'>Clear filters</button>
                    </div>

                    <div className='border-t-[1px] w-full'></div>

                    <div className="w-full flex flex-col gap-[20px]">

                      <div className="">
                        <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Type</p>
                        <div className='flex lg:items-center gap-[10px] max-md:flex-col'>
                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input type="checkbox" name='free' className='' />
                            Remittance
                          </div>

                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input type="checkbox" name='basic' className='' />
                            Loan repayment
                          </div>

                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input type="checkbox" name='pro' className='' />
                            Investment
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Status</p>
                        <div className='flex lg:items-center gap-[10px] max-md:flex-col'>
                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input type="checkbox" name='active' className='' />
                            Active
                          </div>

                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input type="checkbox" name='inactive' className='' />
                            Inactive
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className='border-t-[1px] w-full '></div>

                    <div className='flex gap-[8px] justify-end items-end mb-1 '>
                      <button onClick={() => setFilter(!filter)} className='bg-[#F3F8FF] flex h-[40px] cursor-pointer w-[67px] rounded-[4px] items-center gap-[9px] justify-center'>
                        <p className='text-[14px] font-inter text-[#4E37FB] font-semibold' >Close</p>
                      </button>

                      <button className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-[99px] rounded-[4px] items-center gap-[9px] justify-center'>
                        <p className='text-[14px] font-inter text-white font-medium'>Add filters</p>
                      </button>
                    </div>
                  </div>


                </div>}
            </div>

            <div className='w-[100%]  md:w-[185px] '>

              <select className="h-[40px] w-full outline-none leading-[24px] rounded-[4px] border border-[#D0D5DD] font-inter text-[14px] bg-white px-2 transition-all">

                <option value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 10 per row</option>

                <option value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 15 per row</option>
              </select>

            </div>

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
                placeholder="Search"
                className="  outline-none px-3 py-2 w-full text-sm"
              />
            </div>

          </div>
        </div>

        {/*table*/}
        <div className='overflow-x-auto '>
          <div className='overflow-auto w-full'>
            <table className="table-auto w-full whitespace-nowrap  ">
              <thead className="bg-gray-50 border-b border-[#D9D4D4] dark:bg-gray-900 dark:text-white">
                <tr className="h-[40px] text-left">
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white"> <div className="flex items-center gap-2">
                   {/* <input
                      type="checkbox"
                      checked={selectAll}
                       onChange={handleSelectAll}
                      className="w-5 h-5 border border-gray-300 rounded-md hover:border-indigo-500 hover:bg-indigo-100 checked:bg-indigo-100"
                    />*/}
                    <span className="flex items-center gap-[3px] text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                      Transaction ID
                      <div className="flex flex-col gap-[1px] shrink-0">
                        <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                      </div>
                    </span>
                  </div></th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Type</th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Amount</th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                    Initiated by
                  </th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white ">
                    <div className="flex items-center gap-[3px]">
                      Status
                      <div className="flex flex-col gap-[1px] shrink-0">
                        <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                      </div>
                    </div>
                  </th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                    <div className="flex items-center gap-[3px]">
                      Date
                      <div className="flex flex-col gap-[1px] shrink-0">
                        <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                      </div>
                    </div>
                  </th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] "></th>
                </tr>
              </thead>

              <tbody className="border-b border-[#D9D4D4] w-full">
                {data.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-gray-900  transition-all border-b duration-500 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal "><div className="flex items-center gap-2">
                      {/*<input
                        type="checkbox"
                        checked={selectedUsers.includes(item.id)}
                        onChange={() => handleSelectUser(item.id)}
                        className="w-5 h-5 border border-gray-300 rounded-md hover:border-indigo-500 hover:bg-indigo-100 checked:bg-indigo-100"
                      />*/}
                      <span className="flex items-center gap-[3px] text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                        {item.id}
                      </span>
                    </div></td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.package}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white ">{item.account}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.amount}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.customer}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.status}</td>
                    <td className="relative px-3 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal cursor-pointer ">
                      <Image src="/icons/dots.svg" alt="dots" width={20} height={20} onClick={() => toggleDropdown(item.id)} />

                      {openDropdownId === item.id && (
                        <div className="absolute right-0  mt-1 bg-white shadow-lg rounded-md z-50">
                          <p className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">Export</p>
                          <p className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">Retry</p>
                        </div>
                      )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='border-t-[1px] w-full mt-[20px]'></div>

          <Pagination />

        </div>

      </div>
    </div>
  )
}

export default Transactions