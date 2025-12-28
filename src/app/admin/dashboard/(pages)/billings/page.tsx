"use client"
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import Standardplan from '../../../../../../components/tables/billings/Standardplan';
import Billings from '../../../../../../components/tables/billings/Billings';
import Customplan from '../../../../../../components/tables/billings/Customplan';
import AddCustom from '../../../../../../components/tables/billings/modals/Add&EditcustomModal';
import AddStandard from '../../../../../../components/tables/billings/modals/Add&EditstandardModal';

const Page = () => {

  const [activeTab, setActiveTab] = useState("standard");
  const [packag, setPackag] = useState<boolean>(false)
  const [Addstandard, setAddstandard] = useState<boolean>(false)


  return (
    <div>
      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Plans & Billings</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>Manage and monitor all plans and billings for merchants.</p>
        </div>

        <div className='flex items-end mt-4 md:mt-0 w-full md:w-auto' >
          {activeTab === "standard" && <button onClick={() => setAddstandard(true)} className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
            <FaPlus className='text-white font-normal w-[12px]' />
            <p className='text-[14px] font-inter text-white font-medium'>Create Plan</p>
          </button>}

          {activeTab === "custom" && <button onClick={() => setPackag(true)}  className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
            <FaPlus className='text-white font-normal w-[12px]' />
            <p className='text-[14px] font-inter text-white font-medium'>Create Plan</p>
          </button>}

        </div>

      </div>


      <div className='bg-white shadow-lg mt-6 mb-2'>
       <div className="flex items-center flex-nowrap pt-5 border-b border-gray-300 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {[
            { id: "standard", label: "Standard plans" },
            { id: "custom", label: "Custom plans" },
            { id: "billings", label: "Billings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 relative font-inter px-6 pb-2 text-sm sm:text-base transition-all ${activeTab === tab.id
                ? "font-semibold text-[#1E1E1E] text-base"
                : "font-normal text-[#9E9E9E] text-base"
                }`}
            >
              {tab.label}
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-10/12 transition-all ${activeTab === tab.id ? "bg-[#4E37FB] h-[3px]" : ""
                  }`}
              />
            </button>
          ))}
        </div>

        <div className="overflow-x-auto ">
          {activeTab === "standard" && <Standardplan />}
          {activeTab === "custom" && <Customplan />}
          {activeTab === "billings" && <Billings />}
        </div>
      </div>

    
      <AddStandard
        packag={Addstandard}
        onClose={() => setAddstandard(false)}
        mode="add"
        merchant={null}
      />


       <AddCustom
        packag={packag}
        onClose={() => setPackag(false)}
        mode="add"
        merchant={null}
      />
    </div>
  )
}

export default Page;