"use client";

import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { createCollection, fetchCustomers, fetchPackages } from '../services/api';
import Swal from 'sweetalert2';

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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function SingleCollectionForm({ isOpen, onClose, onSuccess }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    selectedCustomerId: '',
    customerName: '',
    selectedPackageId: '',
    packageName: '',
    packageAmount: '',
    cycle: 31,
    cycleCounter: 1,
    dueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      selectedCustomerId: '',
      customerName: '',
      selectedPackageId: '',
      packageName: '',
      packageAmount: '',
      cycle: 31,
      cycleCounter: 1,
      dueDate: new Date().toISOString().split('T')[0],
    });
    fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [customersRes, packagesRes] = await Promise.all([
        fetchCustomers().catch(() => ({ customers: [] })),
        fetchPackages('Collection').catch(() => [])
      ]);
      const rawCusts = (customersRes as any).customers || (customersRes as any).data || customersRes || [];
      setCustomers(Array.isArray(rawCusts) ? rawCusts : []);

      const rawPkgs = ((packagesRes as any).packages || (packagesRes as any).data || packagesRes || []) as Package[];
      const collectionPkgs = (Array.isArray(rawPkgs) ? rawPkgs : []).filter(
        (p: any) => !p.packageCategory || p.packageCategory.toLowerCase() === 'collection'
      );
      setPackages(collectionPkgs);
    } catch (err) {
      console.error('Failed to fetch form data', err);
    }
  };

  const handleCustomerChange = (custId: string) => {
    if (!custId) {
      setForm(prev => ({ ...prev, selectedCustomerId: '', customerName: '', selectedPackageId: '', packageName: '', packageAmount: '' }));
      return;
    }
    const customer = customers.find(c => c.id.toString() === custId);
    if (!customer) return;

    let assignedPkg = null;
    const pkgId = customer.packageId || (customer as any).package_id || (customer as any).PackageId || (customer as any).Package?.id;
    if (pkgId) assignedPkg = packages.find(p => p.id.toString() === pkgId.toString());
    if (!assignedPkg && customer.packageName && customer.packageName !== '—' && customer.packageName !== '-') {
      assignedPkg = packages.find(p => p.name.toLowerCase() === customer.packageName!.toLowerCase());
    }
    const selectedPkg = assignedPkg || (packages.length > 0 ? packages[0] : null);

    setForm(prev => ({
      ...prev,
      selectedCustomerId: customer.id.toString(),
      customerName: customer.fullName || (customer as any).name || '',
      selectedPackageId: selectedPkg ? selectedPkg.id.toString() : '',
      packageName: selectedPkg ? selectedPkg.name : '',
      packageAmount: selectedPkg ? selectedPkg.amount.toString() : ''
    }));
  };

  const handlePackageChange = (pkgId: string) => {
    const selectedPackage = packages.find(p => p.id.toString() === pkgId);
    setForm(prev => ({
      ...prev,
      selectedPackageId: pkgId,
      packageName: selectedPackage?.name || '',
      packageAmount: selectedPackage ? selectedPackage.amount.toString() : prev.packageAmount
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.packageName || !form.packageAmount) {
      Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Please fill in all required fields.' });
      return;
    }
    setLoading(true);
    try {
      await createCollection({
        customerName: form.customerName,
        amount: parseFloat(form.packageAmount),
        dueDate: form.dueDate || new Date().toISOString().split('T')[0],
        type: 'Package Payment',
        packageName: form.packageName,
        packageAmount: parseFloat(form.packageAmount),
        cycle: parseInt(form.cycle.toString()) || 31,
        cycleCounter: parseInt(form.cycleCounter.toString()) || 1,
        isFirstCollection: parseInt(form.cycleCounter.toString()) === 1
      });
      Swal.fire({ icon: 'success', title: 'Success', text: 'Single collection posted successfully!' });
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to post collection' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Post Single Collection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <select
              value={form.selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              required
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName || (c as any).name}{c.accountNumber ? ` • ${c.accountNumber}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Package */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
            <select
              value={form.selectedPackageId}
              onChange={(e) => handlePackageChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              required
            >
              {packages.length === 0 ? (
                <option value="">No Collection package created yet</option>
              ) : (
                <>
                  <option value="">Select Package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name} - ₦{pkg.amount?.toLocaleString()}</option>
                  ))}
                </>
              )}
            </select>
            {packages.length === 0 && (
              <p className="text-xs text-amber-700 mt-1">
                ⚠️ No Collection packages found. Create one under <strong>Package &gt; Collection</strong> first.
              </p>
            )}
          </div>

          {/* Package Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package Amount *</label>
            <input
              type="number"
              value={form.packageAmount}
              onChange={(e) => setForm(prev => ({ ...prev, packageAmount: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              required
            />
          </div>

          {/* Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
            <input
              type="number"
              value={form.cycle}
              onChange={(e) => setForm(prev => ({ ...prev, cycle: parseInt(e.target.value) || 31 }))}
              min="1"
              max="365"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Total cycle length in days (default: 31)</p>
          </div>

          {/* Cycle Counter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cycle Counter</label>
            <input
              type="number"
              value={form.cycleCounter}
              onChange={(e) => setForm(prev => ({ ...prev, cycleCounter: parseInt(e.target.value) || 1 }))}
              min="1"
              max="365"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Current day in cycle</p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Posting...' : 'Post Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
