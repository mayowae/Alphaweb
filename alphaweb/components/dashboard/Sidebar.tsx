
import React, { useState } from 'react'
import { Sidemenuitems } from './sidebarmenuitems'
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';


interface DashboardHeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const DashBoardSidebar = ({ isOpen, setIsOpen }: DashboardHeaderProps) => {

  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const pathName = usePathname();

  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  return (
   <>
   <div className={`fixed top-0 left-0 h-screen pt-20  transition-transform w-[264px] z-40 bg-[#150E46] text-white shadow-md ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
   <div className="flex flex-col gap-[10px] antialiased h-full overflow-y-auto hide-scrollbar pb-8 px-3">
      {Sidemenuitems.map((items, index) => {
  return (
    <React.Fragment key={index}>
      {items.submenu ? (
        <div className=' flex flex-col cursor-pointer' >
          <div className={`flex items-center h-full py-2 px-4 ${activeSubmenu === index ? "bg-[#0D0264] rounded-md h-[40px]" : ""}`} onClick={() => {
            setMenuOpen(menuOpen === index ? null : index);
           setActiveSubmenu(activeSubmenu === index ? null : index);
       }}>
             <Image src={items.icon} alt={items.title + " icon"} className="mr-2" width={20} height={20} />
            <span className='ml-1 text-[14px] leading-6 '>{items.title}</span>
           {menuOpen === index ?<Image src="/icons/arrowup.png" alt='arrowup' width={12}
            height={12}
             className='ml-auto mr-2'
              /> :   <Image src="/icons/arrowdown.png" alt='arrowdown' width={12}
            height={12}
             className='ml-auto mr-2'
              />}
          </div>

          {menuOpen === index && <div className='flex flex-col h-full py-2 px-1'>
            {items.submenuitems?.map((item, index) =>{
              return (
             <Link key={index} href={item.path} className={`flex items-center  h-full py-2 px-4 ${item.path === pathName ? "bg-[#7A69FC] rounded-md h-[40px]" : ""}`}>
          <Image src={item.icon} alt={item.title + " icon"} className="mr-2" width={12} height={12}/>
          <span className='leading-6 ml-2 text-[14px]'>{item.title}</span>
        </Link>
              )
            })
            }
          </div>}
        </div>
      ) : (
        <Link href={items.path} className={`flex items-center h-full py-2 px-4 ${items.path === pathName ? "bg-[#7A69FC] rounded-md h-[40px]" : ""}`}>
          <Image src={items.icon} alt={items.title + " icon"} className=" mr-2" width={20} height={20} />
          <span className='leading-[24px] ml-1 text-[14px] '>{items.title}</span>
        </Link>
      )}
    </React.Fragment>
  );
})
}
       
     </div>
   </div>
   </>
  )
}

export default DashBoardSidebar