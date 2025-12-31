"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa';
import { MerchantData } from '../../../interface/type';
import Pagination from '../../admin/pagination';
import Addpackage from '../Staff/modals/Add&EditstaffModal';

// Extended MerchantData type to include billing cycle
interface ExtendedMerchantData extends MerchantData {
  billingCycle?: string;
}

// Mock API Data
const mockApiData: ExtendedMerchantData[] = [
  { id: 'INV-103-A45', package: 'Alpha 1K', no_of_agents: '10', no_of_customers: '20', amount: 'N1,000', customer: 'James Odunayo', method: "wallet", status: 'paid', created: '23 Jan, 2025', billingCycle: 'monthly' },
  { id: 'INV-203-B12', package: 'Alpha 2K', no_of_agents: '20', no_of_customers: '40',  amount: 'N2,000', customer: 'Jane Doe', method: "bank", status: 'paid', created: '23 Jan, 2025', billingCycle: 'yearly' },
  { id: 'INV-303-C78', package: 'Beta 5K', no_of_agents: '50', no_of_customers: '100',  amount: 'N5,000', customer: 'Sarah Williams', method: "wallet", status: 'failed', created: '22 Jan, 2025', billingCycle: 'monthly' },
  { id: 'INV-403-D34', package: 'Gamma 10K', no_of_agents: '100', no_of_customers: '200',  amount: 'N10,000', customer: 'Michael Brown', method: "bank", status: 'paid', created: '21 Jan, 2025', billingCycle: 'yearly' },
  { id: 'INV-503-E90', package: 'Delta 20K', no_of_agents:'200' , no_of_customers:'400' ,  amount:'N20,000' , customer:'Emma Davis' , method:"wallet" , status:'paid' , created:'20 Jan, 2025' , billingCycle:'monthly'},
  { id:'INV-603-F56' , package:'Epsilon 5K' , no_of_agents:'189' , no_of_customers:'389' ,  amount:'N5,898.88' , customer:'John Smith' , method:"bank" , status:'failed' , created:'19 Jan, 2025' , billingCycle:'yearly'},
  { id: 'INV-703-G12', package: 'Starter Plan', no_of_agents: '5', no_of_customers: '10', amount: 'N3,000', customer: 'Alice Johnson', method: "wallet", status: 'paid', created: '18 Jan, 2025', billingCycle: 'monthly' },
  { id: 'INV-803-H34', package: 'Pro Plan', no_of_agents: '100', no_of_customers: '200', amount: 'N15,000', customer: 'Robert Lee', method: "bank", status: 'paid', created: '17 Jan, 2025', billingCycle: 'yearly' },
];

interface FilterState {
  merchant: string;
  plans: string[];
  billingCycles: string[];
  paymentMethods: string[];
  statuses: string[];
}

