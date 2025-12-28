"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Addpackage from '../../../../../../../components/tables/merchants/modals/Add&EditMerchantModal'
import ChangestatusModal from '../../../../../../../components/tables/merchants/modals/Changestatusmodal'
import { data } from "../../../../utilis/sidebarmenuitems";
import Transactions from '../../../../../../../components/tables/merchants/merchantdetailstabs/Transactions'
import Subscriptions_Billings from '../../../../../../../components/tables/merchants/merchantdetailstabs/Subscriptions&Billings'
import Logs_Audits from '../../../../../../../components/tables/merchants/merchantdetailstabs/Logs&Audits'


const MerchantDetails = ({ paramid }: { paramid: string }) => {

  const [modalopen, setModalopen] = useState(false)

  const [packag, setPackag] = useState<boolean>(false)

  const [activeTab, setActiveTab] = useState("Transactions");

  return (
    <div className='relative '>

      <div className='absolute inset-x-0 top-0 box-border max-w-screen flex items-center py-3 gap-2 px-5 bg-white -mt-[34px] -mx-4 md:-mx-5 border-b-[1px]'>
        <p>Merchants</p>
        <p className=''><Image src={"/icons/ChevronRightMed.svg"} alt="right" width={6} height={6} /></p>
        <p className='text-[#93979F] text-[12px]'>{paramid}</p>
      </div>


      <div className='pt-8'>

        <div className='flex items-center justify-between max-md:flex-col max-md:flex-wrap  max-md:items-start gap-1'>

          <div className=''>
            <h1 className='font-inter font-semibold text-[20px] leading-[32px] max-sm:text-[12px]'> {paramid}</h1>
          </div>

          <div className='flex items-center gap-4 mt-2 max-md:flex-wrap'>
            <button onClick={() => setPackag(true)} className='bg-[#E9E6FF] p-3 flex items-center gap-2'>
              <p className='font-inter font-semibold text-[14px] leading-[20px] text-[#4E37FB] max-sm:text-[12px]'>Edit details</p>
            </button>

            <button onClick={() => setModalopen(true)} className='bg-[#E9E6FF] p-3 flex items-center gap-2'>
              <p className='font-inter font-semibold text-[14px] leading-[20px] text-[#4E37FB] max-sm:text-[12px]'>Change status</p>
            </button>

            <div className=''>
              <Image src={"/icons/dots.svg"} alt="dot" width={24} height={24} />
            </div>
          </div>
        </div>


        <div className="bg-white shadow-lg mt-4">

          <div className='grid grid-cols-3 flex gap-4 px-5 py-8 max-sm:grid-cols-1'>
            {data.map((map) => (
              <div key={map.id} className=''>
                <p className='text-[#93979F] text-[12px] font-inter '>{map.title}</p>
                <h1 className='font-inter text-[13px] leading-[24px] max-sm:text-[12px]'>{map.desc}</h1>
              </div>

            ))}
          </div>

          {/*<div  className=''>
                <p className='text-[#93979F] text-[12px] font-inter '>Organization_ID</p>
                <h1 className='font-inter text-[16px] leading-[24px]'>MRCH-1023ASDTIYUPIUYHSTYUHFG</h1>
              </div>*/}

        </div>

        <div className='bg-white shadow-lg mt-4 mb-2'>

        <div className="flex items-center flex-nowrap pt-5 border-b border-gray-300 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {[
            { id: "Transactions", label: "Transactions" },
            { id: "Subscription & billings", label: "Subscription & billings" },
            { id: "Logs & Audit Trail", label: "Logs & Audit Trail" },
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
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-10/12 transition-all ${activeTab === tab.id ? "bg-[#4E37FB] h-[3px]" : "" }
                  `}
              />
            </button>
          ))}
        </div>

        <div className="overflow-x-auto mt-2">
          {activeTab === "Transactions" && <Transactions />}
          {activeTab === "Subscription & billings" && <Subscriptions_Billings />}
          {activeTab === "Logs & Audit Trail" && <Logs_Audits />}
        </div>

        </div>
      </div>

      <Addpackage
        packag={packag}
        onClose={() => setPackag(false)}
        mode="edit"
        merchant={null}
      />

      {modalopen && (
        <ChangestatusModal
          modalopen={modalopen}
          onClose={() => setModalopen(false)}
          user={null}
          bulk={null}
        //bulker={null}
        />
      )}
    </div>
  )
}

export default MerchantDetails;