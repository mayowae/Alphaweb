"use client"
import React from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa'


interface pack{
    packag:boolean,
    onClose:() => void;
}

const Addpackage = ({packag, onClose}: pack) => {

  return (
    <div className='fixed inset-0 z-50 flex  items-center justify-center bg-black/20'>
        <div className="bg-white lg:w-[532px] hide-scrollbar w-[70%] max-h-screen absolute top-0  right-0  shadow-lg  overflow-y-auto">
            <div className="flex p-4 items-center justify-between">
            <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Create package</h1>
            <Image src="/icons/close.svg" alt="dashboard" width={14} height={14} className="cursor-pointer" onClick={onClose} />
            </div>
            <div className='border-t-[1px] w-full mb-1'></div>
            <div className="p-4 w-full">
                <div className="mb-4">
                <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Name</p>
                <input type="text" placeholder='Alpha1k' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' />
               </div>

                <div className="mb-4">
                <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Type</p>
                 <div className='relative w-full'>
                <select className='w-full appearance-none h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px]'>
                    <option value="Flexible">Flexible</option>
                    <option value="Fixed">Fixed</option>
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  <FaAngleDown className="w-[16px] h-[16px] text-[#8E8E93]" />
                </div>
                </div>
               </div>


                <div className="mb-4">
                <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Seed type</p>
                 <div className='relative w-full'>
                <select className='w-full appearance-none h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px]'>
                    <option value="Percentage">Percentage</option>
                    <option value="First Saving">First Saving</option>
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  <FaAngleDown className="w-[16px] h-[16px] text-[#8E8E93]" />
                </div>
                </div>
               </div>


                <div className="mb-4">
                <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Seed amount/percentage</p>
                <input type="text" placeholder='10%' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' />
               </div>


                <div className="mb-4">
                <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Period (days)</p>
                <input type="text" placeholder='4' className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px]' />
               </div>


                <div className="mb-2">
                <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Collection days</p>
                 <div className='relative w-full'>
                 <select className='w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px] appearance-none '>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  <FaAngleDown className="w-[16px] h-[16px] text-[#8E8E93]" />
                </div>
                </div>
               </div>
               </div>

               <div className='border-t-[1px] w-full mb-1  mt-5'></div>

                 <div className='mt-[15px] flex justify-center mb-8'>
                 <button className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
                <p className='text-[14px] font-inter text-white font-medium'>Create package</p>
                </button>
                </div>
        </div>
    </div>
  )
}

export default Addpackage