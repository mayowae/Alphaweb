"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa'
import { updatePackage } from '@/services/api'

interface pack {
  edit: boolean,
  onClose: () => void;
  packageData?: any;
  onPackageUpdated: () => void;
}

const Editpackage = ({ edit, onClose, packageData, onPackageUpdated }: pack) => {
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    type: 'Fixed',
    amount: '',
    loanAmount: '',
    loanInterestRate: '',
    loanPeriod: '',
    defaultAmount: '0.00',
    gracePeriod: '0',
    loanCharges: '0.00',
    period: '360',
    duration: '360',
    benefits: ['Loan facility', 'Flexible repayment'],
    description: '',
    packageCategory: 'Loan'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (packageData) {
      setFormData({
        id: packageData.id || 0,
        name: packageData.name || '',
        type: packageData.type || 'Fixed',
        amount: packageData.amount?.toString() || '',
        loanAmount: packageData.loanAmount?.toString() || packageData.amount?.toString() || '',
        loanInterestRate: packageData.loanInterestRate?.toString() || '',
        loanPeriod: packageData.loanPeriod?.toString() || '',
        defaultAmount: packageData.defaultAmount?.toString() || '0.00',
        gracePeriod: packageData.gracePeriod?.toString() || '0',
        loanCharges: packageData.loanCharges?.toString() || '0.00',
        period: packageData.period?.toString() || '360',
        duration: packageData.duration?.toString() || '360',
        benefits: packageData.benefits || ['Loan facility', 'Flexible repayment'],
        description: packageData.description || '',
        packageCategory: packageData.packageCategory || 'Loan'
      });
    }
  }, [packageData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Package name is required';
    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) newErrors.loanAmount = 'Valid loan amount is required';
    if (!formData.loanPeriod || parseInt(formData.loanPeriod) <= 0) newErrors.loanPeriod = 'Valid loan period is required';
    if (!formData.loanInterestRate || parseFloat(formData.loanInterestRate) < 0) newErrors.loanInterestRate = 'Valid interest rate is required';
    if (!formData.period || parseInt(formData.period) <= 0) newErrors.period = 'Valid period is required';
    if (!formData.duration || parseInt(formData.duration) <= 0) newErrors.duration = 'Valid duration is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updatePackage({
        id: formData.id,
        name: formData.name,
        type: formData.type,
        amount: parseFloat(formData.loanAmount), // Use loan amount as the main amount
        seedAmount: parseFloat(formData.loanAmount),
        seedType: 'Loan amount',
        period: parseInt(formData.period),
        collectionDays: 'Daily',
        duration: parseInt(formData.duration),
        benefits: formData.benefits,
        description: formData.description,
        packageCategory: 'Loan',
        loanAmount: parseFloat(formData.loanAmount),
        loanInterestRate: parseFloat(formData.loanInterestRate),
        loanPeriod: parseInt(formData.loanPeriod),
        defaultAmount: parseFloat(formData.defaultAmount),
        gracePeriod: parseInt(formData.gracePeriod),
        loanCharges: parseFloat(formData.loanCharges)
      });

      onPackageUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating loan package:', error);
      alert('Failed to update loan package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
   <>
     {/* Overlay backdrop */}
      {edit &&  (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/20  z-50 "
        />
      )}

      <div  className={`fixed top-0 right-0 h-screen w-full max-w-full sm:w-[532px] bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out z-50
          flex flex-col ${edit ? 'translate-x-0' : 'translate-x-full'}`}>


          <div className="flex p-4 items-center justify-between">
            <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Edit loan package</h1>
            <Image src="/icons/close.svg" alt="dashboard" width={14} height={14} className="cursor-pointer" onClick={onClose} />
          </div>
          <div className='border-t-[1px] w-full mb-1'></div>

        <form onSubmit={handleSubmit} className="p-4 w-full overflow-y-auto hide-scrollbar">
          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Package name</p>
            <input 
              type="text" 
              placeholder='Alpha1k' 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full h-[45px] border ${errors.name ? 'border-red-500' : 'border-[#D0D5DD]'} p-[10px] rounded-[4px] outline-none`} 
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Loan amount</p>
            <input 
              type="number" 
              placeholder='200000' 
              value={formData.loanAmount}
              onChange={(e) => handleInputChange('loanAmount', e.target.value)}
              className={`w-full h-[45px] border ${errors.loanAmount ? 'border-red-500' : 'border-[#D0D5DD]'} p-[10px] rounded-[4px] outline-none`} 
            />
            {errors.loanAmount && <p className="text-red-500 text-xs mt-1">{errors.loanAmount}</p>}
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Loan type</p>
            <div className='relative w-full'>
              <select 
                className='w-full appearance-none h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px]'
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="Fixed">Fixed rate</option>
                <option value="Flexible">Flexible rate</option>
                <option value="Variable">Variable rate</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                <FaAngleDown className="w-[16px] h-[16px] text-[#8E8E93]" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Loan interest rate (%)</p>
            <input 
              type="number" 
              step="0.01"
              placeholder='20.00' 
              value={formData.loanInterestRate}
              onChange={(e) => handleInputChange('loanInterestRate', e.target.value)}
              className={`w-full h-[45px] border ${errors.loanInterestRate ? 'border-red-500' : 'border-[#D0D5DD]'} p-[10px] rounded-[4px] outline-none`} 
            />
            {errors.loanInterestRate && <p className="text-red-500 text-xs mt-1">{errors.loanInterestRate}</p>}
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Loan period (days)</p>
            <input 
              type="number" 
              placeholder='360' 
              value={formData.loanPeriod}
              onChange={(e) => handleInputChange('loanPeriod', e.target.value)}
              className={`w-full h-[45px] border ${errors.loanPeriod ? 'border-red-500' : 'border-[#D0D5DD]'} p-[10px] rounded-[4px] outline-none`} 
            />
            {errors.loanPeriod && <p className="text-red-500 text-xs mt-1">{errors.loanPeriod}</p>}
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>General period (days)</p>
            <input 
              type="number" 
              placeholder='360' 
              value={formData.period}
              onChange={(e) => handleInputChange('period', e.target.value)}
              className={`w-full h-[45px] border ${errors.period ? 'border-red-500' : 'border-[#D0D5DD]'} p-[10px] rounded-[4px] outline-none`} 
            />
            {errors.period && <p className="text-red-500 text-xs mt-1">{errors.period}</p>}
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Duration (days)</p>
            <input 
              type="number" 
              placeholder='360' 
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className={`w-full h-[45px] border ${errors.duration ? 'border-red-500' : 'border-[#D0D5DD]'} p-[10px] rounded-[4px] outline-none`} 
            />
            {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Default amount</p>
            <input 
              type="number" 
              step="0.01"
              placeholder='1000.00' 
              value={formData.defaultAmount}
              onChange={(e) => handleInputChange('defaultAmount', e.target.value)}
              className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' 
            />
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Grace period (days)</p>
            <input 
              type="number" 
              placeholder='30' 
              value={formData.gracePeriod}
              onChange={(e) => handleInputChange('gracePeriod', e.target.value)}
              className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' 
            />
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Charges</p>
            <input 
              type="number" 
              step="0.01"
              placeholder='2000.00' 
              value={formData.loanCharges}
              onChange={(e) => handleInputChange('loanCharges', e.target.value)}
              className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' 
            />
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Description (optional)</p>
            <textarea 
              placeholder='Loan package description...' 
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className='w-full h-[80px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none resize-none' 
            />
        </div>
        </form>

        <div className='border-t-[1px] w-full mb-1  mt-5'></div>

        <div className='mt-[15px] flex justify-center mb-8'>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className='bg-[#4E37FB] flex h-[40px] cursor-pointer w-[167px] rounded-[4px] items-center gap-[9px] justify-center disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <p className='text-[14px] font-inter text-white font-medium'>
              {loading ? 'Updating...' : 'Update package'}
            </p>
          </button>
        </div>
      </div>
    </>
  )
}

export default Editpackage