// Mock API Functions
const mockApi = {
  fetchData: (
    page: number, 
    perPage: number, 
    searchQuery: string, 
    filters: FilterState
  ): Promise<{ data: ExtendedMerchantData[], total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredData = [...mockApiData];

        // Filter by search query
        if (searchQuery) {
          filteredData = filteredData.filter(item =>
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.amount?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.status.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply filters
        if (filters.merchant) {
          filteredData = filteredData.filter(item => 
            item.customer.toLowerCase().includes(filters.merchant.toLowerCase())
          );
        }

        if (filters.plans.length > 0) {
          filteredData = filteredData.filter(item =>
            filters.plans.some(plan => item.package.toLowerCase().includes(plan.toLowerCase()))
          );
        }

        if (filters.billingCycles.length > 0) {
          filteredData = filteredData.filter(item =>
            item.billingCycle && filters.billingCycles.includes(item.billingCycle.toLowerCase())
          );
        }

        if (filters.paymentMethods.length > 0) {
          filteredData = filteredData.filter(item =>
            filters.paymentMethods.includes(item.method.toLowerCase())
          );
        }

        if (filters.statuses.length > 0) {
          filteredData = filteredData.filter(item =>
            filters.statuses.includes(item.status.toLowerCase())
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
  }
};

const Billings = () => {
  const [show, setShow] = useState<boolean>(false)
  const [filter, setFilter] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [data, setData] = useState<ExtendedMerchantData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalItems, setTotalItems] = useState<number>(0);

  
  const [filters, setFilters] = useState<FilterState>({
    merchant: '',
    plans: [],
    billingCycles: [],
    paymentMethods: [],
    statuses: []
  });

  const [tempFilters, setTempFilters] = useState<FilterState>({
    merchant: '',
    plans: [],
    billingCycles: [],
    paymentMethods: [],
    statuses: []
  });


  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await mockApi.fetchData(currentPage, perPage, searchQuery, filters);
      setData(result.data);
      setTotalItems(result.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [currentPage, perPage, searchQuery, filters]);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const handleCheckboxChange = (filterType: keyof FilterState, value: string) => {
    setTempFilters(prev => {
      const currentArray = prev[filterType] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [filterType]: newArray
      };
    });
  };

  const handleMerchantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempFilters(prev => ({
      ...prev,
      merchant: e.target.value
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
    setFilter(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      merchant: '',
      plans: [],
      billingCycles: [],
      paymentMethods: [],
      statuses: []
    };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / perPage);

  return (
    <div>
      <div className='bg-white dark:bg-gray-900 dark:text-white shadow-sm w-full relative'>

        <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px] '>

          <div className='flex flex-wrap items-center gap-[10px] md:gap-[20px] w-full md:w-auto'>

            <div className='relative w-full md:w-auto'>
              <button onClick={() => setFilter(!filter)} className='h-[40px] outline-none leading-[24px] rounded-[4px] w-[90px] border border-[#D0D5DD] flex items-center justify-center gap-[9px] font-inter text-[14px] bg-white  transition-all'>
                <Image src="/icons/filters.svg" alt="filter" width={16} height={16} className="" />
                <p className='font-medium text-[14px]'>Filter</p>
              </button>

              {filter &&
                <div className='fixed inset-0 z-50 flex  items-center justify-center bg-black/20'>

                  <div className='lg:w-[500px] sm:w-[400px] w-[90%]  max-h-[90vh]  overflow-y-auto absolute  bg-white  flex flex-col gap-[20px] p-[15px]'>

                    <div className="flex  items-center justify-between max-md:flex-col max-md:gap-[5px] ">
                      <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Choose your filters</h1>
                      <button onClick={clearFilters} className='text-[14px] text-[#4E37FB] font-inter font-semibold'>Clear filters</button>
                    </div>

                    <div className='border-t-[1px] w-full -p-[0px]'></div>

                    <div className="w-full flex flex-col gap-[20px] ">

                      <div className="">
                        <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Merchant</p>
                        <div className='flex lg:items-center gap-[10px]  max-md:flex-col'>
                          <select
                            className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px] "
                            value={tempFilters.merchant}
                            onChange={handleMerchantChange}
                          >
                            <option value="">Select Merchant</option>
                            <option value="James Odunayo">James Odunayo</option>
                            <option value="Jane Doe">Jane Doe</option>
                            <option value="Sarah Williams">Sarah Williams</option>
                            <option value="Michael Brown">Michael Brown</option>
                            <option value="Emma Davis">Emma Davis</option>
                            <option value="John Smith">John Smith</option>
                          </select>
                        </div>
                      </div>

                      <div className="">
                        <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Plan</p>
                        <div className='flex lg:items-center gap-[10px]  max-md:flex-col'>
                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input 
                              type="checkbox" 
                              name='custom' 
                              checked={tempFilters.plans.includes('custom')}
                              onChange={() => handleCheckboxChange('plans', 'custom')}
                            />
                            Custom
                          </div>

                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input 
                              type="checkbox" 
                              name='starter' 
                              checked={tempFilters.plans.includes('starter')}
                              onChange={() => handleCheckboxChange('plans', 'starter')}
                            />
                            Starter
                          </div>

                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input 
                              type="checkbox" 
                              name='pro' 
                              checked={tempFilters.plans.includes('pro')}
                              onChange={() => handleCheckboxChange('plans', 'pro')}
                            />
                            Pro
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Billing Cycle</p>
                        <div className='flex lg:items-center gap-[10px]  max-md:flex-col'>
                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input 
                              type="checkbox" 
                              name='monthly' 
                              checked={tempFilters.billingCycles.includes('monthly')}
                              onChange={() => handleCheckboxChange('billingCycles', 'monthly')}
                            />
                            Monthly
                          </div>

                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input 
                              type="checkbox" 
                              name='yearly' 
                              checked={tempFilters.billingCycles.includes('yearly')}
                              onChange={() => handleCheckboxChange('billingCycles', 'yearly')}
                            />
                            Yearly
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Payment Method</p>
                        <div className='flex lg:items-center gap-[10px]  max-md:flex-col'>
                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input 
                              type="checkbox" 
                              name='bank' 
                              checked={tempFilters.paymentMethods.includes('bank')}
                              onChange={() => handleCheckboxChange('paymentMethods', 'bank')}
                            />
                            Bank Transfer
                          </div>

                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input 
                              type="checkbox" 
                              name='wallet' 
                              checked={tempFilters.paymentMethods.includes('wallet')}
                              onChange={() => handleCheckboxChange('paymentMethods', 'wallet')}
                            />
                            Wallet
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Status</p>
                        <div className='flex lg:items-center gap-[10px]  max-md:flex-col'>
                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input 
                              type="checkbox" 
                              name='paid' 
                              checked={tempFilters.statuses.includes('paid')}
                              onChange={() => handleCheckboxChange('statuses', 'paid')}
                            />
                            Paid
                          </div>

                          <div className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                            <input 
                              type="checkbox" 
                              name='failed' 
                              checked={tempFilters.statuses.includes('failed')}
                              onChange={() => handleCheckboxChange('statuses', 'failed')}
                            />
                            Failed
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className='border-t-[1px] w-full  '></div>

                    <div className='flex gap-[8px] justify-end items-end mb-1'>
                      <button onClick={() => setFilter(!filter)} className='bg-[#F3F8FF] flex h-[40px] cursor-pointer w-[67px] rounded-[4px] items-center gap-[9px] justify-center'>
                        <p className='text-[14px] font-inter text-[#4E37FB] font-semibold' >Close</p>
                      </button>

                      <button onClick={applyFilters} className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-[99px] rounded-[4px] items-center gap-[9px] justify-center'>
                        <p className='text-[14px] font-inter text-white font-medium'>Add filters</p>
                      </button>
                    </div>
                  </div>

                </div>}
            </div>

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
            <div className='overflow-auto w-full'>
              <table className="table-auto w-full whitespace-nowrap  ">
                <thead className="bg-gray-50 border-b border-[#D9D4D4] dark:bg-gray-900 dark:text-white">
                  <tr className="h-[40px] text-left">
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white"> 
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-[3px] text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                          Invoice ID
                          <div className="flex flex-col gap-[1px] shrink-0">
                            <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                            <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                          </div>
                        </span>
                      </div>
                    </th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Merchant</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Plan</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Amount</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white ">
                      <div className="flex items-center gap-[3px]">
                        Billing cycle
                        <div className="flex flex-col gap-[1px] shrink-0">
                          <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        </div>
                      </div>
                    </th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                      <div className="flex items-center gap-[3px]">
                        Payment method
                        <div className="flex flex-col gap-[1px] shrink-0">
                          <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        </div>
                      </div>
                    </th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Status</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                      <div className="flex items-center gap-[3px]">
                        Date
                        <div className="flex flex-col gap-[1px] shrink-0">
                          <Image src="/icons/uparr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                          <Image src="/icons/downarr.svg" alt="uparrow" width={6} height={6} className="shrink-0" />
                        </div>
                      </div>
                    </th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] "></th>
                  </tr>
                </thead>

                <tbody className="border-b border-[#D9D4D4] w-full">
                  {data.map((item) => (
                    <tr key={item.id} className="bg-white dark:bg-gray-900  transition-all border-b duration-500 hover:bg-gray-50">
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-[3px] text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                            {item.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.package}</td>
                      
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.amount}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.customer}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white capitalize">{item.billingCycle || 'N/A'}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white capitalize">{item.method}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.created}</td>
                      <td className="relative px-3 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal cursor-pointer ">
                        <Image src="/icons/dots.svg" alt="dots" width={20} height={20} onClick={() => toggleDropdown(item.id)} />

                        {openDropdownId === item.id && (
                          <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-md z-50">
                            <p className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Download invoice</p>
                            <p className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Retry</p>
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

export default Billings