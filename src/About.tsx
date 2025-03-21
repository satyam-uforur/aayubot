import { Link } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';

export default function About() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-800">AayuBot</h1>
            </Link>
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li><Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link></li>
              </ul>
            </nav>
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {isMenuOpen && (
            <nav className="md:hidden mt-4">
              <ul className="flex flex-col space-y-2">
                <li><Link to="/" className="block text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
                <li><Link to="/about" className="block text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link></li>
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <TypeAnimation
              sequence={[
                'About AayuBot',
                1000,
                'Your AI Medical Assistant',
                1000,
                'Revolutionizing Healthcare',
                1000,
              ]}
              wrapper="h1"
              speed={50}
              className="text-4xl font-bold text-blue-800"
              repeat={Infinity}
            />
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Revolutionizing Healthcare with AI-Powered Medical Assistance</h2>
            <p className="text-gray-600 mb-6">
              In today's fast-paced world, access to accurate and reliable medical information is more important than ever. AayuBot is an advanced AI-powered chatbot designed to transform the way we diagnose medical conditions and access essential healthcare information.
            </p>

            <h2 className="text-2xl font-bold text-blue-800 mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Instant Medical Information</h3>
                <p className="text-blue-700">Quick and accurate responses to medical queries, providing real-time results for medicine information.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Comprehensive Database</h3>
                <p className="text-blue-700">Extensive collection of medical and pharmaceutical data with detailed insights.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">AI-Driven Assistance</h3>
                <p className="text-blue-700">Advanced algorithms help identify potential health conditions and treatment options.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">24/7 Accessibility</h3>
                <p className="text-blue-700">Available around the clock for immediate access to medical information.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-blue-800 mb-4">Who Can Benefit?</h2>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li>Patients seeking reliable medical information</li>
              <li>Healthcare professionals needing quick reference</li>
              <li>Medical students enhancing their knowledge</li>
              <li>Caregivers managing medications for others</li>
            </ul>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">The Future of AayuBot</h2>
              <p className="text-gray-600">
                AayuBot is continuously evolving with upcoming features including voice assistance, multilingual support, and integration with wearable health devices. Our mission is to make reliable healthcare information accessible to everyone.
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try AayuBot Now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}