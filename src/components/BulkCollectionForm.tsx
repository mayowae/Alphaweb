"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { fetchCustomers, fetchPackages, createCollection } from '../../services/api';
import Swal from 'sweetalert2';

interface BulkCollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Customer {
  id: number;
  fullName: string;
  accountNumber?: string;
  packageId?: number | string;
  packageName?: string;
}

interface Package {
  id: number;
  name: string;
  amount: number;
  packageCategory?: string;
}

const BulkCollectionForm: React.FC<BulkCollectionFormProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    selectedCustomerId: '',
    packageName: '',
    selectedPackageId: '',
    packageAmount: '',
    numberOfDays: '',
    totalAmount: '',
    cycleCounter: 1
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [customersRes, packagesRes] = await Promise.all([
        fetchCustomers().catch(() => ({ customers: [] })),
        fetchPackages('Collection').catch(() => ({ packages: [] }))
      ]);
      setCustomers(customersRes.customers || []);
      const rawPkgs = (packagesRes.packages || packagesRes.data || packagesRes || []) as Package[];
      const collectionPkgs = rawPkgs.filter((p: any) => !p.packageCategory || p.packageCategory.toLowerCase() === 'collection');
      setPackages(collectionPkgs);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'customerName') {
      const filtered = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(value.length > 0);

      // Clear selection when searching
      setFormData(prev => ({
        ...prev,
        selectedCustomerId: '',
        selectedPackageId: '',
        packageName: '',
        packageAmount: '',
        totalAmount: ''
      }));
    }

    // Auto-calculate total amount when package amount or number of days changes
    if (name === 'packageAmount' || name === 'numberOfDays') {
      const packageAmount = name === 'packageAmount' ? parseFloat(value) : parseFloat(formData.packageAmount);
      const days = name === 'numberOfDays' ? parseInt(value) : parseInt(formData.numberOfDays);
      
      if (!isNaN(packageAmount) && !isNaN(days) && days > 0) {
        setFormData(prev => ({
          ...prev,
          totalAmount: (packageAmount * days).toString()
        }));
      }
    }
  };

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const packageId = e.target.value;
    const selectedPackage = packages.find(pkg => pkg.id.toString() === packageId);
    setFormData(prev => ({
      ...prev,
      selectedPackageId: packageId,
      packageName: selectedPackage?.name || '',
      packageAmount: selectedPackage ? selectedPackage.amount.toString() : ''
    }));
  };

  const calculateCycleCounter = (currentCounter: number, days: number): number => {
    const newCounter = currentCounter + days;
    return ((newCounter - 1) % 31) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.packageName || !formData.packageAmount || !formData.numberOfDays) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.'
      });
      return;
    }

    setLoading(true);
    try {
      const numberOfDays = parseInt(formData.numberOfDays);
      const packageAmount = parseFloat(formData.packageAmount);
      const currentCounter = parseInt(formData.cycleCounter.toString());
      const newCycleCounter = calculateCycleCounter(currentCounter, numberOfDays);

      // Create multiple collections for bulk posting
      const collections = [];
      for (let i = 0; i < numberOfDays; i++) {
        const dayCounter = ((currentCounter + i - 1) % 31) + 1;
        collections.push({
          customerName: formData.customerName,
          amount: packageAmount,
          dueDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'Package Payment',
          packageName: formData.packageName,
          packageAmount: packageAmount,
          cycle: 31,
          cycleCounter: dayCounter,
          isFirstCollection: dayCounter === 1
        });
      }

      // Post all collections
      for (const collectionData of collections) {
        await createCollection(collectionData);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Bulk collection posted successfully for ${numberOfDays} days!`
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to post bulk collection'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Post Bulk Collection
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Search customer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      
                      let assignedPkg = null;
                      const pkgId = customer.packageId || (customer as any).package_id || (customer as any).PackageId || (customer as any).Package?.id;
                      
                      if (pkgId) {
                        assignedPkg = packages.find(p => p.id.toString() === pkgId.toString());
                      }
                      
                      // Fallback: Try matching by string name if backend provided a packageName but no straight ID
                      if (!assignedPkg && customer.packageName && customer.packageName !== '—' && customer.packageName !== '-') {
                        assignedPkg = packages.find(p => p.name.toLowerCase() === customer.packageName!.toLowerCase());
                      }
                      
                      setFormData(prev => ({ 
                        ...prev, 
                        customerName: customer.fullName,
                        selectedCustomerId: customer.id.toString(),
                        selectedPackageId: assignedPkg ? assignedPkg.id.toString() : '',
                        packageName: assignedPkg ? assignedPkg.name : '',
                        packageAmount: assignedPkg ? assignedPkg.amount.toString() : '',
                        totalAmount: (assignedPkg && formData.numberOfDays) ? (assignedPkg.amount * parseInt(formData.numberOfDays)).toString() : ''
                      }));
                      
                      setShowCustomerDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {customer.fullName}{customer.accountNumber ? ` • ${customer.accountNumber}` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Name *
            </label>
            <select
              name="selectedPackageId"
              value={formData.selectedPackageId}
              onChange={handlePackageChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                (() => {
                  const c = customers.find(c => c.id.toString() === formData.selectedCustomerId);
                  if (!c) return false;
                  if (c.packageId || (c as any).package_id || (c as any).PackageId) return true;
                  if (c.packageName && c.packageName !== '—' && c.packageName !== '-') {
                    return !!packages.find(p => p.name.toLowerCase() === c.packageName!.toLowerCase());
                  }
                  return false;
                })() ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              required
              disabled={(() => {
                const c = customers.find(c => c.id.toString() === formData.selectedCustomerId);
                if (!c) return false;
                if (c.packageId || (c as any).package_id || (c as any).PackageId) return true;
                if (c.packageName && c.packageName !== '—' && c.packageName !== '-') {
                  return !!packages.find(p => p.name.toLowerCase() === c.packageName!.toLowerCase());
                }
                return false;
              })()}
            >
              <option value="">Select Package</option>
               {packages
                .filter(pkg => {
                  // If a customer is selected and has a packageId, only show that package
                  const selectedCustomer = customers.find(c => c.id.toString() === formData.selectedCustomerId);
                  if (selectedCustomer?.packageId) {
                    return pkg.id.toString() === selectedCustomer.packageId.toString();
                  }
                  return true;
                })
                .map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - ₦{pkg.amount?.toLocaleString()}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Amount *
            </label>
            <input
              type="number"
              name="packageAmount"
              value={formData.packageAmount}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                (() => {
                  const c = customers.find(c => c.id.toString() === formData.selectedCustomerId);
                  if (!c) return false;
                  if (c.packageId || (c as any).package_id || (c as any).PackageId) return true;
                  if (c.packageName && c.packageName !== '—' && c.packageName !== '-') {
                    return !!packages.find(p => p.name.toLowerCase() === c.packageName!.toLowerCase());
                  }
                  return false;
                })() ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              required
              readOnly={(() => {
                const c = customers.find(c => c.id.toString() === formData.selectedCustomerId);
                if (!c) return false;
                if (c.packageId || (c as any).package_id || (c as any).PackageId) return true;
                if (c.packageName && c.packageName !== '—' && c.packageName !== '-') {
                  return !!packages.find(p => p.name.toLowerCase() === c.packageName!.toLowerCase());
                }
                return false;
              })()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Days *
            </label>
            <input
              type="number"
              name="numberOfDays"
              value={formData.numberOfDays}
              onChange={handleInputChange}
              placeholder="Number of days"
              min="1"
              max="31"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Cycle counter will increase by this number of days
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              placeholder="Auto-calculated"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Automatically calculated: Package Amount × Number of Days
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle Counter
            </label>
            <input
              type="number"
              name="cycleCounter"
              value={formData.cycleCounter}
              onChange={handleInputChange}
              min="1"
              max="31"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Will increase by the number of days (max 31, then resets to 1)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {loading ? 'Posting...' : 'Post Bulk Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkCollectionForm;
