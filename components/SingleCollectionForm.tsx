"use client";

import React, { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';
import { createCollection, fetchCustomers, fetchPackages } from '../services/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function SingleCollectionForm({ isOpen, onClose, onSuccess }: Props) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [collectionPackages, setCollectionPackages] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [form, setForm] = useState({
    customerName: '',
    packageName: '',
    packageAmount: '',
    dueDate: '',
    cycleCounter: '1',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Reset form on open
    setSelectedCustomer(null);
    setForm({ customerName: '', packageName: '', packageAmount: '', dueDate: '', cycleCounter: '1' });

    fetchCustomers()
      .then((res) => setCustomers((res as any)?.customers || (Array.isArray(res) ? res : [])))
      .catch(() => setCustomers([]));

    fetchPackages('Collection')
      .then((res: any) => setCollectionPackages(res.packages || []))
      .catch(() => setCollectionPackages([]));
  }, [isOpen]);

  // When a customer is chosen, prefill their registered package
  const handleCustomerChange = (customerName: string) => {
    const customer = customers.find(
      (c) => (c.fullName || c.name) === customerName
    );
    setSelectedCustomer(customer || null);

    if (customer) {
      const pkgName  = customer.packageName && customer.packageName !== '—' ? customer.packageName : '';
      const pkgAmt   = customer.packageAmount != null ? String(customer.packageAmount) : '';
      setForm((prev) => ({
        ...prev,
        customerName,
        packageName: pkgName,
        packageAmount: pkgAmt,
      }));
    } else {
      setForm((prev) => ({ ...prev, customerName, packageName: '', packageAmount: '' }));
    }
  };

  if (!isOpen) return null;

  const hasPackage = Boolean(selectedCustomer?.packageName && selectedCustomer.packageName !== '—');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCollection({
        customerName: form.customerName,
        amount: Number(form.packageAmount || 0),
        dueDate: form.dueDate,
        type: form.packageName || 'Savings Collection',
        packageName: form.packageName,
      });
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Post Single Collection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <select
              value={form.customerName}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select customer</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.fullName || c.name}>
                  {c.fullName || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Package Name — prefilled & locked if customer has a package */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Package Name <span className="text-red-500">*</span>
              {hasPackage && <Lock className="h-3.5 w-3.5 text-gray-400 ml-1" />}
            </label>
            {hasPackage ? (
              <input
                type="text"
                value={form.packageName}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 cursor-not-allowed"
              />
            ) : (
              /* Fallback: if customer has no package, let them pick from Collection packages */
              collectionPackages.length === 0 ? (
                <div className="w-full border border-amber-300 bg-amber-50 rounded-lg px-3 py-2 text-sm text-amber-700">
                  No Collection packages available. Please create one first.
                </div>
              ) : (
                <select
                  value={form.packageName}
                  onChange={(e) => {
                    const pkg = collectionPackages.find((p: any) => p.name === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      packageName: e.target.value,
                      packageAmount: pkg ? String(pkg.amount) : prev.packageAmount,
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Package</option>
                  {collectionPackages.map((pkg: any) => (
                    <option key={pkg.id} value={pkg.name}>{pkg.name}</option>
                  ))}
                </select>
              )
            )}
            {hasPackage && (
              <p className="text-xs text-indigo-500 mt-1">
                ✓ Prefilled from customer's registered package
              </p>
            )}
          </div>

          {/* Package Amount — prefilled & locked */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Package Amount <span className="text-red-500">*</span>
              {hasPackage && <Lock className="h-3.5 w-3.5 text-gray-400 ml-1" />}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₦</span>
              <input
                type="number"
                step="0.01"
                value={form.packageAmount}
                onChange={(e) => !hasPackage && setForm({ ...form, packageAmount: e.target.value })}
                readOnly={hasPackage}
                className={`w-full border rounded-lg pl-7 pr-3 py-2 text-sm ${
                  hasPackage
                    ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                }`}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Cycle Counter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cycle Counter</label>
            <input
              type="number"
              min="1"
              value={form.cycleCounter}
              onChange={(e) => setForm({ ...form, cycleCounter: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">Automatically increments by 1 for single collection</p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.customerName || !form.packageName || !form.packageAmount}
              className="px-5 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Posting...' : 'Post Single Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
