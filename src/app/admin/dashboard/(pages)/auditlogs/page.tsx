
import React from 'react'
import Audittable from '../../../../../../components/tables/auditslogs/Audittable';



const Page = () => {


  return (

    <div>

      <div className=''>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Audit log</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>Manages all actions of all admin users on the platform.</p>
        </div>
      </div>

      <Audittable />


    </div>
  )
}

export default Page;