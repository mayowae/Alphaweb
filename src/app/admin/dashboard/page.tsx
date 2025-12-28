"use client"
import React, { useState } from "react";
import Dashboardcards from "../../../../components/dashboard/cards";
import { FaPlus } from 'react-icons/fa'
import Charts from "../../../../components/dashboard/charts";
import Image from "next/image"
import Addpackage from "../../../../components/tables/merchants/modals/Add&EditMerchantModal";

export default function Home() {

const [packag, setPackag] = useState<boolean>(false)

  return (
    <div className="w-full">

      <div className='flex flex-wrap  justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className="font-inter font-semibold leading-[32px] text-[24px]">Dashboard</h1>
          <p className="font-inter font-medium text-[#717680] text-[14px] leading-[24px]" >Monitor overview of all activities across merchants and platform</p>
        </div>

        <div className='flex items-end md:mt-0 w-full md:w-auto'>
          <button  onClick={() => setPackag(true)} className='bg-[#4E37FB] dark:bg-gray-900 dark:border dark:border-gray-700 flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
            <FaPlus className='text-white font-normal w-[12px]' />
            <p className='text-[14px] font-inter text-white font-medium'>Add merchant</p>
          </button>
        </div>

      </div>

      <div className="">
        {/* dashboard cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 ">
          <Dashboardcards label="Total merchants" count={8} icon="/icons/cardss.svg" />
          <Dashboardcards label="Active merchants" count={8} icon="/icons/cardss.svg" />
          <Dashboardcards label="Inactive merchants" count={8} icon="/icons/cardss.svg" />
          <Dashboardcards label="New merchants (30D)" count={8} icon="/icons/cardss.svg" />
        </div>

        <Charts />

        {/* recent activities */}
        <div className="mt-5 bg-white mb-7 dark:bg-gray-900 dark:text-white">

          <div className="flex justify-between p-5">
            <h1 className="font-inter font-semibold leading-[24px] text-[18px]">Recent activities</h1>
            <p className="font-inter font-semibold text-[14px] leading-[24px] text-[#4E37FB] dark:text-white">View all</p>
          </div>

          {/* desktop table stacked row */}
          <div className='overflow-auto w-full '>
            <table className="table-auto w-full whitespace-nowrap dark:border dark:border-gray-700 ">
              <thead className="bg-gray-50 border-b border-[#D9D4D4] dark:bg-gray-900 ">
                <tr className="h-[40px] text-left leading-[18px] text-[12px] font-lato font-normal text-[#141414] dark:text-white">
                  <th className="px-5 py-2 ">
                    Date & Time
                  </th>
                  <th className="px-5 py-2">User</th>
                  <th className="px-5 py-2 ">Action</th>
                  <th className="px-5 py-2 ">
                    <div className="flex items-center gap-[3px]">
                    Details
                    <div className='flex flex-col gap-[1px]'>
                      <Image src="/icons/uparr.svg" alt="uparrow" width={7} height={7} className="shrink-0" />
                      <Image src="/icons/downarr.svg" alt="uparrow" width={7} height={7} className="shrink-0" />
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
  
      </div>
      </div>

       <Addpackage
      packag={packag}
      onClose={() => setPackag(false)}
      mode="add"
      merchant={null}
      />

    </div>
  );
}
