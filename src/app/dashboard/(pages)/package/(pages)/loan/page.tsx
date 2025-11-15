"use client"
import React, { useState, useEffect } from 'react'
import { FaPlus } from 'react-icons/fa'
import { FaAngleDown } from 'react-icons/fa';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"
import Addpackage from './Addloan';
import Editpackage from './Editloan';
import { fetchLoanPackages, deletePackage } from '@/services/api';

interface LoanPackage {
  id: number;
  name: string;
  type: string;
  loanAmount: number;
  loanPeriod: number;
  loanInterestRate: number;
  defaultAmount: number;
  gracePeriod: number;
  loanCharges: number;
  status: string;
  createdAt: string;
}

const Page = () => {
  const [show, setShow] = useState<boolean>(false)
  const [packag, setPackag] = useState<boolean>(false)
  const [edit, setEdit] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<LoanPackage | null>(null)
  
  const [packages, setPackages] = useState<LoanPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch loan packages on component mount
  useEffect(() => {
    fetchLoanPackagesData();
  }, []);

  const fetchLoanPackagesData = async () => {
    try {
      setLoading(true);
      const response = await fetchLoanPackages();
      if (response.success) {
        setPackages(response.packages || []);
      }
    } catch (error) {
      console.error('Error fetching loan packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg: LoanPackage) => {
    setSelectedPackage(pkg);
    setEdit(true);
  };

  const handleDelete = async (packageId: number) => {
    if (window.confirm('Are you sure you want to delete this loan package?')) {
      try {
        await deletePackage(packageId);
        fetchLoanPackagesData(); // Refresh the list
      } catch (error) {
        console.error('Error deleting loan package:', error);
        alert('Failed to delete loan package');
      }
    }
  };

  const handlePackageCreated = () => {
    fetchLoanPackagesData(); // Refresh the list
  };

  const handlePackageUpdated = () => {
    fetchLoanPackagesData(); // Refresh the list
  };

  // Filter packages based on search and filters
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || pkg.status === statusFilter;
    const matchesType = !typeFilter || pkg.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPackages.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPackages = filteredPackages.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  return (
    <div className='w-[100%]'>

      <div className='flex flex-wrap justify-between gap-4 md:gap-0 max-md:flex-col max-md:gap-[10px]'>
        <div className='flex flex-col gap-[3px] min-w-0 w-full md:w-auto'>
          <h1 className='font-inter font-semibold leading-[32px] text-[24px]'>Loan packages</h1>
          <p className='leading-[24px] font-inter font-normal text-[#717680] text-[14px] '>Set up and manage loan packages. Define terms, interest rates, and penalty.</p>
        </div>

        <div className='flex items-end mt-4 md:mt-0 w-full md:w-auto' onClick={() => setPackag(true)}>
          <button className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-full md:w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
            <FaPlus className='text-white font-normal w-[12px]' />
            <p className='text-[14px] font-inter text-white font-medium'>Create package</p>
          </button>
        </div>

      </div>

      {packag && <Addpackage packag={packag} onClose={() => setPackag(false)} onPackageCreated={handlePackageCreated} />}
      {edit && <Editpackage edit={edit} onClose={() => setEdit(false)} packageData={selectedPackage} onPackageUpdated={handlePackageUpdated} />}

      <div className='bg-white shadow-sm mt-[25px] w-full relative'>

        <div className='flex flex-wrap items-center justify-between gap-4 max-md:flex-col max-md:gap-[10px] p-[10px] md:p-[20px] '>

          <div className='flex flex-wrap items-center gap-[10px] md:gap-[20px] w-full md:w-auto'>
            <Select onValueChange={(value) => setRowsPerPage(parseInt(value))}>
              <SelectTrigger className="h-[40px] outline-none leading-[24px] rounded-[4px] w-full md:w-[185px] border border-[#D0D5DD] font-inter text-[14px] bg-white  transition-all">
                <SelectValue placeholder={`Show ${rowsPerPage} per row`} />
              </SelectTrigger>
              <SelectContent className="w-[185px] bg-white mt-1 rounded-[4px] shadow-lg p-0 border-none">
                <SelectGroup>
                  <SelectItem value="10" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px]  ">Show 10 per row</SelectItem>
                  <SelectItem value="15" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">Show 15 per row</SelectItem>
                  <SelectItem value="25" className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer transition-colors rounded-[4px] ">Show 25 per row</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-wrap gap-[10px] md:gap-[20px] w-full md:w-auto'>

            <div className='relative w-full md:w-auto'>
              <button onClick={() => setShow(!show)} className='bg-[#FAF9FF] h-[40px] cursor-pointer w-[105px] flex items-center justify-center gap-[7px] rounded-[4px]'>
                <p className='text-[#4E37FB] font-medium text-[14px]'>Export</p>
                <FaAngleDown className="w-[16px] h-[16px] text-[#4E37FB] my-[auto] " />
              </button>

              {show && <div onClick={() => setShow(!show)} className='absolute w-[90vw] max-w-[150px] min-w-[90px] md:w-[105px] bg-white rounded-[4px] shadow-lg'>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer rounded-[4px] ">PDF</p>
                <p className="px-4 py-2 font-inter text-[13px] text-[#101828] hover:bg-gray-50 cursor-pointer rounded-[4px]">CSV</p>
              </div>}
            </div>

            <div className="flex items-center h-[40px] w-full md:w-[311px] gap-[4px] border border-[#E5E7EB] rounded-[4px] px-3">
              <Image src="/icons/search.png" alt="dashboard" width={20} height={20} className="cursor-pointer" />

              <input
                type="text"
                placeholder="Search loan packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none px-3 py-2 w-full text-sm"
              />
            </div>

          </div>
        </div>

        <div className='overflow-auto w-full'>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E37FB]"></div>
            </div>
          ) : currentPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter || typeFilter ? 'No loan packages match your filters' : 'No loan packages found'}
            </div>
          ) : (
            <>
          <table className="table-auto w-full whitespace-nowrap hidden md:table">
            <thead className="bg-gray-50 border-b border-[#D9D4D4]">
              <tr className="h-[40px] text-left">
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Package name</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Loan type</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Loan amount</th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  <div className="flex items-center gap-[3px]">
                    Loan period
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                      <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    </div>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  <div className="flex items-center gap-[3px]">
                    Loan interest
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                      <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    </div>
                  </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Default amount</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                      <div className="flex items-center gap-[3px]">
                  Grace period
                  <div className="flex flex-col gap-[1px] shrink-0">
                    <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                  </div>
                </div>
                </th>
                <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">
                  <div className="flex items-center gap-[3px]">
                    Charges
                    <div className="flex flex-col gap-[1px] shrink-0">
                      <Image src="/icons/uparr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                      <Image src="/icons/downarr.svg" alt="uparrow" width={8} height={8} className="shrink-0" />
                    </div>
                  </div>
                </th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Status</th>
                    <th className="px-5 py-2 text-[12px] leading-[18px] font-lato font-normal text-[#141414] ">Actions</th>
              </tr>
            </thead>

            <tbody className="border-b border-[#D9D4D4] w-full">
                  {currentPackages.map((pkg) => (
                    <tr key={pkg.id} className="bg-white transition-all duration-500 hover:bg-gray-50">
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{pkg.name}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{pkg.type}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatCurrency(pkg.loanAmount)}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{pkg.loanPeriod} days</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{pkg.loanInterestRate}%</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatCurrency(pkg.defaultAmount)}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{pkg.gracePeriod} days</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">{formatCurrency(pkg.loanCharges)}</td>
                      <td className="px-5 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal ">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          pkg.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {pkg.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-gray-600 text-[14px] leading-[20px] font-lato font-normal flex gap-2">
                        <Image 
                          src="/icons/edit1.svg" 
                          alt="edit" 
                          onClick={() => handleEdit(pkg)} 
                          width={17} 
                          height={17} 
                          className="cursor-pointer hover:opacity-70" 
                        />
                        <Image 
                          src="/icons/delete.svg" 
                          alt="delete" 
                          onClick={() => handleDelete(pkg.id)} 
                          width={17} 
                          height={17} 
                          className="cursor-pointer hover:opacity-70" 
                        />
                      </td>
              </tr>
                  ))}
            </tbody>
          </table>

              {/* Mobile stacked rows */}
              {currentPackages.map((pkg) => (
                <div key={pkg.id} className="md:hidden block border-b p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Package name:</span>
                      <span className="font-semibold">{pkg.name}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Loan type:</span>
                      <span className="font-semibold">{pkg.type}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Loan amount:</span>
                      <span className="font-semibold">{formatCurrency(pkg.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Loan period:</span>
                      <span className="font-semibold">{pkg.loanPeriod} days</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Loan interest:</span>
                      <span className="font-semibold">{pkg.loanInterestRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Default amount:</span>
                      <span className="font-semibold">{formatCurrency(pkg.defaultAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Grace period:</span>
                      <span className="font-semibold">{pkg.gracePeriod} days</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Charges:</span>
                      <span className="font-semibold">{formatCurrency(pkg.loanCharges)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pkg.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pkg.status}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 cursor-pointer">
                      <Image 
                        src="/icons/edit1.svg" 
                        alt="edit" 
                        width={17} 
                        height={17} 
                        onClick={() => handleEdit(pkg)} 
                        className="hover:opacity-70" 
                      />
                      <Image 
                        src="/icons/delete.svg" 
                        alt="delete" 
                        width={17} 
                        height={17} 
                        onClick={() => handleDelete(pkg.id)} 
                        className="hover:opacity-70" 
                      />
                    </div>
            </div>
          </div>
              ))}
            </>
          )}
        </div>

      <div className='border-t-[1px] w-full mt-[20px]'></div>

      {totalPages > 1 && (
      <div className="flex flex-wrap flex-col md:flex-row pb-4 justify-between items-center gap-2 mt-4 px-2 md:px-5">
        {/* Prev Button */}
        <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center mb-2 md:mb-0 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image src="/icons/left.svg" alt="Prev" width={10} height={10} className="mr-1" />
          Previous
        </button>
          
        {/* Page Numbers */}
        <div className="flex gap-2 items-center justify-center">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({filteredPackages.length} total packages)
            </span>
        </div>
          
        {/* Next Button */}
        <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm border border-[#D0D5DD] font-medium rounded-md w-full md:w-[100px] justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <Image src="/icons/right.svg" alt="Next" width={10} height={10} className="ml-1" />
        </button>
      </div>
      )}
      </div>

    </div>

  )
}

export default Page