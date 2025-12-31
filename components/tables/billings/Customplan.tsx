"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa';
import Pagination from '../../admin/pagination';
import AddCustom from './modals/Add&EditcustomModal';
import { MerchantData } from '../../../interface/type';

// Mock API Data
const mockApiData: MerchantData[] = [
  { id: 'COL-103-A45', package: 'Alpha 1K', no_of_agents: '10', no_of_customers: '20', amount: 'N1,000', customer: 'James Odunayo', method: "wallet", status: 'active', created: '23 Jan, 2025' },
  { id: 'COL-203-B12', package: 'Alpha 2K', no_of_agents: '20', no_of_customers: '40', amount: 'N2,000', customer: 'Jane Doe', method: "wallet", status: 'active', created: '23 Jan, 2025' },
  { id: 'COL-303-C78', package: 'Beta 5K', no_of_agents: '50', no_of_customers: '100', amount: 'N5,000', customer: 'Sarah Williams Tech Ltd', method: "bank", status: 'active', created: '22 Jan, 2025' },
  { id: 'COL-403-D34', package: 'Gamma 10K', no_of_agents: '100', no_of_customers: '200', amount: 'N10,000', customer: 'Michael Brown Enterprises', method: "wallet", status: 'inactive', created: '21 Jan, 2025' },
  { id: 'COL-503-E90', package: 'Delta 20K', no_of_agents:'200' , no_of_customers:'400' , amount:'N20,000' , customer:'Emma Davis Solutions' , method:"bank" , status:'active' , created:'20 Jan, 2025' },
  { id: 'COL-603-F56', package: 'Epsilon 50K', no_of_agents:'5' , no_of_customers:'15' , amount:'N5,789.99' , customer:'John Smith Industries' , method:"wallet" , status:'active' , created:'19 Jan, 2025' },
];

// Mock API Functions
const mockApi = {
  fetchData: (page: number, perPage: number, searchQuery: string): Promise<{ data: MerchantData[], total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredData = [...mockApiData];

        // Filter by search query
        if (searchQuery) {
          filteredData = filteredData.filter(item =>
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.amount?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Pagination
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        resolve({
          data: paginatedData,
          total: filteredData.length
        });
      }, 300); // Simulate network delay
    });
  },

  deleteItem: (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockApiData.findIndex(item => item.id === id);
        if (index > -1) {
          mockApiData.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  }
};

interface CustomplanProps {
  onEdit?: (merchant: MerchantData) => void;
  refreshTrigger?: number;
}

