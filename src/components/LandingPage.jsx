import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-2 sm:px-4">
      {/* Branding Section */}
      <div className="flex flex-col md:flex-row items-center w-full max-w-3xl mb-8 md:mb-10 gap-4 md:gap-0">
        <div className="flex-1 flex justify-center mb-4 md:mb-0">
          <img src="/logo.png" alt="Moondala Logo" className="h-24 w-24 sm:h-32 sm:w-32 object-contain" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Moondala</h1>
          <p className="text-base sm:text-lg text-gray-300">Social Commerce • Shared Profits</p>
        </div>
        <div className="flex-1 flex flex-row md:flex-col items-center md:items-end gap-2 mt-2 md:mt-0">
          <button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded mb-0 md:mb-2 w-full md:w-auto">Login</button>
          <button className="flex-1 md:flex-none bg-gray-700 hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded w-full md:w-auto">Create Account</button>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-2xl space-y-6 sm:space-y-8 mb-8 md:mb-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">Join as User</h2>
          <p className="text-gray-400 text-sm sm:text-base">Shop, earn rewards, and build your network</p>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">Earn Rewards</h2>
          <p className="text-gray-400 text-sm sm:text-base">Get cashback and exclusive deals on every purchase</p>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">Referral Network</h2>
          <p className="text-gray-400 text-sm sm:text-base">Invite friends and earn commission on their purchases</p>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">Secure Shopping</h2>
          <p className="text-gray-400 text-sm sm:text-base">Shop with confidence with buyer protection</p>
        </div>
      </div>

      {/* Login Form Section */}
      <form className="w-full max-w-md bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email*</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john@example.com"
            className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password*</label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-base sm:text-lg">Sign In</button>
      </form>
    </div>
  );
}
