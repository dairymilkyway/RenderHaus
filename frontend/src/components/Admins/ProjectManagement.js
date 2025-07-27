import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './Sidebar';
import {
  CubeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ShareIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import './css/ProjectManagement.css';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [projectsPerPage] = useState(10);
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Confirmation checkboxes
  const [hasReadArchiveNotice, setHasReadArchiveNotice] = useState(false);
  const [hasReadDeleteNotice, setHasReadDeleteNotice] = useState(false);
  
  // Edit form
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: 'interior',
    status: 'draft'
  });

  // Fetch projects
  const fetchProjects = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: projectsPerPage.toString(),
        search: searchTerm,
        type: typeFilter,
        status: statusFilter,
        owner: ownerFilter,
        sortBy: 'lastModified',
        sortOrder: 'desc'
      });

      const response = await fetch(`http://localhost:5000/api/admin/projects?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects');
      }

      setProjects(data.data.projects);
      setCurrentPage(data.data.pagination.currentPage);
      setTotalPages(data.data.pagination.totalPages);
      setTotalProjects(data.data.pagination.totalProjects);
      setError('');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update project
  const updateProject = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/admin/projects/${selectedProject._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project');
      }

      toast.success('Project updated successfully!');
      setShowEditModal(false);
      fetchProjects(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Toggle project status
  const toggleProjectStatus = async (project) => {
    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = project.status === 'draft' ? 'completed' : 'draft';
      
      const response = await fetch(`http://localhost:5000/api/admin/projects/${project._id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project status');
      }

      toast.success(`Project status updated to ${newStatus}!`);
      fetchProjects(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Archive project
  const archiveProject = async () => {
    if (!hasReadArchiveNotice) {
      toast.error('Please read and acknowledge the notice before proceeding.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/admin/projects/${selectedProject._id}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to archive project');
      }

      toast.success('Project archived successfully!');
      setShowArchiveModal(false);
      setHasReadArchiveNotice(false);
      fetchProjects(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete project
  const deleteProject = async () => {
    if (!hasReadDeleteNotice) {
      toast.error('Please read and acknowledge the notice before proceeding.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/admin/projects/${selectedProject._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete project');
      }

      toast.success('Project deleted successfully!');
      setShowDeleteModal(false);
      setHasReadDeleteNotice(false);
      fetchProjects(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Restore archived project
  const restoreProject = async (project) => {
    if (!window.confirm(`Are you sure you want to restore ${project.name}? It will be accessible to the owner again.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/admin/projects/${project._id}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to restore project');
      }

      toast.success('Project restored successfully!');
      fetchProjects(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle search and filters
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProjects(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setOwnerFilter('');
    setCurrentPage(1);
    fetchProjects(1);
  };

  // Handle edit modal
  const openEditModal = (project) => {
    setSelectedProject(project);
    setEditForm({
      name: project.name,
      description: project.description,
      type: project.type,
      status: project.status
    });
    setShowEditModal(true);
  };

  // Handle view modal
  const openViewModal = (project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  // Handle archive modal
  const openArchiveModal = (project) => {
    setSelectedProject(project);
    setShowArchiveModal(true);
    setHasReadArchiveNotice(false);
  };

  // Handle delete modal
  const openDeleteModal = (project) => {
    setSelectedProject(project);
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
  const getStatusBadge = (project) => {
    // Check if project is archived first
    if (project.deletedAt) {
      return (
        <span className="status-badge archived">
          <ArchiveBoxIcon className="status-icon" />
          Archived
        </span>
      );
    }

    const statusConfig = {
      draft: { label: 'Draft', class: 'draft', icon: PencilIcon },
      'in-progress': { label: 'In Progress', class: 'in-progress', icon: CubeIcon },
      completed: { label: 'Completed', class: 'completed', icon: CheckCircleIcon },
      shared: { label: 'Shared', class: 'shared', icon: ShareIcon }
    };
    
    const config = statusConfig[project.status] || statusConfig.draft;
    const IconComponent = config.icon;
    
    return (
      <span className={`status-badge ${config.class}`}>
        <IconComponent className="status-icon" />
        {config.label}
      </span>
    );
  };

  // Get type badge
  const getTypeBadge = (type) => {
    const typeConfig = {
      interior: { label: 'Interior', class: 'interior' },
      exterior: { label: 'Exterior', class: 'exterior' },
      mixed: { label: 'Mixed', class: 'mixed' }
    };
    
    const config = typeConfig[type] || typeConfig.interior;
    
    return (
      <span className={`type-badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  useEffect(() => {
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <div className="admin-content">
        <AdminNavbar />
        
        <div className="admin-main">
          <div className="project-management">
            {/* Header */}
            <div className="page-header">
              <div className="header-content">
                <div className="header-text">
                  <h1 className="page-title">
                    <CubeIcon className="page-icon" />
                    Project Management
                  </h1>
                  <p className="page-subtitle">
                    Manage and monitor all projects in your system
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="stats-row">
                <div className="stat-card">
                  <span className="stat-label">Total Projects</span>
                  <span className="stat-value">{totalProjects}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Active Projects</span>
                  <span className="stat-value">
                    {projects.filter(p => p.status !== 'archived').length}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Completed Projects</span>
                  <span className="stat-value">
                    {projects.filter(p => p.status === 'completed').length}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Shared Projects</span>
                  <span className="stat-value">
                    {projects.filter(p => p.isPublic).length}
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
                  placeholder="Search projects by name or description..."
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
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                  <option value="mixed">Mixed</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="shared">Shared</option>
                  <option value="archived">Archived</option>
                </select>

                <input
                  type="text"
                  placeholder="Filter by owner..."
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="filter-input"
                />

                <button onClick={clearFilters} className="btn-secondary">
                  <FunnelIcon className="btn-icon" />
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Projects Table */}
            <div className="table-container">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <span>Loading projects...</span>
                </div>
              ) : error ? (
                <div className="error-state">
                  <ExclamationTriangleIcon className="error-icon" />
                  <span>{error}</span>
                </div>
              ) : (
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th>Objects</th>
                      <th>Last Modified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project._id}>
                        <td>
                          <div className="project-cell">
                            <div className="project-avatar">
                              {project.name ? project.name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <div className="project-info">
                              <span className="project-name">{project.name}</span>
                              <span className="project-description">
                                {project.description || 'No description'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{getTypeBadge(project.type)}</td>
                        <td>{getStatusBadge(project)}</td>
                        <td>
                          <div className="owner-info">
                            <span className="owner-name">{project.owner?.name || 'Unknown'}</span>
                            <span className="owner-email">{project.owner?.email || ''}</span>
                          </div>
                        </td>
                        <td>
                          <span className="object-count">{project.objects?.length || 0}</span>
                        </td>
                        <td>{formatDate(project.lastModified)}</td>
                        <td>
                          <div className="action-buttons">
                            {project.deletedAt ? (
                              // Archived project actions
                              <>
                                <button
                                  onClick={() => restoreProject(project)}
                                  className="btn-icon-only restore"
                                  title="Restore Project"
                                >
                                  <CheckCircleIcon className="action-icon" />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(project)}
                                  className="btn-icon-only delete"
                                  title="Delete Project Permanently"
                                >
                                  <TrashIcon className="action-icon" />
                                </button>
                              </>
                            ) : (
                              // Active project actions
                              <>
                                <button
                                  onClick={() => openViewModal(project)}
                                  className="btn-icon-only view"
                                  title="View Project Details"
                                >
                                  <EyeIcon className="action-icon" />
                                </button>
                                <button
                                  onClick={() => openEditModal(project)}
                                  className="btn-icon-only edit"
                                  title="Edit Project"
                                >
                                  <PencilIcon className="action-icon" />
                                </button>
                                <button
                                  onClick={() => toggleProjectStatus(project)}
                                  className={`btn-icon-only ${project.status === 'completed' ? 'activate' : 'complete'}`}
                                  title={project.status === 'completed' ? 'Mark as Draft' : 'Mark as Completed'}
                                >
                                  {project.status === 'completed' ? (
                                    <XCircleIcon className="action-icon" />
                                  ) : (
                                    <CheckCircleIcon className="action-icon" />
                                  )}
                                </button>
                                <button
                                  onClick={() => openArchiveModal(project)}
                                  className="btn-icon-only archive"
                                  title="Archive Project"
                                >
                                  <ArchiveBoxIcon className="action-icon" />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(project)}
                                  className="btn-icon-only delete"
                                  title="Delete Project"
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
                    fetchProjects(currentPage - 1);
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
                    fetchProjects(currentPage + 1);
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

      {/* View Project Modal */}
      {showViewModal && selectedProject && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>Project Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="project-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedProject.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Description:</label>
                      <span>{selectedProject.description || 'No description'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Type:</label>
                      <span>{selectedProject.type}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span>{selectedProject.status}</span>
                    </div>
                    <div className="detail-item">
                      <label>Version:</label>
                      <span>{selectedProject.version}</span>
                    </div>
                    <div className="detail-item">
                      <label>Public:</label>
                      <span>{selectedProject.isPublic ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Owner Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedProject.owner?.name || 'Unknown'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedProject.owner?.email || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Dimensions</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Width:</label>
                      <span>{selectedProject.dimensions?.width || 0}</span>
                    </div>
                    <div className="detail-item">
                      <label>Height:</label>
                      <span>{selectedProject.dimensions?.height || 0}</span>
                    </div>
                    <div className="detail-item">
                      <label>Depth:</label>
                      <span>{selectedProject.dimensions?.depth || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Objects</h4>
                  <p>Total objects: {selectedProject.objects?.length || 0}</p>
                  {selectedProject.objects && selectedProject.objects.length > 0 && (
                    <div className="objects-list">
                      {selectedProject.objects.slice(0, 5).map((obj, index) => (
                        <div key={index} className="object-item">
                          <span>Object {index + 1} ({obj.modelType})</span>
                        </div>
                      ))}
                      {selectedProject.objects.length > 5 && (
                        <p>... and {selectedProject.objects.length - 5} more objects</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Timestamps</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Created:</label>
                      <span>{formatDate(selectedProject.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Modified:</label>
                      <span>{formatDate(selectedProject.lastModified)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Project</h3>
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
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-type">Type</label>
                <select
                  id="edit-type"
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                  className="form-select"
                >
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="form-select"
                >
                  <option value="draft">Draft</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="shared">Shared</option>
                </select>
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
                onClick={updateProject}
                className="btn-primary"
              >
                Update Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && (
        <div className="modal-overlay">
          <div className="modal modal-warning">
            <div className="modal-header">
              <h3>Archive Project</h3>
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  setHasReadArchiveNotice(false);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-content">
                <ExclamationTriangleIcon className="warning-icon" />
                <h4>⚠️ PROJECT ARCHIVE NOTICE</h4>
                
                <div className="notice-section">
                  <p><strong>You are about to archive the project:</strong></p>
                  <div className="project-details">
                    <p><strong>Name:</strong> {selectedProject?.name}</p>
                    <p><strong>Owner:</strong> {selectedProject?.owner?.name}</p>
                    <p><strong>Type:</strong> {selectedProject?.type}</p>
                  </div>
                  
                  <div className="warning-text">
                    <h5>📋 ARCHIVING CONSEQUENCES:</h5>
                    <ul>
                      <li><strong>PROJECT VISIBILITY:</strong> The project will be hidden from the owner's project list and public galleries.</li>
                      <li><strong>DATA PRESERVATION:</strong> All project data, objects, and settings will be preserved in the system.</li>
                      <li><strong>ACCESS RESTRICTION:</strong> The owner will no longer be able to access or edit this project.</li>
                      <li><strong>REVERSIBLE ACTION:</strong> This project can be restored later if needed using the restore function.</li>
                      <li><strong>COLLABORATORS:</strong> All collaborators will lose access to this project immediately.</li>
                    </ul>
                  </div>
                  
                  <div className="confirmation-checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={hasReadArchiveNotice}
                        onChange={(e) => setHasReadArchiveNotice(e.target.checked)}
                        className="confirmation-checkbox-input"
                      />
                      <span className="checkmark"></span>
                      I understand that this will archive the project and restrict access immediately.
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  setHasReadArchiveNotice(false);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={archiveProject}
                disabled={!hasReadArchiveNotice}
                className={`btn-warning ${!hasReadArchiveNotice ? 'disabled' : ''}`}
              >
                {hasReadArchiveNotice ? 'Archive Project' : 'Please Read Notice First'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal modal-danger">
            <div className="modal-header">
              <h3>Delete Project</h3>
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
                <h4>⚠️ PERMANENT PROJECT DELETION</h4>
                
                <div className="notice-section">
                  <p><strong>You are about to permanently delete the project:</strong></p>
                  <div className="project-details">
                    <p><strong>Name:</strong> {selectedProject?.name}</p>
                    <p><strong>Owner:</strong> {selectedProject?.owner?.name}</p>
                    <p><strong>Objects:</strong> {selectedProject?.objects?.length || 0}</p>
                  </div>
                  
                  <div className="danger-text">
                    <h5>⚠️ DELETION CONSEQUENCES:</h5>
                    <ul>
                      <li><strong>PERMANENT DATA LOSS:</strong> All project data, including objects, settings, and snapshots will be permanently deleted.</li>
                      <li><strong>IRREVERSIBLE ACTION:</strong> This action cannot be undone. The project cannot be recovered once deleted.</li>
                      <li><strong>COLLABORATOR IMPACT:</strong> All collaborators and shared links will become invalid immediately.</li>
                      <li><strong>REFERENCE BREAKS:</strong> Any external references to this project will be broken.</li>
                    </ul>
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
                      I understand this will permanently delete the project and all its data. This action cannot be undone.
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
                onClick={deleteProject}
                disabled={!hasReadDeleteNotice}
                className={`btn-danger ${!hasReadDeleteNotice ? 'disabled' : ''}`}
              >
                {hasReadDeleteNotice ? 'Delete Project Permanently' : 'Please Read Notice First'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
