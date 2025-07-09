import React, { useState } from 'react';
import Pagination from './Pagination';
import './css/Sections.css';

const TemplatesSection = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Mock data for templates
  const allTemplates = [
    { id: 1, name: 'Modern Living Room', category: 'Living Room' },
    { id: 2, name: 'Contemporary Kitchen', category: 'Kitchen' },
    { id: 3, name: 'Cozy Bedroom', category: 'Bedroom' },
    { id: 4, name: 'Home Office Setup', category: 'Office' },
    { id: 5, name: 'Minimalist Dining', category: 'Dining Room' },
    { id: 6, name: 'Luxury Bathroom', category: 'Bathroom' },
    { id: 7, name: 'Kids Room', category: 'Bedroom' },
    { id: 8, name: 'Garden Patio', category: 'Outdoor' },
    { id: 9, name: 'Studio Apartment', category: 'Living Room' },
    { id: 10, name: 'Gaming Room', category: 'Entertainment' },
    { id: 11, name: 'Art Studio', category: 'Studio' },
    { id: 12, name: 'Reading Nook', category: 'Living Room' },
  ];

  const totalPages = Math.ceil(allTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTemplates = allTemplates.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="section-container">
      <div className="section-header-with-pagination">
        <h2>Templates</h2>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="templates-grid">
        {visibleTemplates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-preview">{template.name}</div>
            <p>{template.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesSection; 