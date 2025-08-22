"use client"
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { FaAngleDown } from 'react-icons/fa';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"
import Addpackage from './Addpackage';
import Editpackage from './Editpackage';

const Page = () => {


  const [show, setShow] = useState<boolean>(false)

  const [packag, setPackag] = useState<boolean>(false)

  const [edit, setEdit] = useState(false)

  {/*const [rowsPerPage, setRowsPerPage] = useState('10');
  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(value);
    console.log('Rows per page changed:', value);
  };*/}

  return (
    <div className='w-[100%]'>
      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Collection packages</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>Create and manage collection packages.</p>
        </div>

        <div className='flex items-end mt-4 md:mt-0 w-full md:w-auto' onClick={() => setPackag(true)}>
          <button className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
            <FaPlus className='text-white font-normal w-[12px]' />
            <p className='text-[14px] font-inter text-white font-medium'>Create package</p>
          </button>
        </div>

      </div>

      {packag && <Addpackage packag={packag} onClose={() => setPackag(false)} />}
      {edit && <Editpackage edit={edit} onClose={() => setEdit(false)} />}

      <div className='bg-white shadow-sm mt-[25px] w-full relative'>

        <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px] '>

          <Select >
            <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full md:w-[185px] border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
              <SelectValue placeholder="Show 10 per row" />
            </SelectTrigger>
            <SelectContent className="w-[185px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
              <SelectGroup>
                <SelectItem value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]  ">Show 10 per row</SelectItem>
                <SelectItem value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">Show 15 per row</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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

            {/* <Select >
        <SelectTrigger className="bg-[#FAF9FF] h-[40px] text-[#4E37FB] font-semibold text-[14px] outline-none border-none  cursor-pointer w-[105px]  rounded-[4px]">
          <SelectValue placeholder="Export"/>
        </SelectTrigger>
        <SelectContent className="w-[105px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
          <SelectGroup>
            <SelectItem value="10"  className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]  ">PDF</SelectItem>
            <SelectItem value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">CSV</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>*/}

            <div className="flex items-center h-[40px] lg:w-[311px] gap-[4px] border border-[#E5E7EB] rounded-[4px] px-3">
              <Image src="/icons/search.png" alt="dashboard" width={20} height={20} className="cursor-pointer" />

              <input
                type="text"
                placeholder="Search"
                className="  outline-none px-3 py-2 w-full text-sm"
              />
            </div>

          </div>
        </div>

         <div className='overflow-auto w-full'>
          <table className="table-auto w-full whitespace-nowrap hidden md:table">
            <thead className="bg-gray-50 border-b border-[#D9D4D4]">
              <tr className="h-[40px] text-left">
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">
                  <div className="flex items-center gap-[2px]">
                    ID
                    <div className='flex flex-col gap-[1px]'>
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                      <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    </div>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">Name</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">Type</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">Seed amount/Percentage</th>
                <th className="px-1 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">Seed type</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">Period</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]">Collection days</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]"></th>
              </tr>
            </thead>

            <tbody className='border-b border-[#D9D4D4] w-full'>
              <tr className="bg-white transition-all duration-500 hover:bg-gray-50">
                <td className="px-5 py-4 hidden text-gray-600 text-[14px] leading-[20px] font-lato font-normal md:table-cell">PKG01A34</td>
                <td className="px-5 py-4 hidden text-gray-600 text-[14px] leading-[20px] font-lato font-normal md:table-cell">Alpha 500</td>
                <td className="px-5 py-4 hidden text-gray-600 text-[14px] leading-[20px] font-lato font-normal md:table-cell">Fixed</td>
                <td className="px-5 py-4 hidden text-gray-600 text-[14px] leading-[20px] font-lato font-normal md:table-cell">5000</td>
                <td className="px-1 py-4 hidden text-gray-600 text-[14px] leading-[20px] font-lato font-normal md:table-cell">First saving</td>
                <td className="px-5 py-4 hidden text-gray-600 text-[14px] leading-[20px] font-lato font-normal md:table-cell">360</td>
                <td className="px-5 py-4 hidden text-gray-600 text-[14px] leading-[20px] font-lato font-normal md:table-cell">Daily</td>
                <td className="px-3 py-4 hidden text-gray-600 text-[14px] leading-[20px] font-lato font-normal md:table-cell cursor-pointer"><Image src="/icons/edit1.svg" alt="edit" onClick={() => setEdit(true)} width={17} height={17} /></td>
              </tr>
            </tbody>
          </table>

          {/* Mobile stacked row */}
          <div className="md:hidden block border-b p-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm text-gray-600"><span>ID:</span><span className="font-semibold">PKG01A34</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Name:</span><span className="font-semibold">Alpha 500</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Type:</span><span className="font-semibold">Fixed</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Seed amount/Percentage:</span><span className="font-semibold">5000</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Seed type:</span><span className="font-semibold">First saving</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Period:</span><span className="font-semibold">360</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Collection days:</span><span className="font-semibold">Daily</span></div>
              <div className="flex justify-end cursor-pointer"><Image src="/icons/edit1.svg" alt="edit" width={17} height={17} onClick={() => setEdit(true)} /></div>
            </div>
          </div>
        </div>
      
      <div className='border-t-[1px] w-full mt-[20px]'></div>

      <div className="flex flex-wrap flex-col md:flex-row pb-4 justify-between items-center gap-2 mt-4 px-2 md:px-5">
        {/* Prev Button */}
        <button
          className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center mb-2 md:mb-0 hover:bg-gray-50 transition-colors"
        >
          <Image src="/icons/left.svg" alt="Prev" width={10} height={10} className="mr-1" />
          Previous
        </button>
        {/* Page Numbers */}
        <div className="flex gap-2 items-center justify-center">
          <p>1234</p>
        </div>
        {/* Next Button */}
        <button
          className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center hover:bg-gray-50 transition-colors"
        >
          Next
          <Image src="/icons/right.svg" alt="Next" width={10} height={10} className="ml-1" />
        </button>
      </div>
      </div>

    </div>
  );
}

export default Page