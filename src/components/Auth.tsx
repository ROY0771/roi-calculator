import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { LogIn, UserPlus, Users, Check, X, Trash2, Shield } from 'lucide-react';

interface User {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'revoked';
  createdAt: Date;
}

interface AuthProps {
  onLogin: (user: User) => void;
}

const ADMIN_PASSWORD = 'MESDA2024admin';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  useEffect(() => {
    if (mode === 'admin') {
      fetchUsers();
    }
  }, [mode]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAtValue = data.createdAt;
        let createdAtDate = new Date();
        if (createdAtValue && typeof createdAtValue === 'object' && 'toDate' in createdAtValue) {
          createdAtDate = (createdAtValue as { toDate: () => Date }).toDate();
        } else if (createdAtValue instanceof Date) {
          createdAtDate = createdAtValue;
        }
        userList.push({
          id: doc.id,
          name: (data.name as string) || '',
          company: (data.company as string) || '',
          email: (data.email as string) || '',
          phone: (data.phone as string) || '',
          status: (data.status as User['status']) || 'pending',
          createdAt: createdAtDate,
        });
      });
      setUsers(userList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !company || !email) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Check if email already exists
      const q = query(collection(db, 'users'), where('email', '==', email));
      const existing = await getDocs(q);
      if (!existing.empty) {
        setError('This email is already registered');
        setLoading(false);
        return;
      }
      
      await addDoc(collection(db, 'users'), {
        name,
        company,
        email,
        phone,
        status: 'pending',
        createdAt: new Date(),
      });
      
      setError('');
      alert('Registration submitted! Your account will be reviewed by MESDA.');
      setMode('login');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('No account found with this email');
        setLoading(false);
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (userData.status === 'pending') {
        setError('Your account is pending approval. Please wait for MESDA to review your registration.');
      } else if (userData.status === 'revoked') {
        setError('Your account access has been revoked. Please contact MESDA for assistance.');
      } else {
        // Save login state to localStorage
        const user: User = {
          id: userDoc.id,
          name: (userData.name as string) || '',
          company: (userData.company as string) || '',
          email: (userData.email as string) || '',
          phone: (userData.phone as string) || '',
          status: (userData.status as User['status']) || 'pending',
          createdAt: (() => {
            const val = userData.createdAt;
            if (val && typeof val === 'object' && 'toDate' in val) return (val as { toDate: () => Date }).toDate();
            return val instanceof Date ? val : new Date();
          })(),
        };
        localStorage.setItem('mesda_user', JSON.stringify(user));
        localStorage.setItem('mesda_login_time', Date.now().toString());
        onLogin(user);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleAdminLogin = () => {
    if (adminPassword !== ADMIN_PASSWORD) {
      setError('Invalid admin password');
      return;
    }
    setError('');
    // No need to set a state, just show the admin panel
  };

  const updateUserStatus = async (userId: string, status: 'approved' | 'revoked') => {
    try {
      await updateDoc(doc(db, 'users', userId), { status });
      fetchUsers();
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-mesda-primary rounded-xl p-3 mb-4">
            <span className="text-white font-bold text-2xl">MESDA</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ROI Calculator</h1>
          <p className="text-gray-500 mt-2">Crushing & Screening</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              mode === 'login' ? 'bg-mesda-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LogIn size={18} className="inline mr-2" />
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              mode === 'register' ? 'bg-mesda-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserPlus size={18} className="inline mr-2" />
            Register
          </button>
          <button
            onClick={() => { setMode('admin'); setError(''); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              mode === 'admin' ? 'bg-mesda-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Shield size={18} className="inline mr-2" />
            Admin
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mesda-input"
                placeholder="your@email.com"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mesda-btn disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mesda-input"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full mesda-input"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mesda-input"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (with country code)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mesda-input"
                placeholder="+84 123 456 789"
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full mesda-btn disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        )}

        {/* Admin Panel */}
        {mode === 'admin' && (
          <div>
            {users.length === 0 ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="flex-1 mesda-input"
                    placeholder="Enter admin password"
                  />
                  <button onClick={handleAdminLogin} className="mesda-btn-secondary">
                    Verify
                  </button>
                </div>
              </div>
            ) : null}
            
            {users.length > 0 || adminPassword === ADMIN_PASSWORD ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users size={20} className="text-mesda-primary" />
                  <h3 className="font-semibold">User Management</h3>
                </div>
                
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {users.map((user) => (
                      <div key={user.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.company}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.status === 'approved' ? 'bg-green-100 text-green-700' :
                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {user.status}
                            </span>
                            <div className="flex gap-1">
                              {user.status !== 'approved' && (
                                <button
                                  onClick={() => updateUserStatus(user.id, 'approved')}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                              )}
                              {user.status !== 'revoked' && user.status === 'approved' && (
                                <button
                                  onClick={() => updateUserStatus(user.id, 'revoked')}
                                  className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                                  title="Revoke"
                                >
                                  <X size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
