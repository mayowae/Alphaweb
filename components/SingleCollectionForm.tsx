"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createCollection, fetchCustomers } from '../services/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function SingleCollectionForm({ isOpen, onClose, onSuccess }: Props) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({ customerName: '', amount: '', dueDate: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchCustomers()
      .then((res) => setCustomers((res as any)?.customers || (Array.isArray(res) ? (res as any) : [])))
      .catch(() => setCustomers([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCollection({
        customerName: form.customerName,
        amount: Number(form.amount || 0),
        dueDate: form.dueDate,
        type: form.type || 'Savings Collection',
      });
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-md rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Single Collection</h2>
          <button onClick={onClose} className="text-gray-500"><X className="h-5 w-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Customer</label>
            <select value={form.customerName} onChange={(e)=>setForm({...form, customerName: e.target.value})} className="w-full border rounded px-3 py-2">
              <option value="">Select customer</option>
              {customers.map((c:any)=> (
                <option key={c.id} value={c.fullName || c.name}>{c.fullName || c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Amount</label>
            <input type="number" value={form.amount} onChange={(e)=>setForm({...form, amount: e.target.value})} className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e)=>setForm({...form, dueDate: e.target.value})} className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})} className="w-full border rounded px-3 py-2">
              <option value="">Select type</option>
              <option value="Savings Collection">Savings Collection</option>
              <option value="Loan Repayment">Loan Repayment</option>
              <option value="Investment Return">Investment Return</option>
              <option value="Fee Collection">Fee Collection</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


