"use client"
import React from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa'


interface pack {
  edit: boolean,
  onClose: () => void;
}

const Editpackage = ({ edit, onClose }: pack) => {

  return (
    <>
     {/* Overlay backdrop */}
      {edit&&  (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/20  z-50 "
        />
      )}

      <div  className={`fixed top-0 right-0 h-screen w-full max-w-full sm:w-[532px] bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out z-50
          flex flex-col ${edit ? 'translate-x-0' : 'translate-x-full'}`}>

       
  
          <div className="flex p-4 items-center justify-between">
            <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Edit investment package</h1>
            <Image src="/icons/close.svg" alt="dashboard" width={14} height={14} className="cursor-pointer" onClick={onClose} />
          </div>
          <div className='border-t-[1px] w-full mb-1'></div>
   
        <div className="p-4 w-full overflow-y-auto hide-scrollbar">
          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Name</p>
            <input type="text" placeholder='Alpha1k' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' />
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Type</p>
            <div className='relative w-full'>
              <select className='w-full appearance-none h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px]'>
                <option value="Flexible">Flexible deposit</option>
                <option value="Fixed">Fixed deposit</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                <FaAngleDown className="w-[16px] h-[16px] text-[#8E8E93]" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Target amount</p>
            <input type="number" placeholder='0.00' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' />
          </div>


          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Investment period (days)</p>
            <input type="number" placeholder='4' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' />
          </div>


          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Percentage interest</p>
            <input type="text" placeholder='20%' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' />
          </div>


          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Extra charges</p>
            <input type="text" placeholder='0.00' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px]' />
          </div>


          <div className="mb-2">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Default penalty (per day)</p>
            <input type="text" placeholder='2' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px]' />
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Default no. of days</p>
            <input type="text" placeholder='0.00' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px]' />
          </div>
        </div>

        <div className='border-t-[1px] w-full mb-1  mt-5'></div>

        <div className='mt-[15px] flex justify-center mb-8'>
          <button className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
            <p className='text-[14px] font-inter text-white font-medium'>Edit package</p>
          </button>
        </div>
      </div>
    </>
  )
}

export default Editpackage