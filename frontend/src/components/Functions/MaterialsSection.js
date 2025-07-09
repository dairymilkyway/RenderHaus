import React, { useState } from 'react';
import Pagination from './Pagination';
import './css/Sections.css';

const MaterialsSection = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock data for materials
  const allMaterials = [
    {
      id: 1,
      type: 'Wood',
      variants: ['oak', 'maple', 'walnut']
    },
    {
      id: 2,
      type: 'Fabric',
      variants: ['cotton', 'linen', 'velvet']
    },
    {
      id: 3,
      type: 'Metal',
      variants: ['steel', 'brass', 'copper']
    },
    {
      id: 4,
      type: 'Stone',
      variants: ['marble', 'granite', 'quartz']
    },
    {
      id: 5,
      type: 'Glass',
      variants: ['clear', 'frosted', 'tinted']
    },
    {
      id: 6,
      type: 'Leather',
      variants: ['full-grain', 'suede', 'nubuck']
    },
    {
      id: 7,
      type: 'Plastic',
      variants: ['acrylic', 'polycarbonate', 'abs']
    },
    {
      id: 8,
      type: 'Ceramic',
      variants: ['porcelain', 'terracotta', 'stoneware']
    },
    {
      id: 9,
      type: 'Concrete',
      variants: ['polished', 'stamped', 'exposed']
    }
  ];

  const totalPages = Math.ceil(allMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleMaterials = allMaterials.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="section-container">
      <div className="section-header-with-pagination">
        <h2>Materials</h2>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="materials-grid">
        {visibleMaterials.map(material => (
          <div key={material.id} className="material-card">
            <div className={`material-preview ${material.type.toLowerCase()}`}></div>
            <p>{material.type}</p>
            <div className="material-variants">
              {material.variants.map(variant => (
                <div key={variant} className={`variant ${variant}`}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialsSection; 