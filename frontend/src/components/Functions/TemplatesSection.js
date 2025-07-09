import React, { useState } from 'react';
import Pagination from './Pagination';
import './css/Sections.css';

const TemplatesSection = () => {
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
      name: 'Modern Living Room', 
      category: 'Interior',
      subCategory: 'Living Room',
      description: 'Open concept modern living space',
      dimensions: '20x15 ft',
      preview: '🏠'
    },
    { 
      id: 2, 
      name: 'Contemporary Kitchen', 
      category: 'Interior',
      subCategory: 'Kitchen',
      description: 'Island kitchen with modern appliances',
      dimensions: '15x12 ft',
      preview: '🏠'
    },
    { 
      id: 3, 
      name: 'Master Bedroom Suite', 
      category: 'Interior',
      subCategory: 'Bedroom',
      description: 'Spacious bedroom with ensuite',
      dimensions: '16x14 ft',
      preview: '🏠'
    },
    { 
      id: 4, 
      name: 'Modern House Exterior', 
      category: 'Exterior',
      subCategory: 'House',
      description: 'Contemporary facade design',
      dimensions: '40x30 ft',
      preview: '🏠'
    },
    { 
      id: 5, 
      name: 'Minimalist Home Office', 
      category: 'Interior',
      subCategory: 'Office',
      description: 'Clean and productive workspace',
      dimensions: '12x10 ft',
      preview: '🏠'
    },
    { 
      id: 6, 
      name: 'Luxury Bathroom', 
      category: 'Interior',
      subCategory: 'Bathroom',
      description: 'Spa-like bathroom design',
      dimensions: '10x8 ft',
      preview: '🏠'
    },
    { 
      id: 7, 
      name: 'Garden Patio', 
      category: 'Exterior',
      subCategory: 'Outdoor',
      description: 'Relaxing outdoor living space',
      dimensions: '20x15 ft',
      preview: '🏠'
    },
    { 
      id: 8, 
      name: 'Modern Villa Exterior', 
      category: 'Exterior',
      subCategory: 'House',
      description: 'Luxury villa facade',
      dimensions: '50x40 ft',
      preview: '🏠'
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
    // Here we would handle the template selection and communicate with the Canvas
    console.log('Selected template:', template);
    // You would typically dispatch an action or call a callback here
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