import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, Shield, Info } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'mdh-cookie-consent';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);

    // Enable GTM dataLayer if not already present
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cookie_consent_update',
      consent_status: 'accepted'
    });
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsVisible(false);

    // Disable GTM tracking
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cookie_consent_update',
      consent_status: 'declined'
    });
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50"
        >
          <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl">
            <div className="relative p-3">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-0.5 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>

              <div className="pr-5">
                <div className="flex items-center gap-2 mb-2">
                  <Cookie className="text-blue-400 flex-shrink-0" size={16} />
                  <h3 className="text-xs font-semibold text-white">Cookies</h3>
                </div>

                <p className="text-xs text-gray-300 mb-2 leading-relaxed">
                  We use cookies for analytics. {' '}
                  {showDetails ? (
                    <span className="text-gray-400">
                      We collect page views, device info, and interactions. No personal data.
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowDetails(true)}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Details
                    </button>
                  )}
                </p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-3 py-1.5 text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
