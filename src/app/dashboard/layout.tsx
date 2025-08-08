"use client"
import React, {useState} from 'react';
import DashboardHeader from '../../..//components/dashboard/Header';
import DashBoardSidebar from '../../../components/dashboard/Sidebar';
import DashBoardFooter from '../../../components/dashboard/Footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col h-screen w-full">
      {/* header  */}
      <DashboardHeader setIsOpen={setIsOpen} isOpen={isOpen} />
    

      <div className="flex flex-1 overflow-hidden">
       {/* Sidebar  */}
       <DashBoardSidebar setIsOpen={setIsOpen} isOpen={isOpen} />

       <div className='flex flex-col flex-1 md:ml-[264px] bg-[#EBEBEB]'>
        <main className=" flex-1 overflow-y-auto p-4 pt-0 mt-[80px] antialiased ">
          {children}
        </main>

        <DashBoardFooter />
        </div>

      </div>
    </div>
  );
}
