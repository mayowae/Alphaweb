"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  fetchCustomerWalletById,
  fetchCustomerWallets,
  fetchCharges,
  fetchLoans,
  fetchInvestments,
  fetchCollections,
  createCollection,
  createWalletTransaction,
  updateLoanStatus,
  updateInvestmentApplicationStatus,
  assignCharge,
} from '../../../../../services/api'

type TabKey = 'collection' | 'loan' | 'investment' | 'charges' | 'wallet'

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = useMemo(() => Number(params?.id), [params])

  const [active, setActive] = useState<TabKey>('collection')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customer, setCustomer] = useState<any | null>(null)
  const [walletStats, setWalletStats] = useState<any | null>(null)
  const [collections, setCollections] = useState<any[]>([])
  const [loans, setLoans] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [charges, setCharges] = useState<any[]>([])

  const loadAll = async () => {
    if (!customerId) return
    try {
      setLoading(true)
      setError(null)

      const [walletRes] = await Promise.all([
        fetchCustomerWalletById(customerId).catch(() => null),
      ])

      setCustomer(walletRes?.customer || walletRes || null)
      setWalletStats(walletRes?.wallet || walletRes || null)

      // Fetch lists with filters where supported (fallback to client-side filter)
      const [colRes, loanRes, invRes, chgRes] = await Promise.all([
        fetchCollections().catch(() => []),
        fetchLoans({ search: String(customerId) }).catch(() => []),
        fetchInvestments().catch(() => []),
        fetchCharges().catch(() => []),
      ])

      // Normalize any API response shape into an array
      const normalize = (res: any): any[] => {
        if (Array.isArray(res)) return res
        if (Array.isArray(res?.data)) return res.data
        if (Array.isArray(res?.rows)) return res.rows
        if (Array.isArray(res?.list)) return res.list
        return []
      }

      const idStr = String(customerId)
      const filterByCustomer = (arr: any[]) => normalize(arr).filter((r: any) =>
        String(r.customerId || r.customer?.id || r.customer)?.includes(idStr) ||
        String(r.accountNumber || '').includes(idStr) ||
        String(r.customerName || '').includes(customer?.fullName || '')
      )

      setCollections(filterByCustomer(colRes))
      setLoans(filterByCustomer(loanRes))
      setInvestments(filterByCustomer(invRes))
      setCharges(filterByCustomer(chgRes))
    } catch (e: any) {
      setError(e?.message || 'Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  const [amount, setAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [showPostSidebar, setShowPostSidebar] = useState(false)
  const [showWithdrawSidebar, setShowWithdrawSidebar] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showApplyCharge, setShowApplyCharge] = useState(false)
  const [applyChargeAmount, setApplyChargeAmount] = useState('')

  const handlePostToCollection = async () => {
    if (!customerId || !amount) return
    setLoading(true)
    try {
      await createCollection({ customerName: String(customerId), amount: Number(amount), dueDate: new Date().toISOString(), type: paymentMethod })
      await loadAll()
    } catch (e) {
      // ignore visual toast here for brevity
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!customerId || !withdrawAmount) return
    setLoading(true)
    try {
      await createWalletTransaction({ type: 'debit', amount: Number(withdrawAmount), description: `Withdrawal for customer ${customerId}` })
      await loadAll()
    } finally {
      setLoading(false)
    }
  }

  const handleApproveLoan = async (loanId: number) => {
    setLoading(true)
    try {
      await updateLoanStatus(loanId, { status: 'Approved' })
      await loadAll()
    } finally { setLoading(false) }
  }

  const handleRejectLoan = async (loanId: number) => {
    setLoading(true)
    try {
      await updateLoanStatus(loanId, { status: 'Rejected' })
      await loadAll()
    } finally { setLoading(false) }
  }

  const handleApproveInvestment = async (id: number) => {
    setLoading(true)
    try {
      await updateInvestmentApplicationStatus(id, { status: 'Approved' })
      await loadAll()
    } finally { setLoading(false) }
  }

  const handleRejectInvestment = async (id: number) => {
    setLoading(true)
    try {
      await updateInvestmentApplicationStatus(id, { status: 'Rejected' })
      await loadAll()
    } finally { setLoading(false) }
  }

  const handleApplyCharge = async (chargeId: number, amountStr: string) => {
    setLoading(true)
    try {
      await assignCharge({ chargeName: String(chargeId), amount: amountStr, dueDate: new Date().toISOString(), customer: String(customerId) })
      await loadAll()
    } finally { setLoading(false) }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen font-['Inter']">
      <button onClick={() => router.push('/dashboard/(pages)/customer')} className="text-indigo-600 text-sm mb-4">‹ Back to customers</button>

      <div className="flex items-start justify-between bg-white border rounded p-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{customer?.fullName || 'Customer'}</h1>
          <p className="text-xs text-gray-500 mt-1">Account {customer?.accountNumber || customerId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md bg-indigo-50 text-indigo-700 text-sm">View profile</button>
          <button onClick={() => setShowPostSidebar(true)} className="px-3 py-2 rounded-md bg-indigo-700 text-white text-sm">Post to collection</button>
          <div className="relative">
            <button onClick={()=>setMenuOpen((v)=>!v)} className="w-9 h-9 flex items-center justify-center rounded-md border">⋯</button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-10">
                <button onClick={()=>{/* open edit customer later */}} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Edit customer</button>
                <button onClick={()=>setShowApplyCharge(true)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Apply charges</button>
                <button onClick={()=>{/* reassign placeholder */}} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Reassign customer</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div className="bg-[#F6F5FF] border border-gray-100 rounded p-4">
          <p className="text-xs text-gray-500">Live wallet balance</p>
          <p className="text-lg font-semibold mt-2">₦{Number(walletStats?.balance || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#FFF8EB] border border-gray-100 rounded p-4">
          <p className="text-xs text-gray-500">Collection wallet balance</p>
          <p className="text-lg font-semibold mt-2">₦{Number(walletStats?.collectionBalance || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#FFF1F2] border border-gray-100 rounded p-4">
          <p className="text-xs text-gray-500">Loan wallet balance</p>
          <p className="text-lg font-semibold mt-2">{Number(walletStats?.loanUnits || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#FFF8EB] border border-gray-100 rounded p-4">
          <p className="text-xs text-gray-500">Investment wallet balance</p>
          <p className="text-lg font-semibold mt-2">₦{Number(walletStats?.investmentBalance || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 border-b">
        <nav className="flex gap-6 text-sm">
          {(['collection','loan','investment','charges','wallet'] as TabKey[]).map((k) => (
            <button key={k} onClick={() => setActive(k)} className={`pb-3 ${active===k? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-600'}`}>{k === 'wallet' ? 'Wallet activity' : k.charAt(0).toUpperCase()+k.slice(1)}</button>
          ))}
        </nav>
      </div>

      {error && <div className="mt-4 p-3 bg-red-50 border text-sm text-red-700">{error}</div>}

      {/* Panels */}
      {active === 'collection' && (
        <div className="mt-6">
          <div className="bg-white rounded border">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-6">
                <p className="text-sm font-semibold">Collection details</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select className="bg-[#e9e6ff] text-indigo-600 text-sm rounded px-3 py-2 pr-8">
                    <option>Export</option>
                    <option>PDF</option>
                    <option>CSV</option>
                  </select>
                </div>
                <button onClick={() => setShowWithdrawSidebar(true)} className="px-3 py-2 rounded border text-sm">Process withdrawal</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-5">
              <div>
                <p className="text-xs text-gray-500">Package name</p>
                <p className="text-sm mt-1">{customer?.packageName || 'Alpha 1K'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Collection days</p>
                <p className="text-sm mt-1">{customer?.collectionDays || 'Daily'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">collection Period</p>
                <p className="text-sm mt-1">{customer?.collectionPeriod || '360 days'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Collection amount</p>
                <p className="text-sm mt-1">₦{Number(customer?.collectionAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total amount paid</p>
                <p className="text-sm mt-1">₦{Number(collections.reduce((s:any,c:any)=> s + (Number(c.amount)||0),0)).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Start date</p>
                <p className="text-sm mt-1">{customer?.startDate ? new Date(customer.startDate).toLocaleDateString() : '23/04/2024'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">End date</p>
                <p className="text-sm mt-1">{customer?.endDate ? new Date(customer.endDate).toLocaleDateString() : '23/04/2025'}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-stretch gap-3 px-4 pb-3">
              <button className="flex items-center gap-2 px-3 py-2 border rounded text-sm"><img src="/icons/filter.png"/>Filter</button>
              <div className="relative md:ml-auto w-full md:w-80">
                <input className="w-full border rounded pl-8 pr-3 py-2 text-sm" placeholder="Search"/>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="p-2 text-left">Transaction ID</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Package</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((r:any, i:number) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{r.reference || r.id || `COL-${i+1}`}</td>
                        <td className="p-2">{r.type || 'Collection'}</td>
                        <td className="p-2">{r.packageName || 'Nil'}</td>
                        <td className="p-2">₦{Number(r.amount||0).toLocaleString()}</td>
                        <td className="p-2">{r.date ? new Date(r.date).toLocaleDateString() : ''}</td>
                        <td className="p-2 text-green-600">{r.status || 'Completed'}</td>
                      </tr>
                    ))}
                    {collections.length===0 && <tr><td className="p-2 text-gray-400">No Collection activities</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {active === 'loan' && (
        <div className="mt-6 bg-white p-4 rounded border">
          <p className="text-sm font-semibold mb-3">Loan activities</p>
          {loans.length===0 && <p className="text-sm text-gray-500">No Loan activities</p>}
          <div className="space-y-3">
            {loans.map((l:any)=> (
              <div key={l.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <p className="text-sm">Loan amount ₦{Number(l.loanAmount||l.amount||0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Status: {l.status}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={()=>handleApproveLoan(l.id)} className="px-3 py-1.5 bg-green-600 text-white rounded text-xs">Approve loan</button>
                  <button onClick={()=>handleRejectLoan(l.id)} className="px-3 py-1.5 bg-orange-600 text-white rounded text-xs">Reject loan</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'investment' && (
        <div className="mt-6 bg-white p-4 rounded border">
          <p className="text-sm font-semibold mb-3">Investment activities</p>
          {investments.length===0 && <p className="text-sm text-gray-500">No Investment activities</p>}
          <div className="space-y-3">
            {investments.map((inv:any)=> (
              <div key={inv.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <p className="text-sm">Target ₦{Number(inv.targetAmount||inv.amount||0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Status: {inv.status || inv.applicationStatus}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={()=>handleApproveInvestment(inv.id)} className="px-3 py-1.5 bg-green-600 text-white rounded text-xs">Approve investment</button>
                  <button onClick={()=>handleRejectInvestment(inv.id)} className="px-3 py-1.5 bg-orange-600 text-white rounded text-xs">Reject investment</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'charges' && (
        <div className="mt-6 bg-white p-4 rounded border">
          <p className="text-sm font-semibold mb-3">Charges activities</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="text-gray-500"><th className="p-2 text-left">Charge ID</th><th className="p-2">Amount</th><th className="p-2">Status</th><th className="p-2"></th></tr></thead>
              <tbody>
                {charges.map((c:any,i:number)=> (
                  <tr key={i} className="border-t">
                    <td className="p-2">{c.id || c.code || `C-${i+1}`}</td>
                    <td className="p-2">₦{Number(c.amount||0).toLocaleString()}</td>
                    <td className="p-2">{c.status || 'Pending'}</td>
                    <td className="p-2 text-right">
                      {(c.status||'Pending')==='Pending' && (
                        <button onClick={()=>handleApplyCharge(c.id || i+1, String(c.amount||0))} className="px-3 py-1.5 border rounded text-xs">Pay</button>
                      )}
                    </td>
                  </tr>
                ))}
                {charges.length===0 && <tr><td className="p-2 text-gray-400">No charges</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {active === 'wallet' && (
        <div className="mt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-2/3 bg-white p-4 rounded border">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-xs text-gray-500">Level</p><p className="text-sm">{walletStats?.accountLevel || 'Tier 1'}</p></div>
                <div><p className="text-xs text-gray-500">Current balance</p><p className="text-sm">₦{Number(walletStats?.balance||0).toLocaleString()}</p></div>
              </div>
              <p className="text-sm font-semibold mb-2">Wallet activities</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead><tr className="text-gray-500"><th className="p-2 text-left">Type</th><th className="p-2 text-left">Description</th><th className="p-2">Amount</th><th className="p-2">Direction</th></tr></thead>
                  <tbody>
                    {(walletStats?.transactions||[]).map((t:any,i:number)=> (
                      <tr key={i} className="border-t"><td className="p-2">{t.type}</td><td className="p-2">{t.description}</td><td className="p-2">₦{Number(t.amount||0).toLocaleString()}</td><td className="p-2">{t.direction|| (t.type==='credit'?'Credit':'Debit')}</td></tr>
                    ))}
                    {!walletStats?.transactions?.length && <tr><td className="p-2 text-gray-400">No wallet activities</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: Post to collection */}
      <div className={`fixed inset-0 z-40 ${showPostSidebar ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black transition-opacity ${showPostSidebar ? 'opacity-40' : 'opacity-0'}`}
          onClick={() => setShowPostSidebar(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform ${showPostSidebar ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!showPostSidebar}
        >
          <div className="flex items-center justify-between p-5 border-b">
            <p className="text-base font-semibold">Post to collection</p>
            <button onClick={()=>setShowPostSidebar(false)} className="text-gray-500">✕</button>
          </div>
          <div className="p-5">
            <label className="text-xs text-gray-700">Amount</label>
            <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="N 0" className="w-full border rounded px-3 py-2 mt-1"/>
            <label className="text-xs text-gray-700 mt-4 block">Payment method</label>
            <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="w-full border rounded px-3 py-2 mt-1">
              <option>Cash</option>
              <option>Transfer</option>
            </select>
          </div>
          <div className="p-5 border-t">
            <button onClick={async()=>{await handlePostToCollection(); setShowPostSidebar(false)}} disabled={loading} className="w-full bg-indigo-600 text-white rounded px-3 py-2 text-sm">Post to collection</button>
          </div>
        </aside>
      </div>

      {/* Sidebar: Process withdrawal */}
      <div className={`fixed inset-0 z-40 ${showWithdrawSidebar ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black transition-opacity ${showWithdrawSidebar ? 'opacity-40' : 'opacity-0'}`}
          onClick={() => setShowWithdrawSidebar(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform ${showWithdrawSidebar ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!showWithdrawSidebar}
        >
          <div className="flex items-center justify-between p-5 border-b">
            <p className="text-base font-semibold">Process withdrawal</p>
            <button onClick={()=>setShowWithdrawSidebar(false)} className="text-gray-500">✕</button>
          </div>
          <div className="p-5">
            <label className="text-xs text-gray-700">Withdraw to</label>
            <select className="w-full border rounded px-3 py-2 mt-1"><option>Cash</option></select>
            <label className="text-xs text-gray-700 mt-4 block">Amount</label>
            <input value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} placeholder="N 0.0" className="w-full border rounded px-3 py-2 mt-1"/>
          </div>
          <div className="p-5 border-t">
            <button onClick={async()=>{await handleWithdraw(); setShowWithdrawSidebar(false)}} disabled={loading} className="w-full bg-indigo-600 text-white rounded px-3 py-2 text-sm">Withdraw</button>
          </div>
        </aside>
      </div>

      {/* Sidebar: Apply charges */}
      <div className={`fixed inset-0 z-40 ${showApplyCharge ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black transition-opacity ${showApplyCharge ? 'opacity-40' : 'opacity-0'}`}
          onClick={() => setShowApplyCharge(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform ${showApplyCharge ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!showApplyCharge}
        >
          <div className="flex items-center justify-between p-5 border-b">
            <p className="text-base font-semibold">Apply charges</p>
            <button onClick={()=>setShowApplyCharge(false)} className="text-gray-500">✕</button>
          </div>
          <div className="p-5">
            <label className="text-xs text-gray-700">Charge amount</label>
            <input value={applyChargeAmount} onChange={e=>setApplyChargeAmount(e.target.value)} placeholder="N 0" className="w-full border rounded px-3 py-2 mt-1"/>
            <label className="text-xs text-gray-700 mt-4 block">Due date</label>
            <input type="date" className="w-full border rounded px-3 py-2 mt-1"/>
          </div>
          <div className="p-5 border-t">
            <button onClick={async()=>{await handleApplyCharge(Date.now(), applyChargeAmount || '0'); setShowApplyCharge(false)}} disabled={loading} className="w-full bg-indigo-600 text-white rounded px-3 py-2 text-sm">Apply charge</button>
          </div>
        </aside>
      </div>
    </div>
  )
}


