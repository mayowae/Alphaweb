"use client"
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import StaffTable from '../../../../../../components/tables/Staff/Stafftable'
import RolesTable from '../../../../../../components/tables/Staff/Rolestable'
import Addpackage from '../../../../../../components/tables/Staff/modals/Add&EditstaffModal';
import Addroles from '../../../../../../components/tables/Staff/modals/Add&EditroleModal'


const Page = () => {

  const [packag, setPackag] = useState<boolean>(false)
  const [addeditrole, setAddEditRole] = useState<boolean>(false)
  //const [mode, setMode] = useState<"add" | "edit">("add");
  //const [selectedMerchant, setSelectedMerchant] = useState(null);

  const [activeTab, setActiveTab] = useState("staffs");

  return (
    <div>
      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Staff management</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>Manage and monitor all platform staff.</p>
        </div>

        <div className='flex items-end mt-4 md:mt-0 w-full md:w-auto' >
          {activeTab === "staffs" ? (<button onClick={() => setPackag(true)} className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
            <FaPlus className='text-white font-normal w-[12px]' />
            <p className='text-[14px] font-inter text-white font-medium'>Create Staff</p>
          </button>) :
            (<button onClick={() => setAddEditRole(true)} className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
              <FaPlus className='text-white font-normal w-[12px]' />
              <p className='text-[14px] font-inter text-white font-medium'>Create Role</p>
            </button>)}
        </div>

      </div>

      <div className='bg-white shadow-lg mt-6 mb-2'>
       <div className="flex items-center flex-nowrap pt-5 border-b border-gray-300 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {[
            { id: "staffs", label: "Staff Members" },
            { id: "roles", label: "Roles" },
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

        <div className="overflow-x-auto mt-2">
          {activeTab === "staffs" && <StaffTable />}
          {activeTab === "roles" && <RolesTable />}
        </div>
      </div>


      <Addpackage
        packag={packag}
        onClose={() => setPackag(false)}
        mode="add"
        merchant={null}
      />


      <Addroles
        packag={addeditrole}
        onClose={() => setAddEditRole(false)}
        mode="add"
        merchant={null}
      />
    </div>
  )
}

export default Page