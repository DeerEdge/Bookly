import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const BusinessPricingPage = () => {
  // Animation variants for smooth, consistent card animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar 
        activeTab="business-pricing"
        isPublic={true}
      />

      {/* Hero Section */}
      <motion.div 
        className="pt-24 pb-16 bg-green-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-8"
            variants={itemVariants}
          >
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl text-gray-900 mb-8 tracking-tight leading-tight"
            variants={itemVariants}
          >
            Business Pricing Plans
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Choose the perfect plan for your business size and needs. All plans include our core features to help you grow.
          </motion.p>
        </div>
      </motion.div>

      {/* Pricing Plans Section */}
      <motion.div 
        className="py-24 bg-white"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <motion.div 
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={itemVariants}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-2xl text-gray-900 mb-2 tracking-tight text-center">Starter</h4>
              <div className="text-4xl text-gray-900 mb-2 tracking-tight text-center">$19</div>
              <p className="text-gray-600 mb-6 text-center">per month</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 100 appointments/month
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic analytics
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email support
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mobile app access
                </li>
              </ul>
              <Link
                to="/manage/login"
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-light text-sm transition-colors duration-200 inline-block text-center"
              >
                Start Free Trial
              </Link>
            </motion.div>

            {/* Professional Plan */}
            <motion.div 
              className="bg-white border-2 border-blue-500 rounded-2xl p-8 shadow-xl relative"
              variants={itemVariants}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-light">Most Popular</span>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-2xl text-gray-900 mb-2 tracking-tight text-center">Professional</h4>
              <div className="text-4xl text-gray-900 mb-2 tracking-tight text-center">$49</div>
              <p className="text-gray-600 mb-6 text-center">per month</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited appointments
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom branding
                </li>
              </ul>
              <Link
                to="/manage/login"
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-light text-sm transition-colors duration-200 inline-block text-center"
              >
                Start Free Trial
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div 
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={itemVariants}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-2xl text-gray-900 mb-2 tracking-tight text-center">Enterprise</h4>
              <div className="text-4xl text-gray-900 mb-2 tracking-tight text-center">$99</div>
              <p className="text-gray-600 mb-6 text-center">per month</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Multi-location support
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  API access
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated account manager
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom integrations
                </li>
              </ul>
              <Link
                to="/manage/login"
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-light text-sm transition-colors duration-200 inline-block text-center"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

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
            Join businesses already using Bookly to streamline their operations and delight their customers.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link
              to="/manage/login"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-light text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default BusinessPricingPage
