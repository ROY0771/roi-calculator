import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import Auth from './components/Auth';
import { exportToPDF, sendPDFToEmail } from './utils/pdfExport';
import { LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'revoked';
  createdAt: Date;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for existing login (30 days)
    const savedUser = localStorage.getItem('mesda_user');
    const loginTime = localStorage.getItem('mesda_login_time');
    
    if (savedUser && loginTime) {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const timeSinceLogin = Date.now() - parseInt(loginTime);
      
      if (timeSinceLogin < thirtyDays) {
        setUser(JSON.parse(savedUser));
      } else {
        // Login expired, clear storage
        localStorage.removeItem('mesda_user');
        localStorage.removeItem('mesda_login_time');
      }
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('mesda_user');
    localStorage.removeItem('mesda_login_time');
    setUser(null);
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleSendEmail = async () => {
    if (!user?.email) {
      alert('Please login to send PDF to your email');
      return;
    }
    
    try {
      await sendPDFToEmail(user.email);
    } catch (error) {
      console.error('Email send failed:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-mesda-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div>
      {/* User info bar */}
      <div className="bg-gray-800 text-white py-2 px-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Logged in as <strong>{user.name}</strong> ({user.company})
          </span>
          <span className="text-xs text-gray-400">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm hover:text-red-400 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Calculator with print area */}
      <div id="print-area">
        <Calculator onExportPDF={handleExportPDF} onSendEmail={handleSendEmail} />
      </div>
    </div>
  );
};

export default App;
