"use client"
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import MerchantTable from '../../../../../../components/tables/merchants/Merchanttable'
import Addpackage from '../../../../../../components/tables/merchants/modals/Add&EditMerchantModal'


const Page = () => {
  const [packag, setPackag] = useState<boolean>(false)
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  return (
    <div className='w-[100%]'>

      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Merchants</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>View and mange all merchants that  are on your platform.</p>
        </div>

        <div className='flex items-end mt-4 md:mt-0 w-full md:w-auto' onClick={() => {
          setMode("add");
          setSelectedMerchant(null);
          setPackag(true);
        }}>
          <button className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
            <FaPlus className='text-white font-normal w-[12px]' />
            <p className='text-[14px] font-inter text-white font-medium'>Add merchant</p>
          </button>
        </div>

      </div>

      <Addpackage
        packag={packag}
        onClose={() => setPackag(false)}
        mode={mode}
        merchant={selectedMerchant}
      />

      <MerchantTable
        packag={packag}
        setpackage={setPackag}
        setMode={setMode}
        setSelectedMerchant={setSelectedMerchant}
      />

    </div>

  )
}

export default Page;