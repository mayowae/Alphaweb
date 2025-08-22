"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import '../../../../../global.css';
import Swal from "sweetalert2";
import { collaboratorForgotPassword, collaboratorResendOtp } from "../../../../../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const proceed = async () => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email address."
      });
      return;
    }
    try {
      const result = await collaboratorForgotPassword(email);
      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: result.message || "Check your email for the OTP.",
        showConfirmButton: false,
        timer: 2000
      });
      setTimeout(() => {
        router.push("/collaborator/verify-otp");
      }, 2000);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to send OTP",
        text: error?.message || "An error occurred."
      });
    }
  };

  useEffect(() => {
    document.body.style.backgroundImage = "url('/images/body-bg.png')";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundColor = "#4E37FB";

    return () => {
        document.body.style.backgroundImage = "";
        document.body.style.backgroundRepeat = "";
        document.body.style.backgroundSize = "";
        document.body.style.backgroundPosition = "";
        document.body.style.backgroundColor = "";
    };
    }, []);
  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      <div className="flex justify-center items-center h-screen">
        <div className="w-full md:w-5/12">
            <div className="item-card">
                <div className="flex justify-center">
                    <img src="/images/logo.png" alt="" />
                </div>
                <div className="card-body mt-3">
                    <h1 className="card-title text-center text-black">Forgot password</h1>
                    <p className="card-description text-center mt-2">Enter the email connected to your account.</p>
                    <form action="" className="mt-5">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" id="email" 
                            className="input-field" 
                            placeholder="johndoe@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                             />
                        </div>
                        <div className="form-group mt-3">
                            <button type="button" onClick={proceed} className="auth-btn">Get OTP</button>
                        </div>
                        <div className="form-group mt-3 text-center">
                            <span className="text-sm">Didn't receive OTP?</span>&nbsp;&nbsp;
                            <button type="button" className="auth-link" style={{background: 'none', border: 'none', color: '#4E37FB', cursor: 'pointer', padding: 0}} onClick={async () => {
                              if (!email) {
                                Swal.fire({
                                  icon: "warning",
                                  title: "Email required",
                                  text: "Please enter your email address."
                                });
                                return;
                              }
                              try {
                                const result = await collaboratorResendOtp(email);
                                Swal.fire({
                                  icon: "success",
                                  title: "OTP Resent",
                                  text: result.message || "Check your email for the OTP.",
                                  showConfirmButton: false,
                                  timer: 2000
                                });
                              } catch (error: any) {
                                Swal.fire({
                                  icon: "error",
                                  title: "Failed to resend OTP",
                                  text: error?.message || "An error occurred."
                                });
                              }
                            }}>Resend Otp</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
