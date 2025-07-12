import React, { useState } from 'react';
import Pagination from './Pagination';
import './css/Sections.css';

const TemplatesSection = ({ onTemplateSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const itemsPerPage = 6;

  // Categories and templates data
  const categories = [
    'All',
    'Interior',
    'Exterior',
    'Living Room',
    'Kitchen',
    'Bedroom',
    'Bathroom',
    'Office',
    'Outdoor'
  ];

  // Mock data for templates with more detailed information
  const allTemplates = [
    { 
      id: 1, 
      name: 'Tiny Living Room', 
      category: 'Interior',
      subCategory: 'Living Room',
      description: 'Minimalist living space',
      dimensions: '8x6 ft',
      preview: '🛋️',
      model: {
        type: 'room',
        width: 8,
        length: 6,
        height: 7,
        floor: {
          color: '#8B7355',
          material: 'hardwood'
        },
        walls: [
          { position: 'front', windows: 1, doors: 1, height: 4 },
          { position: 'back', windows: 0, height: 4 },
          { position: 'left', windows: 1, height: 4 },
          { position: 'right', windows: 0, height: 4 }
        ],
        furniture: [
          { type: 'sofa', position: [0, 0, 1], scale: [2.5, 0.8, 0.8] },
          { type: 'coffeeTable', position: [0, 0, -0.5], scale: [1.2, 0.4, 0.8] },
          { type: 'tvStand', position: [0, 0, -2], scale: [1.8, 0.4, 0.4] }
        ]
      }
    },
    { 
      id: 2, 
      name: 'Mini Kitchen', 
      category: 'Interior',
      subCategory: 'Kitchen',
      description: 'Compact kitchen design',
      dimensions: '6x5 ft',
      preview: '🍳',
      model: {
        type: 'room',
        width: 6,
        length: 5,
        height: 7,
        floor: {
          color: '#D3D3D3',
          material: 'tile'
        },
        walls: [
          { position: 'front', windows: 0, doors: 1, height: 4 },
          { position: 'back', cabinets: true, height: 4 },
          { position: 'left', cabinets: true, windows: 1, height: 4 },
          { position: 'right', cabinets: true, height: 4 }
        ],
        furniture: [
          { type: 'counter', position: [-1, 0, -1.5], scale: [3, 0.8, 0.6] },
          { type: 'sink', position: [-1, 0.4, -1.5], scale: [0.8, 0.1, 0.4] },
          { type: 'stove', position: [1, 0, -1.5], scale: [0.8, 0.8, 0.6] }
        ]
      }
    },
    { 
      id: 3, 
      name: 'Micro Bedroom', 
      category: 'Interior',
      subCategory: 'Bedroom',
      description: 'Efficient sleeping space',
      dimensions: '7x6 ft',
      preview: '🛏️',
      model: {
        type: 'room',
        width: 7,
        length: 6,
        height: 7,
        floor: {
          color: '#DEB887',
          material: 'carpet'
        },
        walls: [
          { position: 'front', windows: 0, doors: 1, height: 4 },
          { position: 'back', windows: 1, height: 4 },
          { position: 'left', windows: 0, height: 4 },
          { position: 'right', windows: 0, height: 4 }
        ],
        furniture: [
          { type: 'bed', position: [0, 0, -1], scale: [2.5, 0.4, 3] },
          { type: 'nightstand', position: [-1.5, 0, -1], scale: [0.6, 0.4, 0.6] },
          { type: 'wardrobe', position: [2, 0, -2], scale: [0.8, 1.8, 1] }
        ]
      }
    },
    { 
      id: 4, 
      name: 'Open Space Studio', 
      category: 'Exterior',
      subCategory: 'House',
      description: 'Modern open concept space',
      dimensions: '12x8 ft',
      preview: '🏠',
      model: {
        type: 'house',
        width: 12,
        length: 8,
        height: 8,
        floor: {
          color: '#8B7355',
          material: 'hardwood'
        },
        walls: [
          { position: 'front', windows: 1, doors: 1, height: 3.5 },
          { position: 'back', windows: 2, height: 3.5 },
          { position: 'left', windows: 2, height: 3.5 },
          { position: 'right', windows: 2, height: 3.5 }
        ],
        furniture: [
          { type: 'sofa', position: [-2, 0, 1], scale: [2.5, 0.8, 0.8] },
          { type: 'coffeeTable', position: [-2, 0, -0.5], scale: [1.2, 0.4, 0.8] },
          { type: 'desk', position: [2, 0, -2], scale: [2, 0.6, 0.8] },
          { type: 'chair', position: [2, 0, -1], scale: [0.6, 0.8, 0.6] },
          { type: 'bookshelf', position: [3.5, 0, -2], scale: [0.8, 1.8, 0.4] }
        ]
      }
    },
    { 
      id: 5, 
      name: 'Desk Corner', 
      category: 'Interior',
      subCategory: 'Office',
      description: 'Minimal work area',
      dimensions: '5x4 ft',
      preview: '💻',
      model: {
        type: 'room',
        width: 5,
        length: 4,
        height: 7,
        floor: {
          color: '#8B7355',
          material: 'hardwood'
        },
        walls: [
          { position: 'front', windows: 0, doors: 1 },
          { position: 'back', windows: 1 },
          { position: 'left', windows: 0 },
          { position: 'right', windows: 0 }
        ],
        furniture: [
          { type: 'desk', position: [0, 0, -0.8], scale: [2.5, 0.6, 0.8] },
          { type: 'chair', position: [0, 0, 0.5], scale: [0.6, 0.8, 0.6] },
          { type: 'bookshelf', position: [1.5, 0, -1.5], scale: [0.6, 1.6, 0.3] }
        ]
      }
    },
    { 
      id: 6, 
      name: 'Tiny Bathroom', 
      category: 'Interior',
      subCategory: 'Bathroom',
      description: 'Compact bathroom',
      dimensions: '4x5 ft',
      preview: '🚿',
      model: {
        type: 'room',
        width: 4,
        length: 5,
        height: 7,
        floor: {
          color: '#FFFFFF',
          material: 'tile'
        },
        walls: [
          { position: 'front', windows: 0, doors: 1 },
          { position: 'back', windows: 0 },
          { position: 'left', windows: 1 },
          { position: 'right', windows: 0 }
        ],
        furniture: [
          { type: 'toilet', position: [-1, 0, -1.5], scale: [0.6, 0.8, 0.6] },
          { type: 'sink', position: [1, 0, -1.5], scale: [0.8, 0.6, 0.4] },
          { type: 'shower', position: [1, 0, 1], scale: [1.2, 0.1, 1.2] }
        ]
      }
    },
    { 
      id: 7, 
      name: 'Mini Balcony', 
      category: 'Exterior',
      subCategory: 'Outdoor',
      description: 'Tiny outdoor space',
      dimensions: '4x3 ft',
      preview: '🌿',
      model: {
        type: 'outdoor',
        width: 4,
        length: 3,
        height: 3,
        floor: {
          color: '#A9A9A9',
          material: 'concrete'
        },
        walls: [
          { position: 'back', height: 3 },
          { position: 'left', height: 3 },
          { position: 'right', height: 3 }
        ],
        furniture: [
          { type: 'planter', position: [-1, 0, -0.8], scale: [0.6, 0.4, 0.4] },
          { type: 'chair', position: [0.5, 0, 0], scale: [0.6, 0.8, 0.6] },
          { type: 'table', position: [1, 0, 0], scale: [0.6, 0.6, 0.6] }
        ]
      }
    },
    { 
      id: 8, 
      name: 'Tiny Cottage', 
      category: 'Exterior',
      subCategory: 'House',
      description: 'Cozy mini cottage',
      dimensions: '15x10 ft',
      preview: '🏡',
      model: {
        type: 'house',
        width: 15,
        length: 10,
        height: 9,
        floor: {
          color: '#8B7355',
          material: 'hardwood'
        },
        walls: [
          { position: 'front', windows: 2, doors: 1 },
          { position: 'back', windows: 1 },
          { position: 'left', windows: 1 },
          { position: 'right', windows: 1 }
        ],
        roof: { type: 'gable', pitch: 45 }
      }
    }
  ];

  // Filter templates based on selected category
  const filteredTemplates = selectedCategory === 'All' 
    ? allTemplates 
    : allTemplates.filter(template => 
        template.category === selectedCategory || 
        template.subCategory === selectedCategory
      );

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  const handleTemplateSelect = (template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  return (
    <div className="section-container">
      <div className="section-content">
        <div className="section-header">
          <h2>Templates</h2>
          <div className="categories-container">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1); // Reset to first page when changing category
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="pagination-container">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        <div className="templates-grid scrollable-content">
          {visibleTemplates.map(template => (
            <div 
              key={template.id} 
              className="template-card"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="template-preview">
                <div className="preview-image">{template.preview}</div>
              </div>
              <div className="template-info">
                <h3>{template.name}</h3>
                <p className="template-category">{template.subCategory}</p>
                <p className="template-dimensions">{template.dimensions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesSection; 