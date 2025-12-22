import React from 'react'
import Image from 'next/image';

const Pagination = () => {
  return (
    <div>
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
  )
}

export default Pagination;