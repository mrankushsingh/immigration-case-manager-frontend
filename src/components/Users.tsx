import { useState, useEffect } from 'react';
import { Plus, Users as UsersIcon, Trash2, Edit2, Shield, User as UserIcon, Mail, Calendar, CheckCircle, XCircle, Lock, Settings } from 'lucide-react';
import { api } from '../utils/api';
import { User } from '../types';
import ConfirmDialog from './ConfirmDialog';
import { showToast } from './Toast';
import { t } from '../utils/i18n';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ user: User | null; isOpen: boolean }>({ user: null, isOpen: false });
  const [userForm, setUserForm] = useState({ email: '', name: '', role: 'user' as 'admin' | 'user', firebase_uid: '' });
  const [saving, setSaving] = useState(false);
  const [passcodeForm, setPasscodeForm] = useState({ passcode: '', confirmPasscode: '' });
  const [savingPasscode, setSavingPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    // Listen for language changes to force re-render
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      showToast(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (error: any) {
      console.error('Failed to load current user:', error);
    }
  };

  const handleDeleteUser = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ user, isOpen: true });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.user) return;
    
    try {
      await api.deleteUser(deleteConfirm.user.id);
      await loadUsers();
      showToast(`User ${deleteConfirm.user.email} deleted successfully`, 'success');
      setDeleteConfirm({ user: null, isOpen: false });
    } catch (error: any) {
      showToast(error.message || 'Failed to delete user', 'error');
      setDeleteConfirm({ user: null, isOpen: false });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      name: user.name || '',
      role: user.role,
      firebase_uid: user.firebase_uid,
    });
    setShowCreateModal(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({ email: '', name: '', role: 'user', firebase_uid: '' });
    setShowCreateModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          email: userForm.email,
          name: userForm.name || undefined,
          role: userForm.role,
        });
        showToast('User updated successfully', 'success');
      } else {
        if (!userForm.firebase_uid) {
          showToast('Firebase UID is required', 'error');
          setSaving(false);
          return;
        }
        await api.createUser({
          email: userForm.email,
          name: userForm.name || undefined,
          role: userForm.role,
          firebase_uid: userForm.firebase_uid,
        });
        showToast('User created successfully', 'success');
      }
      setShowCreateModal(false);
      await loadUsers();
      setUserForm({ email: '', name: '', role: 'user', firebase_uid: '' });
    } catch (error: any) {
      showToast(error.message || 'Failed to save user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.updateUser(user.id, { active: !user.active });
      await loadUsers();
      showToast(`User ${user.active ? 'deactivated' : 'activated'} successfully`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update user', 'error');
    }
  };

  const handleToggleRole = async (user: User) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await api.updateUser(user.id, { role: newRole });
      await loadUsers();
      await loadCurrentUser(); // Reload current user in case we changed our own role
      showToast(`User role changed to ${newRole} successfully`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update user role', 'error');
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const hasAdmin = users.some(u => u.role === 'admin');
  const canChangeRoles = isAdmin || (!hasAdmin && currentUser?.firebase_uid); // Allow if admin, or if no admins exist

  const handleSetPaymentPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    
    if (!passcodeForm.passcode.trim()) {
      setPasscodeError('Passcode is required');
      return;
    }

    if (passcodeForm.passcode.length < 4) {
      setPasscodeError('Passcode must be at least 4 characters');
      return;
    }

    if (passcodeForm.passcode !== passcodeForm.confirmPasscode) {
      setPasscodeError('Passcodes do not match');
      return;
    }

    setSavingPasscode(true);
    try {
      await api.setPaymentPasscode(passcodeForm.passcode);
      showToast('Payment passcode updated successfully', 'success');
      setPasscodeForm({ passcode: '', confirmPasscode: '' });
      setPasscodeError('');
    } catch (error: any) {
      setPasscodeError(error.message || 'Failed to set payment passcode');
      showToast(error.message || 'Failed to set payment passcode', 'error');
    } finally {
      setSavingPasscode(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
      </div>
    );
  }

  // Show access denied if user is not admin (after loading)
  if (!loading && !isAdmin && hasAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('users.accessDenied')}</h2>
          <p className="text-gray-600">{t('users.adminOnly')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-amber-200/50 pb-4 sm:pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-2 tracking-tight">
            {t('users.title')}
          </h2>
          <p className="text-amber-700/80 text-base sm:text-lg font-medium">{t('users.subtitle')}</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreateUser}
            className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-amber-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
            style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
          >
            <Plus className="w-5 h-5" />
            <span>{t('users.newUser')}</span>
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="glass-gold rounded-xl sm:rounded-2xl p-8 sm:p-16 text-center animate-scale-in">
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-800 to-amber-700 bg-clip-text text-transparent mb-2">
            {t('users.noUsers')}
          </h3>
          <p className="text-amber-700/70 mb-6 sm:mb-8 text-base sm:text-lg font-medium">
            {t('users.createFirstUser')}
          </p>
          {isAdmin && (
            <button
              onClick={handleCreateUser}
              className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-amber-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-2xl transition-all shadow-xl"
              style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              {t('users.newUser')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="glass-gold rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:shadow-xl transition-all duration-200 border-2 border-amber-200/50 hover:border-amber-300/70 animate-slide-up"
              style={{ animationDelay: `${users.indexOf(user) * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-100 to-purple-200' : 'bg-gradient-to-br from-blue-100 to-blue-200'}`}>
                    {user.role === 'admin' ? (
                      <Shield className="w-6 h-6 text-purple-700" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-blue-700" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {user.name || user.email.split('@')[0]}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? t('users.admin') : t('users.user')}
                      </span>
                      {user.active ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>{t('users.active')}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>{t('users.inactive')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {(isAdmin || (canChangeRoles && user.firebase_uid === currentUser?.firebase_uid)) && (
                <div className="flex items-center space-x-2 pt-4 border-t border-amber-200/50">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-semibold"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>{t('common.edit')}</span>
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-semibold ${
                          user.active
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {user.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleToggleRole(user)}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                        title={user.role === 'admin' ? t('users.removeAdmin') : t('users.makeAdmin')}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      {user.firebase_uid !== currentUser?.firebase_uid && (
                        <button
                          onClick={(e) => handleDeleteUser(user, e)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                  {!hasAdmin && user.firebase_uid === currentUser?.firebase_uid && user.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleRole(user)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center space-x-2 text-sm font-semibold"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{t('users.makeFirstAdmin')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit User Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(15, 23, 42, 0.8) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingUser ? t('users.editUser') : t('users.createUser')}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('users.email')} *
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="user@example.com"
                  disabled={editingUser !== null}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('users.name')}
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder={t('users.namePlaceholder')}
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('users.firebaseUid')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.firebase_uid}
                    onChange={(e) => setUserForm({ ...userForm, firebase_uid: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder={t('users.firebaseUidPlaceholder')}
                  />
                  <p className="mt-1 text-xs text-gray-500">{t('users.firebaseUidHint')}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('users.role')} *
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  disabled={!isAdmin && !hasAdmin}
                >
                  <option value="user">{t('users.user')}</option>
                  <option value="admin">{t('users.admin')}</option>
                </select>
                {!isAdmin && !hasAdmin && editingUser && editingUser.firebase_uid === currentUser?.firebase_uid && (
                  <p className="mt-1 text-xs text-amber-600">{t('users.canMakeFirstAdmin')}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? t('common.loading') : (editingUser ? t('common.save') : t('users.createUser'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Passcode Settings (Admin Only) */}
      {isAdmin && (
        <div className="glass-gold rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-amber-200/50 animate-slide-up">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
              <Settings className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Payment Passcode Settings</h3>
              <p className="text-sm text-gray-600">Set the passcode required to access payment information</p>
            </div>
          </div>

          <form onSubmit={handleSetPaymentPasscode} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Passcode <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passcodeForm.passcode}
                onChange={(e) => {
                  setPasscodeForm({ ...passcodeForm, passcode: e.target.value });
                  setPasscodeError('');
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="Enter new passcode (min 4 characters)"
                minLength={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Passcode <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passcodeForm.confirmPasscode}
                onChange={(e) => {
                  setPasscodeForm({ ...passcodeForm, confirmPasscode: e.target.value });
                  setPasscodeError('');
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="Confirm new passcode"
                minLength={4}
              />
            </div>

            {passcodeError && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                {passcodeError}
              </div>
            )}

            <button
              type="submit"
              disabled={savingPasscode}
              className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {savingPasscode ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Update Payment Passcode</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={t('users.deleteUser')}
        message={deleteConfirm.user ? t('users.deleteConfirm', { email: deleteConfirm.user.email }) : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ user: null, isOpen: false })}
        type="warning"
      />
    </div>
  );
}

