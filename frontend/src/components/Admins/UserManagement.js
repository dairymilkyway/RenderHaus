import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './Sidebar';
import {
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import './css/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Confirmation checkboxes
  const [hasReadDeactivateNotice, setHasReadDeactivateNotice] = useState(false);
  const [hasReadDeleteNotice, setHasReadDeleteNotice] = useState(false);
  
  // Edit form
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    gender: 'other',
    isEmailVerified: false
  });

  // Add user form
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    gender: 'other'
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: usersPerPage.toString(),
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        verification: verificationFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`http://localhost:5000/api/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.data.users);
      setCurrentPage(data.data.pagination.currentPage);
      setTotalPages(data.data.pagination.totalPages);
      setTotalUsers(data.data.pagination.totalUsers);
      setError('');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }

      toast.success('User updated successfully!');
      setShowEditModal(false);
      fetchUsers(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Validate add user form
  const validateAddUserForm = () => {
    const errors = {};
    
    // Name validation
    if (!addUserForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (addUserForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!addUserForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addUserForm.email)) {
      errors.email = 'Invalid email format';
    }

    // Gender validation
    if (!addUserForm.gender) {
      errors.gender = 'Gender is required';
    }
    
    // Password validation
    if (!addUserForm.password) {
      errors.password = 'Password is required';
    } else if (addUserForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!addUserForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (addUserForm.password !== addUserForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new user
  const addUser = async () => {
    if (!validateAddUserForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const { confirmPassword, ...userData } = addUserForm;
      
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      toast.success('User created successfully!');
      setShowAddUserModal(false);
      setAddUserForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        gender: 'other'
      });
      setFormErrors({});
      fetchUsers(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle add user modal
  const openAddUserModal = () => {
    setShowAddUserModal(true);
    setAddUserForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      gender: 'other'
    });
    setFormErrors({});
  };

  // Toggle user status
  const handleToggleUserStatus = (user) => {
    // If deactivating, show confirmation modal
    if (user.isActive !== false) {
      setSelectedUser(user);
      setShowDeactivateModal(true);
      setHasReadDeactivateNotice(false);
    } else {
      // If activating, do it directly
      toggleUserStatus(user);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user status');
      }

      const action = data.data.user.isActive ? 'activated' : 'deactivated';
      toast.success(`User ${action} successfully!`);
      fetchUsers(currentPage);
      
      // Close modal if open
      setShowDeactivateModal(false);
      setHasReadDeactivateNotice(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Archive user
  const deleteUser = async () => {
    if (!hasReadDeleteNotice) {
      toast.error('Please read and acknowledge the notice before proceeding.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to archive user');
      }

      toast.success('User archived successfully!');
      setShowDeleteModal(false);
      setHasReadDeleteNotice(false);
      fetchUsers(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Restore archived user
  const restoreUser = async (user) => {
    if (!window.confirm(`Are you sure you want to restore ${user.name}? They will regain access to their account.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to restore user');
      }

      toast.success('User restored successfully!');
      fetchUsers(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Permanently delete user
  const permanentlyDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ PERMANENT DELETION WARNING ⚠️\n\nThis will PERMANENTLY delete ${user.name} and ALL their data. This action cannot be undone.\n\nType "DELETE" to confirm.`)) {
      return;
    }

    const confirmation = window.prompt('Type "DELETE" to confirm permanent deletion:');
    if (confirmation !== 'DELETE') {
      toast.error('Permanent deletion cancelled - confirmation text did not match.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to permanently delete user');
      }

      toast.success('User permanently deleted!');
      fetchUsers(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle search and filters
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setVerificationFilter('');
    setCurrentPage(1);
    fetchUsers(1);
  };

  // Handle edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      isEmailVerified: user.isEmailVerified
    });
    setShowEditModal(true);
  };

  // Handle delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    setHasReadDeleteNotice(false);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (user) => {
    if (user.deletedAt) {
      return (
        <span className="status-badge archived">
          <XCircleIcon className="status-icon" />
          Archived
        </span>
      );
    }
    
    return user.isActive ? (
      <span className="status-badge active">
        <CheckCircleIcon className="status-icon" />
        Active
      </span>
    ) : (
      <span className="status-badge inactive">
        <XCircleIcon className="status-icon" />
        Inactive
      </span>
    );
  };

  // Get role badge
  const getRoleBadge = (role) => {
    return (
      <span className={`role-badge ${role}`}>
        {role === 'admin' ? 'Admin' : 'User'}
      </span>
    );
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <div className="admin-content">
        <AdminNavbar />
        
        <div className="admin-main">
          <div className="user-management">
            {/* Header */}
            <div className="page-header">
              <div className="header-content">
                <div className="header-text">
                  <h1 className="page-title">
                    <UserGroupIcon className="page-icon" />
                    User Management
                  </h1>
                  <p className="page-subtitle">
                    Manage and monitor all users in your system
                  </p>
                </div>
                <button className="btn-primary" onClick={openAddUserModal}>
                  <UserPlusIcon className="btn-icon" />
                  Add New User
                </button>
              </div>

              {/* Stats Cards */}
              <div className="stats-row">
                <div className="stat-card">
                  <span className="stat-label">Total Users</span>
                  <span className="stat-value">{totalUsers}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Active Users</span>
                  <span className="stat-value">
                    {users.filter(u => u.isActive !== false).length}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Admin Users</span>
                  <span className="stat-value">
                    {users.filter(u => u.role === 'admin').length}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Verified Users</span>
                  <span className="stat-value">
                    {users.filter(u => u.isEmailVerified).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="search-box">
                <MagnifyingGlassIcon className="search-icon" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="search-btn">
                  Search
                </button>
              </div>

              <div className="filter-controls">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status (Active + Inactive)</option>
                  <option value="all">All Users (Including Archived)</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Verification Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>

                <button onClick={clearFilters} className="btn-secondary">
                  <FunnelIcon className="btn-icon" />
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <span>Loading users...</span>
                </div>
              ) : error ? (
                <div className="error-state">
                  <ExclamationTriangleIcon className="error-icon" />
                  <span>{error}</span>
                </div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Email Verified</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="user-info">
                              <span className="user-name">{user.name}</span>
                              <span className="user-email">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user)}</td>
                        <td>
                          <span className={`email-verification-badge ${user.isEmailVerified ? 'verified' : 'unverified'}`}>
                            {user.isEmailVerified ? (
                              <>
                                <CheckCircleIcon className="verification-icon" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="verification-icon" />
                                Unverified
                              </>
                            )}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            {user.deletedAt ? (
                              // Archived user actions
                              <>
                                <button
                                  onClick={() => restoreUser(user)}
                                  className="btn-icon-only restore"
                                  title="Restore User"
                                >
                                  <CheckCircleIcon className="action-icon" />
                                </button>
                                <button
                                  onClick={() => permanentlyDeleteUser(user)}
                                  className="btn-icon-only permanent-delete"
                                  title="Permanently Delete User"
                                >
                                  <TrashIcon className="action-icon" />
                                </button>
                              </>
                            ) : (
                              // Active/Inactive user actions
                              <>
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="btn-icon-only edit"
                                  title="Edit User"
                                >
                                  <PencilIcon className="action-icon" />
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(user)}
                                  className={`btn-icon-only ${user.isActive !== false ? 'deactivate' : 'activate'}`}
                                  title={user.isActive !== false ? 'Deactivate User' : 'Activate User'}
                                >
                                  {user.isActive !== false ? (
                                    <XCircleIcon className="action-icon" />
                                  ) : (
                                    <CheckCircleIcon className="action-icon" />
                                  )}
                                </button>
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="btn-icon-only delete"
                                  title="Archive User"
                                >
                                  <TrashIcon className="action-icon" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => {
                    setCurrentPage(prev => prev - 1);
                    fetchUsers(currentPage - 1);
                  }}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <ChevronLeftIcon className="pagination-icon" />
                  Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage(prev => prev + 1);
                    fetchUsers(currentPage + 1);
                  }}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                  <ChevronRightIcon className="pagination-icon" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-name">Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-email">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-gender">Gender</label>
                <select
                  id="edit-gender"
                  value={editForm.gender}
                  onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                  className="form-select"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-role">Role</label>
                <select
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="form-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.isEmailVerified}
                    onChange={(e) => setEditForm({...editForm, isEmailVerified: e.target.checked})}
                    className="form-checkbox"
                  />
                  <span className="checkmark"></span>
                  Email Verified
                </label>
                <small className="form-help">
                  Check this to mark the user's email as verified. This will allow them full access to the platform.
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={updateUser}
                className="btn-primary"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setFormErrors({});
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="add-name">Full Name *</label>
                <input
                  id="add-name"
                  type="text"
                  value={addUserForm.name}
                  onChange={(e) => {
                    setAddUserForm({...addUserForm, name: e.target.value});
                    if (formErrors.name) {
                      setFormErrors({...formErrors, name: ''});
                    }
                  }}
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                  placeholder="Enter user's full name"
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="add-email">Email Address *</label>
                <input
                  id="add-email"
                  type="email"
                  value={addUserForm.email}
                  onChange={(e) => {
                    setAddUserForm({...addUserForm, email: e.target.value});
                    if (formErrors.email) {
                      setFormErrors({...formErrors, email: ''});
                    }
                  }}
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  placeholder="Enter user's email address"
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="add-gender">Gender *</label>
                <select
                  id="add-gender"
                  value={addUserForm.gender}
                  onChange={(e) => {
                    setAddUserForm({...addUserForm, gender: e.target.value});
                    if (formErrors.gender) {
                      setFormErrors({...formErrors, gender: ''});
                    }
                  }}
                  className={`form-select ${formErrors.gender ? 'error' : ''}`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {formErrors.gender && <span className="error-text">{formErrors.gender}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="add-password">Password *</label>
                <input
                  id="add-password"
                  type="password"
                  value={addUserForm.password}
                  onChange={(e) => {
                    setAddUserForm({...addUserForm, password: e.target.value});
                    if (formErrors.password) {
                      setFormErrors({...formErrors, password: ''});
                    }
                  }}
                  className={`form-input ${formErrors.password ? 'error' : ''}`}
                  placeholder="Enter a secure password (min. 6 characters)"
                />
                {formErrors.password && <span className="error-text">{formErrors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="add-confirm-password">Confirm Password *</label>
                <input
                  id="add-confirm-password"
                  type="password"
                  value={addUserForm.confirmPassword}
                  onChange={(e) => {
                    setAddUserForm({...addUserForm, confirmPassword: e.target.value});
                    if (formErrors.confirmPassword) {
                      setFormErrors({...formErrors, confirmPassword: ''});
                    }
                  }}
                  className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm the password"
                />
                {formErrors.confirmPassword && <span className="error-text">{formErrors.confirmPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="add-role">Role</label>
                <select
                  id="add-role"
                  value={addUserForm.role}
                  onChange={(e) => setAddUserForm({...addUserForm, role: e.target.value})}
                  className="form-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <small className="form-help">
                  Users have basic access, Admins can manage other users and system settings
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setFormErrors({});
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                className="btn-primary"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal modal-danger">
            <div className="modal-header">
              <h3>Archive User Account</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setHasReadDeleteNotice(false);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="danger-content">
                <ExclamationTriangleIcon className="danger-icon" />
                <h4>⚠️ ARCHIVE USER ACCOUNT</h4>
                
                <div className="notice-section">
                  <p><strong>You are about to archive the user account for:</strong></p>
                  <div className="user-details">
                    <p><strong>Name:</strong> {selectedUser?.name}</p>
                    <p><strong>Email:</strong> {selectedUser?.email}</p>
                    <p><strong>Role:</strong> {selectedUser?.role}</p>
                  </div>
                  
                  <div className="warning-text">
                    <h5>� ARCHIVING CONSEQUENCES:</h5>
                    <ul>
                      <li><strong>ACCOUNT DEACTIVATION:</strong> The user will immediately lose access to their account and all associated services.</li>
                      <li><strong>DATA PRESERVATION:</strong> All user data, projects, and content will be preserved but hidden from normal operations.</li>
                      <li><strong>REVERSIBLE ACTION:</strong> This account can be restored later if needed using the restore function.</li>
                      <li><strong>VISIBILITY:</strong> The user will be hidden from normal user lists but visible in archived user view.</li>
                      <li><strong>EMAIL REUSE:</strong> If someone registers with the same email, the archived account will be restored.</li>
                    </ul>
                  </div>
                  
                  <div className="alternative-notice">
                    <p><strong>💡 NOTE:</strong> This is a reversible action. The user can be restored from the archived users section if needed.</p>
                  </div>
                  
                  <div className="confirmation-checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={hasReadDeleteNotice}
                        onChange={(e) => setHasReadDeleteNotice(e.target.checked)}
                        className="confirmation-checkbox-input"
                      />
                      <span className="checkmark"></span>
                      I understand that this will archive the user account and they will lose access immediately.
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setHasReadDeleteNotice(false);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                disabled={!hasReadDeleteNotice}
                className={`btn-danger ${!hasReadDeleteNotice ? 'disabled' : ''}`}
              >
                {hasReadDeleteNotice ? 'Archive User' : 'Please Read Notice First'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="modal-overlay">
          <div className="modal modal-warning">
            <div className="modal-header">
              <h3>Deactivate User Account</h3>
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setHasReadDeactivateNotice(false);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-content">
                <ExclamationTriangleIcon className="warning-icon" />
                <h4>⚠️ Account Deactivation Notice</h4>
                
                <div className="notice-section">
                  <p><strong>You are about to deactivate the user account for:</strong></p>
                  <div className="user-details">
                    <p><strong>Name:</strong> {selectedUser?.name}</p>
                    <p><strong>Email:</strong> {selectedUser?.email}</p>
                    <p><strong>Role:</strong> {selectedUser?.role}</p>
                  </div>
                  
                  <div className="deactivation-notice">
                    <h5>📋 What happens when you deactivate this account:</h5>
                    <ul>
                      <li><strong>IMMEDIATE ACCESS SUSPENSION:</strong> The user will be immediately logged out and unable to sign in to their account.</li>
                      <li><strong>DATA PRESERVATION:</strong> All user data, projects, and work history will be preserved in the system for future reference or potential reactivation.</li>
                      <li><strong>SERVICE INTERRUPTION:</strong> The user will lose access to all platform features, tools, and services associated with their account.</li>
                      <li><strong>COLLABORATION IMPACT:</strong> If this user is involved in shared projects or teams, their absence may affect ongoing collaborative work.</li>
                      <li><strong>NOTIFICATIONS DISABLED:</strong> The user will stop receiving email notifications and system updates.</li>
                      <li><strong>API ACCESS REVOKED:</strong> Any API keys or integrations associated with this account will be temporarily disabled.</li>
                      <li><strong>REVERSIBLE ACTION:</strong> Unlike deletion, account deactivation can be reversed. You can reactivate this account at any time, and the user will regain full access to their preserved data and settings.</li>
                    </ul>
                  </div>
                  
                  <div className="recommendation-notice">
                    <p><strong>💡 RECOMMENDATION:</strong> Account deactivation is the preferred method for temporarily suspending user access while preserving their work and maintaining system integrity. This action should be taken when you need to restrict access but may want to restore it in the future.</p>
                  </div>
                  
                  <div className="confirmation-checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={hasReadDeactivateNotice}
                        onChange={(e) => setHasReadDeactivateNotice(e.target.checked)}
                        className="confirmation-checkbox-input"
                      />
                      <span className="checkmark"></span>
                      I have read and understand the impact of deactivating this user account. I confirm that I have proper authorization to perform this action and understand it will immediately suspend the user's access to the platform.
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setHasReadDeactivateNotice(false);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => toggleUserStatus(selectedUser)}
                disabled={!hasReadDeactivateNotice}
                className={`btn-warning ${!hasReadDeactivateNotice ? 'disabled' : ''}`}
              >
                {hasReadDeactivateNotice ? 'Deactivate User Account' : 'Please Read Notice First'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
