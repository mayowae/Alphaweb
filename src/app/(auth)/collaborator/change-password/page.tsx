"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import '../../../../../global.css';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (newPassword !== retypePassword) {
      console.log("Passwords do not match!");
      return;
    }
    console.log("New password set successfully!");
    // router.push("/login");
  };

  useEffect(() => {
    // Set the background styling for the body.
    document.body.style.backgroundImage = "url('/images/body-bg.png')";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundColor = "#4E37FB";

    // Cleanup function to revert the styles when the component unmounts.
    return () => {
        document.body.style.backgroundImage = "";
        document.body.style.backgroundRepeat = "";
        document.body.style.backgroundSize = "";
        document.body.style.backgroundPosition = "";
        document.body.style.backgroundColor = "";
    };
  }, []);

  const updatePassword = ()=>{
    console.log("Password updated successfully");
    router.push("/collaborator/login");
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      <div className="flex justify-center items-center h-screen">
        <div className="w-full md:w-5/12">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex justify-center">
              <img src="/images/logo.png" alt="" />
            </div>

            <div className="mt-6">
              <h1 className="text-3xl font-bold text-center text-gray-800">Enter password</h1>
              <p className="text-center text-gray-500 mt-2">
                Enter your new password
              </p>

              <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }} className="mt-8">
                <div className="relative mb-4">
                  <label htmlFor="new-password" className="block text-gray-700 font-semibold mb-2">New password</label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-7 cursor-pointer"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                        <img src="/icons/show.png" className="hide-icon" />
                    ) : (
                        <img src="/icons/hide.png" className="hide-icon" />
                    )}
                  </div>
                </div>
                
                {/* Retype Password Input */}
                <div className="relative mb-4">
                  <label htmlFor="retype-password" className="block text-gray-700 font-semibold mb-2">Retype password</label>
                  <input
                    type={showRetypePassword ? "text" : "password"}
                    id="retype-password"
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Retype new password"
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-7 cursor-pointer"
                    onClick={() => setShowRetypePassword(!showRetypePassword)}
                  >
                    {showRetypePassword ? (
                        <img src="/icons/show.png" className="hide-icon" />
                    ) : (
                        <img src="/icons/hide.png" className="hide-icon" />
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <button type="button" onClick={updatePassword}  className="w-full py-3 px-4 bg-[#4E37FB] text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
