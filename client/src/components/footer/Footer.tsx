const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Flipzon Brand */}
          <div>
            <h2 className="text-xl font-bold">Flipzon</h2>
            <p className="text-sm text-gray-400 mt-2">
              Your one-stop shop for all your needs.
            </p>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold">Customer Support</h3>
            <ul className="mt-2 space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Order Tracking
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Affiliate Program
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex gap-4 mt-2 flex-wrap">
              <a href="#" className="hover:text-blue-400">
                Facebook
              </a>
              <a href="#" className="hover:text-pink-400">
                Instagram
              </a>
              <a href="#" className="hover:text-blue-300">
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Flipzon. All rights reserved.</p>
          <p>Made with ❤️ for shopping lovers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
