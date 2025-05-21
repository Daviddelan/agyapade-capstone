import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">InstitutionPro</h3>
            <p className="text-sm text-yellow-100">
              Transforming institutional operations with modern solutions
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-yellow-100 hover:text-yellow-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-yellow-100 hover:text-yellow-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-yellow-100 hover:text-yellow-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-yellow-100 hover:text-yellow-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-yellow-100 hover:text-yellow-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-yellow-100">Email: info@institutionpro.com</p>
            <p className="text-sm text-yellow-100">Phone: +233 123 456 789</p>
          </div>
        </div>
        <div className="border-t border-yellow-500 mt-8 pt-8 text-center">
          <p className="text-sm text-yellow-100">
            © 2024 InstitutionPro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
