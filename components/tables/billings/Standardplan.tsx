"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa';
import Pagination from '../../admin/pagination';
import { MerchantData } from '../../../interface/type';
import AddStandard from './modals/Add&EditstandardModal';


const Standardplan = () => {

    const [show, setShow] = useState<boolean>(false)

    const [Addstandard, setAddstandard] = useState<boolean>(false)

    const [selectedMerchant, setSelectedMerchant] = useState<MerchantData | null>(null);

    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const toggleDropdown = (id: string) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };


    const data: MerchantData[] = [
        { id: 'COL-103-A45', package: 'Alpha 1K', account: '94565647567', amount: 'N1,000', customer: 'James Odunayo', method: "wallet", status: 'active', created: '23 Jan, 2025' },
        { id: 'COL-203-B12', package: 'Alpha 2K', account: '94565647568', amount: 'N2,000', customer: 'Jane Doe', method: "wallet", status: 'active', created: '23 Jan, 2025' },
    ];


    const editClick = (menu: MerchantData) => {
        setAddstandard(true)
        setSelectedMerchant(menu)
    };


    return (
        <div>
            <div className='bg-white dark:bg-gray-900 dark:text-white  shadow-sm w-full relative'>

                <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px] '>

                    <div className='flex flex-wrap items-center gap-[10px] md:gap-[20px] w-full md:w-auto'>


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
                    {/* desktop table stacked row */}
                    <div className='overflow-auto w-full '>
                        <table className="table-auto w-full whitespace-nowrap dark:border dark:border-gray-700 ">
                            <thead className="bg-gray-50 border-b border-[#D9D4D4] dark:bg-gray-900 ">
                                <tr className="h-[40px] text-left leading-[18px] text-[12px] font-lato font-normal text-[#141414] dark:text-white">
                                    <th className="px-5 py-2 ">
                                        <div className="flex items-center gap-[3px]">
                                            Plan Name
                                            <div className='flex flex-col gap-[1px]'>
                                                <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                                                <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                                            </div>
                                        </div>
                                    </th>
                                    <th className="px-5 py-2">Features</th>
                                    <th className="px-5 py-2">Pricing (Month/Year)</th>
                                    <th className="px-5 py-2 ">Organizations </th>
                                    <th className="px-5 py-2 ">
                                        <div className="flex items-center gap-[3px]">
                                            Date created
                                            <div className='flex flex-col gap-[1px]'>
                                                <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                                                <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                                            </div>
                                        </div>
                                    </th>
                                    <th className="px-5 py-2 "></th>
                                    <th className="px-5 py-2 "></th>
                                </tr>
                            </thead>

                            <tbody className=' w-full bg-white dark:bg-gray-900'>
                                {data.map((item) => (
                                    <tr key={item.id} className=" text-[14px] text-gray-600 dark:text-white transition-all duration-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-[#D9D4D4] dark:border dark:border-gray-700 font-lato font-normal leading-[20px]">
                                        <td className="px-5 py-4  ">{item.id}</td>
                                        <td className="px-5 py-4 whitespace-normal break-words">
                                            {item.package}
                                        </td>
                                        <td className="px-5 py-4 ">{item.amount}</td>
                                        <td className="px-5 py-4 ">{item.customer}</td>
                                        <td className="px-5 py-4">
                                            {item.created}
                                        </td>
                                        <td className="relative px-3 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal cursor-pointer ">
                                            <Image src="/icons/lucide_edit.svg" alt="dots" width={20} height={20} onClick={() => editClick(item)}/>
                                        </td>
                                        <td className="relative px-3 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal cursor-pointer ">
                                            <Image src="/icons/dots.svg" alt="dots" width={20} height={20} onClick={() =>  toggleDropdown(item.id)} />

                                            {openDropdownId === item.id && (
                                                <div className="absolute right-0  mt-1 bg-white shadow-lg rounded-md z-50">
                                                    <p className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">Delete</p>
                                                </div>
                                            )}

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
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='border-t-[1px] w-full mt-[20px]'></div>

                    <Pagination />

                </div>

            </div>
            <AddStandard
                packag={Addstandard}
                onClose={() => setAddstandard(false)}
                mode="edit"
                merchant={selectedMerchant}
            />

        </div>
    )
}

export default Standardplan;