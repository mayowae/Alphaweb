import React from 'react'
import TransactionTable from '../../../../../../components/tables/transactions/Transactiontable';

const Page = () => {
  return (
       <div className='w-[100%]'>
       <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
              <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
                <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Transactions</h1>
                <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>View and mange all happening all through the platform.</p>
              </div>
            </div>

            <TransactionTable />
    </div>
  )
}

export default Page