"use client"
import React, { useEffect, useState } from 'react';

const SubscriptionPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Match the token storage pattern used across the rest of the app
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let token: string | null = null;
    
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        token = userObj.token || userObj.accessToken || null;
      } catch {
        token = null;
      }
    }
    
    // Fallback to other possible token keys
    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('merchantToken') || null;
    }

    if (!token) {
      setLoading(false);
      setError('Not authenticated. Please log in.');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/merchant/subscription`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { 
        if (d.success) {
          setData(d.data); 
        } else {
          setError(d.message || 'Failed to load subscription data.');
        }
        setLoading(false); 
      })
      .catch((err) => {
        setError('Network error. Please try again.');
        setLoading(false);
      });
  }, []);

  const formatNaira = (v: any) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(parseFloat(v || 0));

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const merchant = data?.merchant;
  const history = data?.history || [];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscription & Billing</h1>
        {data && (
          <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
             {data?.agentCount || 0} Agents
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400 py-12 text-center flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            Loading subscription data...
        </div>
      ) : error ? (
        <div className="text-red-500 py-12 text-center">{error}</div>
      ) : !merchant ? (
        <div className="text-gray-400 py-12 text-center">Could not load subscription data.</div>
      ) : (
        <div className="space-y-6">
          {merchant.trial_end_date && new Date(merchant.trial_end_date) > new Date() && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-indigo-700">
              🎁 You are on a <strong>free trial</strong> until <strong>{formatDate(merchant.trial_end_date)}</strong>.
              Enjoy full access!
            </div>
          )}

          {parseFloat(merchant.total_debt) > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center justify-between">
              <div>
                ⚠️ Outstanding balance: <strong>{formatNaira(merchant.total_debt)}</strong>.
                Please fund your wallet to avoid service interruption.
              </div>
              <button 
                onClick={() => window.location.href='/dashboard/wallet'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Fund Wallet
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Status', value: merchant.subscriptionStatus || merchant.subscription_status || 'Active', color: (merchant.subscriptionStatus || merchant.subscription_status) === 'Active' ? 'text-green-600' : 'text-red-600' },
                { label: 'Current Plan', value: merchant.plan ? `${merchant.plan.name} (₦${parseFloat(merchant.plan.pricing || 0).toLocaleString()})` : 'Starter Pack' },
                { label: 'Billing Cycle', value: 'Monthly (30 days)' },
                { label: 'Next Billing Date', value: formatDate(merchant.nextBillingDate || merchant.next_billing_date) },
                { label: 'Trial Ends', value: formatDate(merchant.trialEndDate || merchant.trial_end_date) },
                { label: 'Outstanding Debt', value: formatNaira(merchant.totalDebt || merchant.total_debt) },
              ].map(item => (
                <div key={item.label} className="flex flex-col">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className={`font-semibold text-[15px] ${(item as any).color || 'text-gray-900'}`}>{item.value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold text-[16px] mb-4">Billing History</h2>
            {history.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-gray-400 font-medium">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Plan</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h: any) => (
                        <tr key={h.id} className="border-b last:border-0">
                          <td className="py-4">{formatDate(h.createdAt)}</td>
                          <td className="py-4 font-medium">{h.plan?.name || 'Standard'}</td>
                          <td className="py-4">{formatNaira(h.amount)}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${h.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                              {h.status?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            ) : (
                <p className="text-gray-400 text-sm text-center py-6">
                  Your billing history will appear here once charges are generated.
                </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
