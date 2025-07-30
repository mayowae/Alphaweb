"use client"
import { useState } from "react";
import { HiBars3BottomRight, HiSun } from "react-icons/hi2";
import  {FaTimes} from "react-icons/fa";
import Image from "next/image";

interface DashboardHeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const DashboardHeader = ({ isOpen, setIsOpen}: DashboardHeaderProps) => {


    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
    // Function to toggle the menu state
    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };


  return (
    <>
        <div className="fixed top-0 h-[56px] left-0 right-0  z-50 bg-white shadow-md flex items-center justify-between p-4">

            {/* Logo and Menu Toggle Button */}

        <div className="flex items-center gap-[10px] ">
        <div className="md:hidden cursor-pointer">
      {isOpen ? (
        <FaTimes className='text-[20px] text-gray-500 ' onClick={toggleMenu} />
      ) : (
        <HiBars3BottomRight className='text-[20px] ' onClick={toggleMenu} />
      )}
      </div>

      <div className="">
        <h1 className="">LOGO</h1>   
      </div>

      </div>

            {/* Search Bar */}

        <div className="flex items-center h-[40px] lg:w-[311px] gap-[4px] border border-[#E5E7EB] rounded-lg px-3">
           <Image src="/icons/search.png" alt="dashboard" width={20} height={20} className="cursor-pointer" />

          <input
            type="text"
            placeholder="Search"
            className="  outline-none px-3 py-2 w-full"
          />
        </div>

        {/* Theme and Notification Icons */}

      <div className="flex items-center gap-[10px] justify-center">
        <div className="bg-[#FAF9FF] p-2">
        {isDarkMode ? (
          <Image
            src="/icons/theme.png"
            alt="theme"
            width={18}
            height={18}
            className="cursor-pointer "
            onClick={() => setIsDarkMode(!isDarkMode)}
          />
        ) : (
          <HiSun className='text-[20px]'   onClick={() => setIsDarkMode(!isDarkMode)} />
        )}
        </div>
       
         <div className="relative w-8 h-8 flex bg-[#FAF9FF] p-2 items-center justify-center cursor-pointer">
         <Image
          src="/icons/notification.png"
          width={18} 
         height={18} 
          alt="notification"
         />
         <span className="absolute top-0 right-0 bg-red-500 text-white text-xs max-sm:text-[11px] rounded-full w-4 h-4 flex items-center justify-center">
          <p>{1}</p>
         </span>
         </div>


          <div className={`p-2 rounded-full bg-[#FAF9FF] text-[#4E37FB] cursor-pointer flex items-center justify-center text-purple text-sm font-bold `}>
            OR
         </div>

      </div>


      </div>
    </>
  )
}

export default DashboardHeader;