import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import TutorialModal from './TutorialModal';

const XIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

interface NavbarProps {
  mobile?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ mobile = false }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  if (mobile) {
    return (
      <>
        <nav className="fixed top-4 left-4 right-4 z-40 bg-white/80 backdrop-blur-md border border-apple-border/60 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-apple-gray/50 flex items-center justify-center">
                <img
                  src="/images/logo-icon.png"
                  alt="BlockSlice Logo"
                  className="w-5 h-5 object-contain rounded"
                />
              </div>
              <span className="text-base font-semibold text-apple-text">
                BlockSlice
              </span>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTutorial(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-apple-gray text-apple-subtext hover:text-apple-text transition-all duration-200"
                aria-label="AI Tutorial"
              >
                <Sparkles size={18} />
              </button>
              <a
                href="https://x.com/onebtcdesign"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-apple-gray text-apple-subtext hover:text-apple-blue transition-all duration-200"
                aria-label="Follow us on X (Twitter)"
              >
                <XIcon />
              </a>
            </div>
          </div>
        </nav>
        <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      </>
    );
  }

  return (
    <>
      <nav className="flex flex-col gap-4 bg-white rounded-[24px] md:rounded-[32px] border border-apple-border/60 p-3 items-center w-16 flex-shrink-0">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-apple-gray/50 flex items-center justify-center">
            <img
              src="/images/logo-icon.png"
              alt="BlockSlice Logo"
              className="w-6 h-6 object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-apple-border/40" />

        {/* Icons */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setShowTutorial(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-apple-gray text-apple-subtext hover:text-apple-text transition-all duration-200"
            aria-label="AI Tutorial"
          >
            <Sparkles size={20} />
          </button>
          <a
            href="https://x.com/onebtcdesign"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-apple-gray text-apple-subtext hover:text-apple-blue transition-all duration-200"
            aria-label="Follow us on X (Twitter)"
          >
            <XIcon />
          </a>
        </div>
      </nav>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
    </>
  );
};

export default Navbar;
