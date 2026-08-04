"use client";

import React, { useState, useEffect } from 'react';
import { X, Lock, Plus } from 'lucide-react';
import { createCollection, fetchCustomers, fetchPackages } from '../services/api';

type Row = {
  customerName: string;
  packageName: string;
  packageAmount: string;
  dueDate: string;
  cycleCounter: string;
};

const EMPTY_ROW: Row = {
  customerName: '',
  packageName: '',
  packageAmount: '',
  dueDate: '',
  cycleCounter: '1',
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function BulkCollectionForm({ isOpen, onClose, onSuccess }: Props) {
  const [rows, setRows] = useState<Row[]>([{ ...EMPTY_ROW }]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [collectionPackages, setCollectionPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setRows([{ ...EMPTY_ROW }]);

    fetchCustomers()
      .then((res) => setCustomers((res as any)?.customers || (Array.isArray(res) ? res : [])))
      .catch(() => setCustomers([]));

    fetchPackages('Collection')
      .then((res: any) => setCollectionPackages(res.packages || []))
      .catch(() => setCollectionPackages([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const updateRow = (idx: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const handleCustomerChange = (idx: number, customerName: string) => {
    const customer = customers.find((c) => (c.fullName || c.name) === customerName);
    if (customer) {
      const pkgName = customer.packageName && customer.packageName !== '—' ? customer.packageName : '';
      const pkgAmt  = customer.packageAmount != null ? String(customer.packageAmount) : '';
      updateRow(idx, { customerName, packageName: pkgName, packageAmount: pkgAmt });
    } else {
      updateRow(idx, { customerName, packageName: '', packageAmount: '' });
    }
  };

  const addRow    = () => setRows((p) => [...p, { ...EMPTY_ROW }]);
  const removeRow = (idx: number) => setRows((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      for (const r of rows) {
        if (!r.customerName || !r.packageAmount) continue;
        await createCollection({
          customerName: r.customerName,
          amount: Number(r.packageAmount || 0),
          dueDate: r.dueDate,
          type: r.packageName || 'Savings Collection',
          packageName: r.packageName,
        });
      }
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Bulk Collection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
            {rows.map((r, i) => {
              const customer = customers.find((c) => (c.fullName || c.name) === r.customerName);
              const hasPackage = Boolean(customer?.packageName && customer.packageName !== '—');

              return (
                <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {/* Customer */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Customer *</label>
                    <select
                      value={r.customerName}
                      onChange={(e) => handleCustomerChange(i, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    >
                      <option value="">Select customer</option>
                      {customers.map((c: any) => (
                        <option key={c.id} value={c.fullName || c.name}>{c.fullName || c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Package Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      Package {hasPackage && <Lock className="h-3 w-3 text-gray-400" />}
                    </label>
                    {hasPackage ? (
                      <input
                        type="text"
                        value={r.packageName}
                        readOnly
                        className="w-full border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-sm text-gray-600 cursor-not-allowed"
                        title="Prefilled from customer's registered package"
                      />
                    ) : (
                      <select
                        value={r.packageName}
                        onChange={(e) => {
                          const pkg = collectionPackages.find((p: any) => p.name === e.target.value);
                          updateRow(i, {
                            packageName: e.target.value,
                            packageAmount: pkg ? String(pkg.amount) : r.packageAmount,
                          });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select</option>
                        {collectionPackages.map((pkg: any) => (
                          <option key={pkg.id} value={pkg.name}>{pkg.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Package Amount */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      Amount {hasPackage && <Lock className="h-3 w-3 text-gray-400" />}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₦</span>
                      <input
                        type="number"
                        step="0.01"
                        value={r.packageAmount}
                        onChange={(e) => !hasPackage && updateRow(i, { packageAmount: e.target.value })}
                        readOnly={hasPackage}
                        className={`w-full border rounded-lg pl-5 pr-2 py-1.5 text-sm ${
                          hasPackage
                            ? 'border-gray-200 bg-white text-gray-600 cursor-not-allowed'
                            : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={r.dueDate}
                      onChange={(e) => updateRow(i, { dueDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Remove */}
                  <div className="flex items-end">
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="w-full px-2 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Row */}
          <button
            type="button"
            onClick={addRow}
            className="mt-3 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <Plus className="h-4 w-4" />
            Add another customer
          </button>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
