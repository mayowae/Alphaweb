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
    period: '',
    interestRate: '',
    extraCharges: '0.00',
    defaultPenalty: '0.00',
    defaultDays: '0',
    duration: '',
    benefits: ['Daily savings', 'Low interest loans'],
    description: ''
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
        period: packageData.period?.toString() || '',
        interestRate: packageData.interestRate?.toString() || '',
        extraCharges: packageData.extraCharges?.toString() || '0.00',
        defaultPenalty: packageData.defaultPenalty?.toString() || '0.00',
        defaultDays: packageData.defaultDays?.toString() || '0',
        duration: packageData.duration?.toString() || '',
        benefits: packageData.benefits || ['Daily savings', 'Low interest loans'],
        description: packageData.description || ''
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
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.period || parseInt(formData.period) <= 0) newErrors.period = 'Valid period is required';
    if (!formData.interestRate || parseFloat(formData.interestRate) < 0) newErrors.interestRate = 'Valid interest rate is required';
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
        amount: parseFloat(formData.amount),
        seedAmount: parseFloat(formData.amount),
        seedType: 'First saving',
        period: parseInt(formData.period),
        collectionDays: 'Daily',
        duration: parseInt(formData.duration),
        benefits: formData.benefits,
        description: formData.description,
        interestRate: parseFloat(formData.interestRate),
        extraCharges: parseFloat(formData.extraCharges),
        defaultPenalty: parseFloat(formData.defaultPenalty),
        defaultDays: parseInt(formData.defaultDays)
      });

      onPackageUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Failed to update package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
     {/* Overlay backdrop */}
      {edit&&  (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/20  z-50 "
        />
      )}

      <div  className={`fixed top-0 right-0 h-screen w-full max-w-full sm:w-[532px] bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out z-50
          flex flex-col ${edit ? 'translate-x-0' : 'translate-x-full'}`}>

       
  
          <div className="flex p-4 items-center justify-between">
            <h1 className='text-[20px] font-inter font-semibold leading-[30px] max-md:text-[14px]'>Edit investment package</h1>
            <Image src="/icons/close.svg" alt="dashboard" width={14} height={14} className="cursor-pointer" onClick={onClose} />
          </div>
          <div className='border-t-[1px] w-full mb-1'></div>
   
        <form onSubmit={handleSubmit} className="p-4 w-full overflow-y-auto hide-scrollbar">
          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Name</p>
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
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Type</p>
            <div className='relative w-full'>
              <select 
                className='w-full appearance-none h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px]'
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="Fixed">Fixed deposit</option>
                <option value="Flexible">Flexible deposit</option>
                <option value="Variable">Variable deposit</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                <FaAngleDown className="w-[16px] h-[16px] text-[#8E8E93]" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Target amount</p>
            <input 
              type="number" 
              placeholder='0.00' 
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={`w-full h-[45px] border ${errors.amount ? 'border-red-500' : 'border-[#D0D5DD]'} p-[10px] rounded-[4px] outline-none`} 
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Investment period (days)</p>
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
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Percentage interest</p>
            <input 
              type="number" 
              step="0.01"
              placeholder='20.00' 
              value={formData.interestRate}
              onChange={(e) => handleInputChange('interestRate', e.target.value)}
              className={`w-full h-[45px] border ${errors.interestRate ? 'border-red-500' : 'border-[#D0D5DD]'} p-[10px] rounded-[4px] outline-none`} 
            />
            {errors.interestRate && <p className="text-red-500 text-xs mt-1">{errors.interestRate}</p>}
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Extra charges</p>
            <input 
              type="number" 
              step="0.01"
              placeholder='0.00' 
              value={formData.extraCharges}
              onChange={(e) => handleInputChange('extraCharges', e.target.value)}
              className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' 
            />
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Default penalty (per day)</p>
            <input 
              type="number" 
              step="0.01"
              placeholder='0.00' 
              value={formData.defaultPenalty}
              onChange={(e) => handleInputChange('defaultPenalty', e.target.value)}
              className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' 
            />
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Default no. of days</p>
            <input 
              type="number" 
              placeholder='0' 
              value={formData.defaultDays}
              onChange={(e) => handleInputChange('defaultDays', e.target.value)}
              className='w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none' 
            />
          </div>

          <div className="mb-4">
            <p className='mb-1 font-inter font-medium text-[14px] leading-[20px]'>Description (optional)</p>
            <textarea 
              placeholder='Package description...' 
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