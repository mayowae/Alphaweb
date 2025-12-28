"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa';
import Pagination from '../../admin/pagination';


function Audittable() {

    const [show, setShow] = useState<boolean>(false)

    const [filter, setFilter] = useState(false)
    return (
        <div>

            <div className='bg-white dark:bg-gray-900 dark:text-white mt-6 shadow-sm w-full relative'>

                <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px] '>

                    <div className='flex flex-wrap items-center gap-[10px] md:gap-[20px] w-full md:w-auto'>

                        <div className='relative w-full md:w-auto'>
                            <button onClick={() => setFilter(!filter)} className='h-[40px] outline-none leading-[24px] rounded-[4px] w-[90px] border border-[#D0D5DD] flex items-center justify-center gap-[9px] font-inter text-[14px] bg-white  transition-all'>
                                <Image src="/icons/filters.svg" alt="filter" width={16} height={16} className="" />
                                <p className='font-medium text-[14px]'>Filter</p>
                            </button>

                            {filter &&
                                <div className='fixed inset-0 z-50 flex  items-center justify-center bg-black/20'>

                                    <div className='lg:w-[500px] sm:w-[400px] w-[90%]  max-h-[90vh]  overflow-y-auto absolute  bg-white  flex flex-col gap-[20px] p-[15px]'>

                                        <div className="flex  items-center justify-between max-md:flex-col max-md:gap-[5px] ">
                                            <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Choose your filters</h1>
                                            <button className='text-[14px] text-[#4E37FB] font-inter font-semibold'>Clear filters</button>
                                        </div>

                                        <div className='border-t-[1px] w-full -p-[0px]'></div>

                                        <div className="w-full flex flex-col gap-[20px] ">

                                            <div className="">
                                                <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Merchant</p>
                                                <div className='flex lg:items-center gap-[10px]  max-md:flex-col'>
                                                    <select
                                                        className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px] "
                                                    >
                                                        <option value="">Select Merchant</option>
                                                        <option value="">John doe</option>
                                                    </select>
                                                </div>
                                            </div>



                                            <div className="">
                                                <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Action Type</p>
                                                <div className='flex lg:items-center gap-[10px]  max-md:flex-col'>
                                                    <select
                                                        className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px] "
                                                    >
                                                        <option value="">Select actions</option>
                                                        <option value="">view</option>
                                                    </select>
                                                </div>
                                            </div>


                                            <div className="">
                                                <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Users</p>
                                                <div className='flex lg:items-center gap-[10px]  max-md:flex-col'>
                                                    <select
                                                        className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px] "
                                                    >
                                                        <option value="">Select users</option>
                                                        <option value="">John doe</option>
                                                    </select>
                                                </div>
                                            </div>

                                            
                                        </div>

                                        <div className='border-t-[1px] w-full  '></div>

                                        <div className='flex gap-[8px] justify-end items-end mb-1'>
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

                        <div className='w-[100%]  md:w-[180px] '>

                            <select className="h-[40px] w-full outline-none leading-[24px] rounded-[4px] border border-[#D0D5DD] font-inter text-[14px] bg-white px-2 transition-all">

                                <option value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Last 10 days</option>

                                <option value="20" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Last 20 days</option>

                                <option value="30" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Last 30 days</option>
                            </select>

                        </div>
                    </div>
                </div>

                {/*table*/}
                <div className='overflow-x-auto '>
                    {/* desktop table stacked row */}
                    <div className='overflow-auto w-full '>
                        <table className="table-auto w-full whitespace-nowrap dark:border dark:border-gray-700 ">
                            <thead className="bg-gray-50 border-b border-[#D9D4D4] dark:bg-gray-900 ">
                                <tr className="h-[40px] text-left leading-[18px] text-[12px] font-lato font-normal text-[#141414] dark:text-white">
                                    <th className="px-5 py-2 ">
                                        Date & Time
                                    </th>
                                    <th className="px-5 py-2">User</th>
                                    <th className="px-5 py-2">Merchant</th>
                                    <th className="px-5 py-2 ">Action</th>
                                    <th className="px-5 py-2 ">
                                        <div className="flex items-center gap-[3px]">
                                            Details
                                            <div className='flex flex-col gap-[1px]'>
                                                <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                                                <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>

                            <tbody className=' w-full bg-white dark:bg-gray-900'>
                                <tr className=" text-[14px] text-gray-600 dark:text-white transition-all duration-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-[#D9D4D4] dark:border dark:border-gray-700 font-lato font-normal leading-[20px]">
                                    <td className="px-5 py-4  ">23 Jan, 2025 - 10:00 AM</td>
                                    <td className="px-5 py-4">
                                        <div className="flex gap-1">
                                            <div className={`p-2 rounded-full bg-[#E9E6FF] text-[#4E37FB] cursor-pointer flex items-center justify-center text-purple text-sm font-bold `}>
                                                OR
                                            </div>
                                            <div className=" flex flex-col ">
                                                <h1 className="font-lato text-[14px] leading-[20px]">Adebayo tayo</h1>
                                                <p className="text-[14px] font-lato">Admin 1</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 ">Adebola Microfinance Bank, Lagos</td>
                                    <td className="px-5 py-4 ">Approved remitance</td>
                                    <td className="px-5 py-4">
                                        <div className=" flex flex-col ">
                                            <h1 className="font-lato text-[14px] leading-[20px]">Approved remittance for  Agent </h1>
                                            <p className="text-[14px] font-lato text-[#432AFB]">AG0112345ADE...</p>
                                        </div>
                                    </td>

                                    {/* Mobile stacked row */}
                                    {/*<td className=" md:hidden block divide-y divide-gray-200 dark:divide-gray-700">
                                <div className="p-4 flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-200">
                                  <div className="flex justify-between">
                                    <span className="font-medium">Date & Time:</span>
                                    <span>23 Jan, 2025 - 10:00 AM</span>
                                  </div>
              
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">User:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="p-2 rounded-full bg-[#E9E6FF] text-[#4E37FB] text-sm font-bold">OR</div>
                                      <div>
                                        <h1 className="text-[14px]">Adebayo Tayo</h1>
                                        <p className="text-[13px] text-gray-500">Admin 1</p>
                                      </div>
                                    </div>
                                  </div>
              
                                  <div className="flex justify-between">
                                    <span className="font-medium">Action:</span>
                                    <span>Approved remittance</span>
                                  </div>
              
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Details:</span>
                                    <div className="mt-1">
                                      <p>Approved remittance for Agent</p>
                                      <p className="text-[#432AFB]">AG0112345ADE...</p>
                                    </div>
                                  </div>
                                </div>
                              </td>*/}
                                </tr>
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

export default Audittable