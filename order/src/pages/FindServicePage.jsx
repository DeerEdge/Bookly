import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import apiService from '../services/api'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FindServicePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef(null)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await apiService.searchBusinesses(searchQuery)
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleBusinessClick = (business) => {
    setShowSearchResults(false)
    setSearchQuery('')
    // Navigate to business page
    window.location.href = `/${business.slug || business.id}`
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar 
        activeTab="find-service"
        isPublic={true}
      />

      {/* Hero Section */}
      <motion.div 
        className="pt-24 pb-16 bg-blue-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl text-gray-900 mb-8 tracking-tight leading-tight"
            variants={itemVariants}
          >
            Find the Perfect Service
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Discover and book services from trusted businesses in your area. From beauty salons to home services, find exactly what you need.
          </motion.p>
          
          <motion.div 
            className="max-w-md mx-auto"
            variants={itemVariants}
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                className="w-full px-6 py-3 text-lg border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white"
                ref={searchRef}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isSearching ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <motion.div 
                  className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl mt-3 z-50 max-h-80 overflow-y-auto border border-gray-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {searchResults.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => handleBusinessClick(business)}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-blue-600 text-lg">
                            {business.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-gray-900 text-lg">{business.name}</h4>
                          <p className="text-gray-500">{business.description || 'No description available'}</p>
                        </div>
                        <div className="text-blue-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {showSearchResults && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
                <motion.div 
                  className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl mt-3 z-50 p-6 text-center text-gray-500 border border-gray-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  No businesses found matching "{searchQuery}"
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="text-lg text-gray-900 mb-3 tracking-tight">Browse Categories</h4>
              <p className="text-gray-600">Explore services by category - beauty, health, home, automotive, and more.</p>
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="text-lg text-gray-900 mb-3 tracking-tight">Read Reviews</h4>
              <p className="text-gray-600">See what others are saying about businesses and their services.</p>
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="text-lg text-gray-900 mb-3 tracking-tight">Compare Options</h4>
              <p className="text-gray-600">Compare prices, availability, and service quality across different providers.</p>
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="text-lg text-gray-900 mb-3 tracking-tight">Instant Booking</h4>
              <p className="text-gray-600">Book appointments instantly with real-time availability and confirmation.</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        className="py-24 bg-gray-50"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl text-gray-900 mb-8 tracking-tight"
            variants={itemVariants}
          >
            Ready to Find Your Service?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Start searching now to discover amazing businesses and book your next appointment.
          </motion.p>
        </div>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default FindServicePage
