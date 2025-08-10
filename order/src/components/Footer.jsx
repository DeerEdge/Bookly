import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BLogo from '../assets/B.png'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerVariants = {
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

  return (
    <motion.footer 
      className="bg-gray-900 text-white"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src={BLogo} 
                alt="Bookly" 
                className="w-10 h-10 mr-3"
              />
              <h3 className="text-2xl font-semibold">Bookly</h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-4 max-w-md">
              Streamline your business scheduling with our powerful appointment booking platform. 
              Connect with customers and grow your business effortlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/find-service" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Find a Service
                </Link>
              </li>
              <li>
                <Link to="/business-pricing" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Business Pricing
                </Link>
              </li>
              <li>
                <Link to="/manage/login" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Business Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">
                bookly.support@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-2 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Bookly. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