const Customplan = ({ onEdit, refreshTrigger }: CustomplanProps) => {

  const [show, setShow] = useState<boolean>(false)
  const [packag, setPackag] = useState<boolean>(false)
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantData | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);


  const [data, setData] = useState<MerchantData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalItems, setTotalItems] = useState<number>(0);

  
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await mockApi.fetchData(currentPage, perPage, searchQuery);
      setData(result.data);
      setTotalItems(result.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [currentPage, perPage, searchQuery, refreshTrigger]);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const editClick = (menu: MerchantData) => {
    if (onEdit) {
      onEdit(menu);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const success = await mockApi.deleteItem(id);
      if (success) {
        fetchData(); // Refresh data after deletion
        setOpenDropdownId(null);
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing per page
  };

  const totalPages = Math.ceil(totalItems / perPage);

  return (
    <div>
      <div className='bg-white dark:bg-gray-900 dark:text-white  shadow-sm w-full relative'>

        <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px] '>

          <div className='flex flex-wrap items-center gap-[10px] md:gap-[20px] w-full md:w-auto'>

            <div className='w-[100%]  md:w-[185px] '>
              <select
                className="h-[40px] w-full outline-none leading-[24px] rounded-[4px] border border-[#D0D5DD] font-inter text-[14px] bg-white px-2 transition-all"
                value={perPage}
                onChange={handlePerPageChange}
              >
                <option value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 10 per row</option>
                <option value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">Show 15 per row</option>
              </select>
            </div>

          </div>

          <div className='flex flex-wrap gap-[10px] md:gap-[20px] w-full md:w-auto'>

            <div className='relative w-full md:w-auto'>
              <button onClick={() => setShow(!show)} className='bg-[#FAF9FF] h-[40px] cursor-pointer w-[105px] flex items-center justify-center gap-[7px] rounded-[4px]'>
                <p className='text-[#4E37FB] font-medium text-[14px]'>Export</p>
                <FaAngleDown className="w-[16px] h-[16px] text-[#4E37FB] my-[auto] " />
              </button>

              {show && <div onClick={() => setShow(!show)} className='absolute w-[90vw] max-w-[150px] min-w-[90px] md:w-[105px] bg-white rounded-[4px] shadow-lg z-10'>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">PDF</p>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">CSV</p>
              </div>}
            </div>

            <div className="flex items-center h-[40px] w-full md:w-[311px] gap-[4px] border border-[#E5E7EB] rounded-[4px] px-3">
              <Image src="/icons/search.png" alt="dashboard" width={20} height={20} className="cursor-pointer" />

              <input
                type="text"
                placeholder="Search"
                className="outline-none px-3 py-2 w-full text-sm"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/*table*/}
        <div className='overflow-x-auto '>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-gray-500">No data found</p>
            </div>
          ) : (
            <div className='overflow-auto w-full '>
              <table className="table-auto w-full whitespace-nowrap dark:border dark:border-gray-700 ">
                <thead className="bg-gray-50 border-b border-[#D9D4D4] dark:bg-gray-900 ">
                  <tr className="h-[40px] text-left leading-[18px] text-[12px] font-lato font-normal text-[#141414] dark:text-white">
                    <th className="px-5 py-2 ">
                      <div className="flex items-center gap-[3px]">
                        Organization name
                        <div className='flex flex-col gap-[1px]'>
                          <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        </div>
                      </div>
                    </th>
                    <th className="px-5 py-2">Plan name</th>
                    <th className="px-5 py-2">Features</th>
                    <th className="px-5 py-2">Pricing (Month/Year)</th>
                    <th className="px-5 py-2 ">
                      <div className="flex items-center gap-[3px]">
                        Start date
                        <div className='flex flex-col gap-[1px]'>
                          <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        </div>
                      </div>
                    </th>
                    <th className="px-5 py-2 ">
                      <div className="flex items-center gap-[3px]">
                        Date created
                        <div className='flex flex-col gap-[1px]'>
                          <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        </div>
                      </div>
                    </th>
                    <th className="px-5 py-2 "></th>
                    <th className="px-5 py-2 "></th>
                  </tr>
                </thead>

                <tbody className=' w-full bg-white dark:bg-gray-900'>
                  {data.map((item) => (
                    <tr key={item.id} className=" text-[14px] text-gray-600 dark:text-white transition-all duration-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-[#D9D4D4] dark:border dark:border-gray-700 font-lato font-normal leading-[20px]">
                      <td className="px-5 py-4 whitespace-normal break-words ">{item.id}</td>
                      <td className="px-5 py-4  ">{item.amount}</td>
                      <td className="px-5 py-4 whitespace-normal">
                        <p className='whitespace-normal break-words'>{item.customer}</p>
                      </td>
                      <td className="px-5 py-4 ">{item.amount}</td>
                      <td className="px-5 py-4 ">{item.created}</td>
                      <td className="px-5 py-4">
                        {item.created}
                      </td>
                      <td className="relative px-3 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal cursor-pointer ">
                        <Image src="/icons/lucide_edit.svg" alt="dots" width={20} height={20} onClick={() => editClick(item)} />
                      </td>
                      <td className="relative px-3 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal cursor-pointer ">
                        <Image src="/icons/dots.svg" alt="dots" width={20} height={20} onClick={() => toggleDropdown(item.id)} />

                        {openDropdownId === item.id && (
                          <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-md z-50">
                            <p
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className='border-t-[1px] w-full mt-[20px]'></div>


          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={perPage}

          />


        </div>

      </div>

    </div>
  )
}

export default Customplan