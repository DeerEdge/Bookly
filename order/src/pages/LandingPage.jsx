import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import apiService from '../services/api'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'


const LandingPage = () => {
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

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
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
        <div className="min-h-screen bg-white relative">
          {/* Navigation */}
          <Navbar isPublic={true} className="bg-transparent shadow-none" />

      {/* Hero Section */}
      <motion.div 
        className="relative min-h-screen flex items-center overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Siri-like Swirl Background for Hero */}
        <div className="swirl-bg-hero pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full relative z-10">
          <motion.h1 
            className="text-5xl md:text-6xl text-gray-900 mb-8 tracking-tight leading-tight"
            variants={textVariants}
          >
            Book Your Next
            <span className="block text-blue-600">Appointment</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={textVariants}
          >
            Book appointments instantly and manage your schedule with ease. 
            Simple scheduling for your business and customers.
          </motion.p>
          
          {/* Search bar temporarily commented out - will be re-enabled when search functionality is complete */}
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-900 mb-6 tracking-tight">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From finding services to managing your business, Lilly provides all the tools you need for seamless scheduling.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl text-gray-900 mb-4 tracking-tight">Find Services</h3>
              <p className="text-gray-600">Discover and book services from trusted businesses in your area.</p>
            </motion.div>
           
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl text-gray-900 mb-4 tracking-tight">Business Tools</h3>
              <p className="text-gray-600">Powerful tools to manage appointments, customers, and grow your business.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl text-gray-900 mb-4 tracking-tight">Instant Booking</h3>
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
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Join businesses and customers already using Lilly to streamline their scheduling.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
            <Link
              to="/manage/register"
              className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Register your Business
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  )
}


export default LandingPage