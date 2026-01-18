import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function UserReferralSignup() {
  const { referralCode } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    if (referralCode) {
      // Store referral code in localStorage for the signup flow
      localStorage.setItem("referralCode", referralCode);
      localStorage.setItem("referralMessage", 
        "🎁 Join our growing community! This referral link unlocks exclusive rewards. Sign up now and start earning!"
      );
    }
    
    // Navigate to login/signup with user mode
    nav("/login?mode=user&referral=" + referralCode, { replace: true });
  }, [referralCode, nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-slate-900">
      <div className="text-white text-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-yellow-400 rounded-full mx-auto mb-4"></div>
        <p>Redirecting you to sign up...</p>
      </div>
    </div>
  );
}
