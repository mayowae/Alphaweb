"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { fetchCustomers, fetchPackages, createCollection } from '../../services/api';
import Swal from 'sweetalert2';

interface SingleCollectionFormProps {
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

const SingleCollectionForm: React.FC<SingleCollectionFormProps> = ({
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
        packageAmount: ''
      }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.packageName || !formData.packageAmount) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.'
      });
      return;
    }

    setLoading(true);
    try {
      const collectionData = {
        customerName: formData.customerName,
        amount: parseFloat(formData.packageAmount),
        dueDate: new Date().toISOString().split('T')[0],
        type: 'Package Payment',
        packageName: formData.packageName,
        packageAmount: parseFloat(formData.packageAmount),
        cycle: 31,
        cycleCounter: parseInt(formData.cycleCounter.toString()),
        isFirstCollection: parseInt(formData.cycleCounter.toString()) === 1
      };

      await createCollection(collectionData);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Single collection posted successfully!'
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to post single collection'
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
            Post Single Collection
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
                        packageAmount: assignedPkg ? assignedPkg.amount.toString() : ''
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
              {packages.length === 0 ? (
                <option value="">No Collection package created yet</option>
              ) : (
                <>
                  <option value="">Select Package</option>
                  {packages
                    .filter(pkg => {
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
                </>
              )}
            </select>
            {packages.length === 0 && (
              <p className="text-xs text-amber-700 mt-1">
                ⚠️ No Collection packages found. Please create a Collection package under <strong>Package &gt; Collection</strong> first.
              </p>
            )}
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
              Automatically increments by 1 for single collection
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
              {loading ? 'Posting...' : 'Post Single Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SingleCollectionForm;
