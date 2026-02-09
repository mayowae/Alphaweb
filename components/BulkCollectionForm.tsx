"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createCollection } from '../services/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function BulkCollectionForm({ isOpen, onClose, onSuccess }: Props) {
  const [rows, setRows] = useState<Array<{ customerName: string; amount: string; dueDate: string; type: string }>>([
    { customerName: '', amount: '', dueDate: '', type: '' },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const setRow = (idx: number, key: keyof (typeof rows)[number], value: string) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };

  const addRow = () => setRows((p) => [...p, { customerName: '', amount: '', dueDate: '', type: '' }]);
  const removeRow = (idx: number) => setRows((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      for (const r of rows) {
        if (!r.customerName || !r.amount || !r.dueDate) continue;
        await createCollection({
          customerName: r.customerName,
          amount: Number(r.amount || 0),
          dueDate: r.dueDate,
          type: r.type || 'Savings Collection',
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
      <div className="bg-white w-full max-w-2xl rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Bulk Collection</h2>
          <button onClick={onClose} className="text-gray-500"><X className="h-5 w-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-auto pr-1">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end border p-2 rounded">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Customer</label>
                <input value={r.customerName} onChange={(e)=>setRow(i,'customerName', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Full name"/>
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Amount</label>
                <input type="number" value={r.amount} onChange={(e)=>setRow(i,'amount', e.target.value)} className="w-full border rounded px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Due date</label>
                <input type="date" value={r.dueDate} onChange={(e)=>setRow(i,'dueDate', e.target.value)} className="w-full border rounded px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Type</label>
                <select value={r.type} onChange={(e)=>setRow(i,'type', e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Select type</option>
                  <option value="Savings Collection">Savings Collection</option>
                  <option value="Loan Repayment">Loan Repayment</option>
                  <option value="Investment Return">Investment Return</option>
                  <option value="Fee Collection">Fee Collection</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={()=>removeRow(i)} className="px-3 py-2 border rounded text-sm">Remove</button>
                {i === rows.length-1 && (
                  <button type="button" onClick={addRow} className="px-3 py-2 border rounded text-sm">Add</button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading? 'Saving...' : 'Save All'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


