import React, { useState } from 'react';
import Pagination from './Pagination';
import './css/Sections.css';

const ComponentsSection = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Mock data for components
  const allComponents = [
    {
      id: 1,
      category: 'Furniture',
      items: ['Sofa', 'Chair', 'Table', 'Bed']
    },
    {
      id: 2,
      category: 'Lighting',
      items: ['Ceiling Light', 'Floor Lamp', 'Wall Light', 'Table Lamp']
    },
    {
      id: 3,
      category: 'Decor',
      items: ['Plants', 'Art', 'Rugs', 'Mirrors']
    },
    {
      id: 4,
      category: 'Storage',
      items: ['Shelves', 'Cabinets', 'Drawers', 'Wardrobes']
    },
    {
      id: 5,
      category: 'Electronics',
      items: ['TV', 'Speakers', 'Smart Devices', 'Cameras']
    },
    {
      id: 6,
      category: 'Kitchen',
      items: ['Appliances', 'Countertops', 'Sinks', 'Islands']
    }
  ];

  const totalPages = Math.ceil(allComponents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleComponents = allComponents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="section-container">
      <div className="section-header-with-pagination">
        <h2>Components</h2>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="components-grid">
        {visibleComponents.map(component => (
          <div key={component.id} className="component-card">
            <div className="component-preview">{component.category}</div>
            <div className="component-list">
              {component.items.map(item => (
                <div key={item} className="component-item">{item}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentsSection; 