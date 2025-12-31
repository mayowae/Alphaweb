"use client"
import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa';
import Pagination from '../../admin/pagination';
import { MerchantData } from '../../../interface/type';
import ChangestatusModal from './modals/Changestatusmodal';

const TransactionTable = () => {
    const [show, setShow] = useState<boolean>(false)
    const [filter, setFilter] = useState(false)
    const [modalopen, setModalopen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<MerchantData | null>(null)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState<string>('')
    const [entriesPerPage, setEntriesPerPage] = useState<number>(10)
    const [currentPage, setCurrentPage] = useState<number>(1)

    const [dateRange, setDateRange] = useState<string>('')
    const [customDate, setCustomDate] = useState<string>('')
    const [selectedMerchant, setSelectedMerchant] = useState<string>('')
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])


  const [tableData, setTableData] = useState<MerchantData[]>([
        { id: 'COL-103-A45', package: 'Basic', no_of_agents: '10', no_of_customers: '20', customer: 'Rupet Microfinance', method: "wallet", status: 'active', created: '23 Jan, 2025', amount: '₦200,000' },
        { id: 'COL-203-B12', package: 'Free', no_of_agents: '20', no_of_customers: '30', customer: 'Rupet Microfinance', method: "wallet", status: 'active', created: '23 Jan, 2025', amount: '₦250,000' },
        { id: 'COL-304-C78', package: 'Pro', no_of_agents: '5', no_of_customers: '15', customer: 'Rupet Microfinance', method: "card", status: 'inactive', created: '22 Jan, 2025', amount: '₦300,000' },
        { id: 'COL-405-D34', package: 'Custom', no_of_agents: '10', no_of_customers: '25', customer: 'Rupet Microfinance', method: "wallet", status: 'active', created: '21 Jan, 2025', amount: '₦200,000' },
        { id: 'COL-506-E90', package: 'Basic', no_of_agents: '20', no_of_customers: '30', customer: 'Michael Brown', method: "transfer", status: 'inactive', created: '20 Jan, 2025', amount: '₦200,000' },
        { id: 'COL-607-F56', package: 'Free', no_of_agents: '33', no_of_customers: '45', customer: 'Emily Davis', method: "wallet", status: 'active', created: '19 Jan, 2025', amount: '₦250,000' },
        { id: 'COL-708-G23', package: 'Pro', no_of_agents: '30', no_of_customers: '40', customer: 'David Wilson', method: "card", status: 'active', created: '18 Jan, 2025', amount: '₦300,000' },
        { id: 'COL-809-H89', package: 'Custom', no_of_agents: '40', no_of_customers: '50', customer: 'Lisa Anderson', method: "wallet", status: 'inactive', created: '17 Jan, 2025', amount: '₦200,000' },
        { id: 'COL-910-I45', package: 'Basic', no_of_agents: "23", no_of_customers: '25', customer: 'Robert Taylor', method: "transfer", status: 'active', created: '16 Jan, 2025', amount: '₦200,000' },
        { id: 'COL-011-J12', package: 'Free', no_of_agents: '92', no_of_customers: '35', customer: 'Jennifer Martinez', method: "wallet", status: 'active', created: '15 Jan, 2025', amount: '₦250,000' },
        { id: 'COL-112-K78', package: 'Pro', no_of_agents: '94', no_of_customers: '45', customer: 'Christopher Lee', method: "card", status: 'inactive', created: '14 Jan, 2025', amount: '₦300,000' },
        { id: 'COL-213-L34', package: 'Custom', no_of_agents: '21', no_of_customers: '33', customer: 'Amanda White', method: "wallet", status: 'active', created: '13 Jan, 2025', amount: '₦200,000' },
    ]);

    const filteredData = useMemo(() => {
        let result = [...tableData];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.id.toLowerCase().includes(lowerQuery) ||
                item.customer.toLowerCase().includes(lowerQuery) ||
                item.method.toLowerCase().includes(lowerQuery) ||
                item.package.toLowerCase().includes(lowerQuery)
            );
        }


        if (selectedMerchant) {
            result = result.filter(item => item.customer === selectedMerchant);
        }


        if (selectedTypes.length > 0) {
            result = result.filter(item => selectedTypes.includes(item.package));
        }

        if (selectedStatuses.length > 0) {
            result = result.filter(item => selectedStatuses.includes(item.status));
        }
        if (dateRange || customDate) {

        }

        return result;
    }, [tableData, searchQuery, selectedMerchant, selectedTypes, selectedStatuses, dateRange, customDate]);


    const handleStatusChange = (newStatus: string, transactionIds: string[]) => {
        setTableData(prev =>
            prev.map(item =>
                transactionIds.includes(item.id)
                    ? { ...item, status: newStatus }
                    : item
            )
        );
    };

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        return filteredData.slice(start, end);
    }, [filteredData, currentPage, entriesPerPage]);

    const totalPages = Math.ceil(filteredData.length / entriesPerPage);

    const handleSelectUser = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const toggleDropdown = (id: string) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, entriesPerPage, selectedMerchant, selectedTypes, selectedStatuses]);

    return (
        <div>
            <div className='bg-white dark:bg-gray-900 dark:text-white shadow-sm mt-[25px] w-full mb-2 relative'>

                <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px]'>

                    <div className='flex flex-wrap items-center gap-[10px] md:gap-[20px] w-full md:w-auto'>

                        <div className='relative w-full md:w-auto'>
                            <button onClick={() => setFilter(!filter)} className='h-[40px] outline-none leading-[24px] rounded-[4px] w-[90px] border border-[#D0D5DD] flex items-center justify-center gap-[9px] font-inter text-[14px] bg-white transition-all'>
                                <Image src="/icons/filters.svg" alt="filter" width={16} height={16} className="" />
                                <p className='font-medium text-[14px]'>Filter</p>
                            </button>

                            {filter &&
                                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20'>
                                    <div className='lg:w-[500px] sm:w-[400px] w-[90%] absolute bg-white max-h-[90vh] overflow-y-auto flex flex-col gap-[20px] p-[15px]'>

                                        <div className="flex items-center justify-between max-md:flex-col max-md:gap-[5px]">
                                            <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Choose your filters</h1>
                                            <button onClick={() => {
                                                setDateRange(''); setCustomDate(''); setSelectedMerchant(''); setSelectedTypes([]); setSelectedStatuses([]);
                                            }} className='text-[14px] text-[#4E37FB] font-inter font-semibold'>Clear filters</button>
                                        </div>

                                        <div className='border-t-[1px] w-full'></div>

                                        <div className="w-full flex flex-col gap-[20px]">
                                            <div>
                                                <p className='mb-2 font-inter font-medium text-[14px] leading-[20px]'>Date range</p>
                                                <div className='flex justify-between gap-2 max-md:flex-col'>
                                                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full h-[40px] outline-none leading-[24px] rounded-[4px] border border-[#D0D5DD] font-inter text-[14px] bg-white px-2 transition-all">
                                                        <option value="">All time</option>
                                                        <option value="7">Last 7 days</option>
                                                        <option value="20">Last 20 days</option>
                                                    </select>
                                                    <div className='w-full'>
                                                        <input
                                                            type="date"
                                                            value={customDate}
                                                            onChange={(e) => setCustomDate(e.target.value)}
                                                            className="w-full h-[40px] border border-[#D0D5DD] rounded-[4px] font-inter p-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <p className='mb-2 font-inter font-medium text-[14px] leading-[20px]'>Merchant</p>
                                                <select value={selectedMerchant} onChange={(e) => setSelectedMerchant(e.target.value)} className="h-[40px] w-full outline-none leading-[24px] rounded-[4px] border border-[#D0D5DD] font-inter text-[14px] bg-white px-2 transition-all">
                                                    <option value="">All Merchants</option>
                                                    {tableData.map(item => (
                                                        <option key={item.customer} value={item.customer}>{item.customer} ({item.customer})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <p className='mb-2 font-inter font-medium text-[14px] leading-[20px]'>Type</p>
                                                <div className='flex flex-wrap gap-[10px] max-md:flex-col'>
                                                    {['Basic', 'Free', 'Pro', 'Custom'].map(type => (
                                                        <div key={type} className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTypes.includes(type)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedTypes(prev => [...prev, type]);
                                                                    } else {
                                                                        setSelectedTypes(prev => prev.filter(t => t !== type));
                                                                    }
                                                                }}
                                                            />
                                                            {type}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <p className='mb-2 font-inter font-medium text-[14px] leading-[20px]'>Status</p>
                                                <div className='flex flex-wrap gap-[10px] max-md:flex-col'>
                                                    {['active', 'pending', 'failed', 'successful'].map(status => (
                                                        <div key={status} className='flex items-center border gap-[4px] px-3 py-1 rounded-[4px]'>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedStatuses.includes(status)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedStatuses(prev => [...prev, status]);
                                                                    } else {
                                                                        setSelectedStatuses(prev => prev.filter(s => s !== status));
                                                                    }
                                                                }}
                                                            />
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='border-t-[1px] w-full'></div>

                                        <div className='flex gap-[8px] justify-end items-end mb-1'>
                                            <button onClick={() => setFilter(false)} className='bg-[#F3F8FF] flex h-[40px] cursor-pointer w-[67px] rounded-[4px] items-center gap-[9px] justify-center'>
                                                <p className='text-[14px] font-inter text-[#4E37FB] font-semibold'>Close</p>
                                            </button>
                                            <button onClick={() => setFilter(false)} className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-[99px] rounded-[4px] items-center gap-[9px] justify-center'>
                                                <p className='text-[14px] font-inter text-white font-medium'>Apply</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                        <div className='w-[100%] md:w-[185px]'>
                            <select
                                value={entriesPerPage}
                                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                className="h-[40px] w-full outline-none leading-[24px] rounded-[4px] border border-[#D0D5DD] font-inter text-[14px] bg-white px-2 transition-all"
                            >
                                <option value={10}>Show 10 per row</option>
                                <option value={15}>Show 15 per row</option>
                                <option value={20}>Show 20 per row</option>
                            </select>
                        </div>
                    </div>

                    <div className='flex flex-wrap gap-[10px] md:gap-[20px] w-full md:w-auto'>
                        <div className='w-full md:w-auto mb-2 md:mb-0'>
                            <button
                                disabled={selectedUsers.length === 0}
                                onClick={() => setModalopen(true)}
                                className={`bg-[#4E37FB] h-[40px] w-full md:w-[118px] flex items-center justify-center gap-[7px] rounded-[4px] ${selectedUsers.length === 0 ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                <p className='text-white font-medium text-[14px]'>Change Status</p>
                            </button>
                        </div>

                        <div className='relative w-full md:w-auto'>
                            <button onClick={() => setShow(!show)} className='bg-[#FAF9FF] h-[40px] cursor-pointer w-[105px] flex items-center justify-center gap-[7px] rounded-[4px]'>
                                <p className='text-[#4E37FB] font-medium text-[14px]'>Export</p>
                                <FaAngleDown className="w-[16px] h-[16px] text-[#4E37FB] my-[auto]" />
                            </button>

                            {show && (
                                <div onClick={() => setShow(false)} className='absolute w-[90vw] max-w-[150px] min-w-[90px] md:w-[105px] bg-white rounded-[4px] shadow-lg z-10'>
                                    <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">PDF</p>
                                    <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]">CSV</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center h-[40px] w-full md:w-[311px] gap-[4px] border border-[#E5E7EB] rounded-[4px] px-3">
                            <Image src="/icons/search.png" alt="search" width={20} height={20} className="cursor-pointer" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="outline-none px-3 py-2 w-full text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className='overflow-x-auto'>
                    <div className='overflow-auto w-full'>
                        <table className="table-auto w-full whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-[#D9D4D4] dark:bg-gray-900 dark:text-white">
                                <tr className="h-[40px] text-left">
                                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" className="w-5 h-5 border border-gray-300 rounded-md" />
                                            <span className="flex items-center gap-[3px] text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                                                Transaction ID
                                                <div className="flex flex-col gap-[1px] shrink-0">
                                                    <Image src="/icons/uparr.svg" alt="up" width={6} height={6} />
                                                    <Image src="/icons/downarr.svg" alt="down" width={6} height={6} />
                                                </div>
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Type</th>
                                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Merchant</th>
                                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Amount</th>
                                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">Initiated by</th>
                                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                                        <div className="flex items-center gap-[3px]">Status
                                            <div className="flex flex-col gap-[1px] shrink-0">
                                                <Image src="/icons/uparr.svg" alt="up" width={6} height={6} />
                                                <Image src="/icons/downarr.svg" alt="down" width={6} height={6} />
                                            </div>
                                        </div>
                                    </th>
                                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] dark:text-white">
                                        <div className="flex items-center gap-[3px]">Date
                                            <div className="flex flex-col gap-[1px] shrink-0">
                                                <Image src="/icons/uparr.svg" alt="up" width={6} height={6} />
                                                <Image src="/icons/downarr.svg" alt="down" width={6} height={6} />
                                            </div>
                                        </div>
                                    </th>
                                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414]"></th>
                                </tr>
                            </thead>

                            <tbody className="border-b border-[#D9D4D4] w-full">
                                {paginatedData.map((item) => (
                                    <tr key={item.id} className="bg-white dark:bg-gray-900 transition-all border-b duration-500 hover:bg-gray-50">
                                        <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(item.id)}
                                                    onChange={() => handleSelectUser(item.id)}
                                                    className="w-5 h-5 border border-gray-300 rounded-md"
                                                />
                                                <span>{item.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.package}</td>
                                        <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.customer}</td>
                                        <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.amount}</td>
                                        <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.customer}</td>
                                        <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.status}</td>
                                        <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal dark:text-white">{item.created}</td>
                                        <td className="relative px-3 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal cursor-pointer">
                                            <Image src="/icons/dots.svg" alt="dots" width={20} height={20} onClick={() => toggleDropdown(item.id)} />

                                            {openDropdownId === item.id && (
                                                <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-md z-50">
                                                    <p className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export</p>
                                                    <p className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Retry</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='border-t-[1px] w-full mt-[20px]'></div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredData.length}
                        itemsPerPage={entriesPerPage}
                    />
                </div>
            </div>

            {modalopen && (
                <ChangestatusModal
                    modalopen={modalopen}
                    onClose={() => {
                        setModalopen(false);
                        setSelectedUsers([]); // clear selection when closing
                    }}
                    bulk={selectedUsers}
                    bulker={setSelectedUsers}
                    onStatusChange={handleStatusChange} // ← pass the updater
                />
            )}
        </div>
    )
}

export default TransactionTable;