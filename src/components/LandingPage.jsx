import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col items-center justify-center px-2 sm:px-4 py-8">
      {/* Branding Section */}
      <div className="flex flex-col md:flex-row items-center w-full max-w-3xl mb-8 md:mb-10 gap-4 md:gap-0">
        <div className="flex-1 flex justify-center mb-4 md:mb-0">
          <img src="/logo.png" alt="Moondala Logo" className="h-24 w-24 sm:h-32 sm:w-32 object-contain" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Moondala</h1>
          <p className="text-base sm:text-lg text-gray-300">Social Commerce • Shared Profits</p>
        </div>
        <div className="flex-1 flex flex-row md:flex-col items-center md:items-end gap-2 mt-2 md:mt-0">
          <button className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded mb-0 md:mb-2 w-full md:w-auto">Login</button>
          <button className="flex-1 md:flex-none bg-gray-700 hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded w-full md:w-auto">Create Account</button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-4xl text-center mb-12">
        <h2 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
          One App. Endless Possibilities.
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Chat with friends, discover unique shops, buy what you love, and earn from referrals. 
          Why use 10 apps when you only need one?
        </p>
      </div>

      {/* Shop Preview Image */}
      <div className="w-full max-w-4xl mb-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          <img 
            src="/images/shop-preview.png" 
            alt="Browse shops like Asiya Shop - Fashion, Electronics & More" 
            className="w-full h-auto"
          />
          <div className="p-6 text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50">
            <p className="text-sm sm:text-base text-gray-200">
              Discover amazing shops like <span className="font-semibold text-purple-300">Asiya Shop</span> and thousands more
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
          <h3 className="text-xl font-semibold mb-2 text-purple-300">💬 Social Connection</h3>
          <p className="text-gray-400 text-sm">Message friends, share your finds, and build your community</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-pink-500 transition-colors">
          <h3 className="text-xl font-semibold mb-2 text-pink-300">🛍️ Shop Your Favorites</h3>
          <p className="text-gray-400 text-sm">Browse unique stores with custom layouts and curated collections</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
          <h3 className="text-xl font-semibold mb-2 text-blue-300">💰 Earn While You Shop</h3>
          <p className="text-gray-400 text-sm">Get cashback, refer friends, and earn commission on their purchases</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors">
          <h3 className="text-xl font-semibold mb-2 text-green-300">🔒 Secure & Protected</h3>
          <p className="text-gray-400 text-sm">Shop with confidence with buyer protection and secure payments</p>
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
