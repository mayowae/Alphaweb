"use client"
import React, { useState } from 'react';

// The main App component that renders the settings page.
export default function App() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(true);

  const handleToggleTwoFactor = () => {
    setIsTwoFactorEnabled(!isTwoFactorEnabled);
  };

  const handlePasswordChange = () => {
    alert("This would open a password change dialog.");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.")) {
      alert("Account deletion process initiated.");
    }
  };

  // Function to toggle the sidebar's visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
    <div>
        {/* Header section with page title and subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your settings and profiles</p>
        </div>
    </div>
    <div className="bg-white rounded-xl shadow-lg w-full p-10">
        {/* Tab navigation bar */}
        <div className="flex border-b border-gray-200 mb-8">
          {['Profile', 'General', 'Security', 'Subscription'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-6 py-3 -mb-px text-lg font-medium leading-5 transition-colors duration-200 ease-in-out
                ${activeTab === tab 
                  ? 'border-b-4 border-indigo-600 text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <div>
          {activeTab === 'Profile' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile details</h2>
              
              {/* Profile details section */}
              <div className="flex items-center space-x-6 mb-8">
                {/* Profile picture */}
                <div className="flex-shrink-0 w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
                  <img
                    className="object-cover w-full h-full"
                    src="https://placehold.co/80x80/E2E8F0/1A202C?text=P" // Placeholder image
                    alt="Profile"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Jackot Microfinance Bank</h3>
                  <p className="text-sm text-gray-500">john.buggy@jackotmicrofinance.com</p>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-x-12 gap-y-6">
                <div className="space-y-1">
                  <label htmlFor="organization-name" className="block text-sm font-medium text-gray-700">
                    Organization name
                  </label>
                  <input
                    type="text"
                    id="organization-name"
                    value="Jackot Microfinance Bank"
                    readOnly
                    className="mt-1 block w-full md:w-[50%] rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 text-gray-600"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value="john.buggy@jackotmicrofinance.com"
                    readOnly
                    className="mt-1 block w-full md:w-[50%] rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 text-gray-600"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="role-1" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role-1"
                    value="Super administrator"
                    readOnly
                    className="mt-1 block w-full md:w-[50%] rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 text-gray-600"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="role-2" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role-2"
                    value="Admin"
                    readOnly
                    className="mt-1 block w-full md:w-[50%] rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Save changes button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save changes
                </button>
              </div>
            </div>
          )}
          {activeTab === 'General' && (
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">General</h2>
              
                {/* Currency and Time Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Currency and time</h2>
                
                {/* Base Currency Dropdown */}
                <div className="mb-4">
                    <label htmlFor="base-currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Base currency
                    </label>
                    <select
                        id="base-currency"
                        className="mt-1 block w-full pl-3 pr-[24px] py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        defaultValue="NGN N"
                        >
                        <option>NGN N</option>
                        <option>USD $</option>
                        <option>EUR €</option>
                    </select>
                </div>

                {/* Time Zone Dropdown */}
                <div>
                    <label htmlFor="time-zone" className="block text-sm font-medium text-gray-700 mb-1">
                    Time Zone
                    </label>
                    <select
                    id="time-zone"
                    className="mt-1 block w-full pl-3 pr-[24px] py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    defaultValue="West African GMT +1"
                    >
                    <option>West African GMT +1</option>
                    <option>Coordinated Universal Time (UTC)</option>
                    <option>Eastern Time (ET)</option>
                    </select>
                </div>
                </div>

                {/* Payment Details Section */}
                <div className="bg-white p-6 rounded-lg mt-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                    <h2 className="text-xl font-semibold text-gray-800">Payment details</h2>
                    <p className="text-sm text-gray-500">Connected payment accounts</p>
                    </div>
                    <button type='button' onClick={toggleSidebar} className="flex items-center text-indigo-600 font-medium text-sm hover:text-indigo-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New payment
                    </button>
                </div>

                {/* Payment Card 1 (Debit/Credit Card) */}
                <div className="flex items-center p-4 mb-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex-shrink-0 mr-4">
                    {/* Card Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path d="M4 12h16m-16 0V6a2 2 0 012-2h12a2 2 0 012 2v6m-16 0v6a2 2 0 002 2h12a2 2 0 002-2v-6m-16 0H4a2 2 0 01-2-2v-2a2 2 0 012-2h16a2 2 0 012 2v2a2 2 0 01-2 2z"/>
                    </svg>
                    </div>
                    <div className="flex-grow">
                    <h3 className="text-base font-medium text-gray-900">Oluwaseun Adejobi - UBA</h3>
                    <p className="text-sm text-gray-500">Debit/Credit Card</p>
                    <p className="text-xs text-gray-400 mt-1">Manual payment - Powered by <a href="#" className="text-indigo-600 hover:underline">Paystack</a></p>
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                    {/* Edit Icon SVG */}
                    <button className="text-gray-500 hover:text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {/* Delete Icon SVG */}
                    <button className="text-gray-500 hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    </div>
                </div>

                {/* Payment Card 2 (Live Wallet) */}
                <div className="flex items-center p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex-shrink-0 mr-4">
                    {/* Wallet Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                    </div>
                    <div className="flex-grow">
                    <h3 className="text-base font-medium text-gray-900">Oluwaseun Adejobi - Paga</h3>
                    <p className="text-sm text-gray-500">Live wallet</p>
                    <p className="text-xs text-gray-400 mt-1">Manual payment - Powered by <a href="#" className="text-indigo-600 hover:underline">Paystack</a></p>
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                    {/* Edit Icon SVG */}
                    <button className="text-gray-500 hover:text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {/* Delete Icon SVG */}
                    <button className="text-gray-500 hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    </div>
                </div>

                </div>
            </div>
          )}
          {activeTab === 'Security' && (
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Security</h2>
              
                {/* Change Password Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                        <h2 className="text-lg font-semibold text-gray-800">Change password</h2>
                        <p className="text-sm text-gray-500 mt-1 max-w-md">
                            Click to change email. You will need to authenticate with your authenticator to proceed.
                        </p>
                        </div>
                        <button 
                        onClick={handlePasswordChange}
                        className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                        >
                        Change password
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-5">
                        <div>
                        <h2 className="text-lg font-semibold text-gray-800">Two-factor authentication</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            This is automatically turned on to give you an extra layer of security.
                        </p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={isTwoFactorEnabled} 
                            onChange={handleToggleTwoFactor} 
                            />
                            <div 
                            className={`block h-8 w-14 rounded-full transition-colors duration-200 ease-in-out
                            ${isTwoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            />
                            <div 
                            className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
                            ${isTwoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                        </div>
                        </label>
                    </div>
                </div>

                {/* Delete Account Section */}
                <div className="bg-white p-6 rounded-lg mt-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-500 max-w-md">
                    After deleting your account, you will lose access to our services and all your personal data will be permanently deleted.
                    </p>
                    <button 
                    onClick={handleDeleteAccount}
                    className="text-red-600 font-medium hover:text-red-800 transition-colors"
                    >
                    Delete my account
                    </button>
                </div>
                </div>

            </div>
          )}
        </div>

        {/* Sidebar and Overlay */}
      {/* The sidebar will slide in from the right */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6">
          {/* Sidebar header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add new payment</h2>
            {/* Close button for the sidebar */}
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar form content */}
          <div className="space-y-4">
            {/* Payment type dropdown */}
            <div>
              <label htmlFor="payment-type" className="block text-sm font-medium text-gray-700">Payment type</label>
              <select id="payment-type" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                <option>Auto-renew</option>
                <option>One-time payment</option>
              </select>
            </div>

            {/* Payment method dropdown */}
            <div>
              <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">Payment method</label>
              <select id="payment-method" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                <option>Card</option>
                <option>Live wallet</option>
              </select>
            </div>

            {/* Card number input */}
            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card number</label>
              <input type="text" id="card-number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="2345 6565 5678 2345" />
            </div>

            {/* Expiry date and CVV inputs */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">Expiry date</label>
                <input type="text" id="expiry-date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="23/25" />
              </div>
              <div className="flex-1">
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
                <input type="text" id="cvv" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="645" />
              </div>
            </div>
          </div>

          {/* Add payment button */}
          <div className="mt-8">
            <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-200">
              Add payment
            </button>
          </div>
        </div>
      </div>

      {/* Overlay to dim the background */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-opacity-50 z-40 transition-opacity duration-300"
        />
      )}
      </div>
    </>
  );
}
