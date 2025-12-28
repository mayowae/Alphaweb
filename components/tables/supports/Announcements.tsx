"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Pagination from '../../admin/pagination';
import { MerchantData } from '../../../interface/type';
import { FaAngleDown } from 'react-icons/fa';
import NewAnnouncement from './modals/NewAnnouncement';

const Announcements = () => {

  const [show, setShow] = useState<boolean>(false)
  const [announcement, setAnnouncement] = useState<boolean>(false)

  const data: MerchantData[] = [
    { id: 'COL-103-A45', package: 'Alpha 1K', account: '94565647567', amount: 'N1,000', customer: 'James Odunayo', method: "wallet", status: 'active', created: '23 Jan, 2025' },
    { id: 'COL-203-B12', package: 'Alpha 2K', account: '94565647568', amount: 'N2,000', customer: 'Jane Doe', method: "wallet", status: 'active', created: '23 Jan, 2025' },
  ];


  return (
    <div>

      <div className='bg-white dark:bg-gray-900 dark:text-white shadow-sm mt-[25px] w-full  relative'>

        <div className=" flex items-center justify-between px-[10px] md:px-[20px] max-md:flex-col max-sm:gap-2">
          <h1 className='font-inter font-semibold text-[20px]'>Announcements / Broadcasts</h1>

          <div className='flex items-end mt-4 md:mt-0 w-full md:w-auto'>
            <button onClick={() => setAnnouncement(true)} className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
              <p className='text-[14px] font-inter text-white font-medium'>New announcement</p>
            </button>
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px] '>

          <div className='flex flex-wrap gap-4 max-sm:mt-3 items-center md:gap-[20px] w-full md:w-auto'>

            <div className='w-[100%]  md:w-[150px]'>
              <select className="h-[40px] w-full outline-none leading-[24px] rounded-[4px] border border-[#D0D5DD] font-inter text-[14px] bg-white px-2 transition-all">

                <option value="" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">All Status</option>

                <option value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 10 per row</option>

                <option value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 15 per row</option>
              </select>

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
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">Pending</p>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Open</p>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Resolved</p>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Closed</p>
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
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                    Title
                  </th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Messages</th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Target Audience</th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                    <div className="flex items-center gap-[3px]">
                      Created Date
                      <div className="flex flex-col gap-[1px] shrink-0">
                        <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                      </div>
                    </div>
                  </th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white ">
                    Status
                  </th>
                  <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] "></th>
                </tr>
              </thead>

              <tbody className="border-b border-[#D9D4D4] w-full">
                {data.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-gray-900  transition-all border-b duration-500 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal "><div className="flex items-center gap-2">
                      <span className="flex items-center gap-[3px] text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                        {item.id}
                      </span>
                    </div></td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.package}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white ">{item.account}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.amount}</td>
                    <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.customer}</td>
                    <td className="px-3 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal cursor-pointer dark:text-white">
                      <Image src="/icons/delred.svg" alt='delred' width={20} height={20} />
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

      <NewAnnouncement
        packag={announcement}
        onClose={() => setAnnouncement(false)}
       />
    </div>
  )
}

export default Announcements;