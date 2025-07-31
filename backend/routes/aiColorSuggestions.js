const express = require('express');
const router = express.Router();

// AI Color Suggestions endpoint
router.post('/get-ai-color-suggestions', (req, res) => {
  try {
    const { objectName, objectCategory, currentColor, context } = req.body;
    
    console.log('🎨 AI Color Suggestion Request:', {
      objectName,
      objectCategory,
      currentColor,
      context
    });

    // Generate AI color suggestions based on object type and context
    const colorSuggestions = generateColorSuggestions(objectName, objectCategory, context);
    
    res.json({
      status: 'success',
      colors: colorSuggestions,
      object: {
        name: objectName,
        category: objectCategory,
        currentColor
      }
    });

  } catch (error) {
    console.error('Error generating AI color suggestions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate color suggestions'
    });
  }
});

function generateColorSuggestions(objectName, objectCategory, context = 'interior_design') {
  const suggestions = [];
  
  // Analyze object type and generate contextual color suggestions
  const objectType = detectObjectType(objectName, objectCategory);
  const style = detectStyleFromName(objectName);
  
  console.log(`🔍 Detected object type: ${objectType}, style: ${style}`);
  
  // Base color schemes by object type
  const colorSchemes = {
    seating: {
      modern: [
        { name: 'Charcoal Gray', hex: '#36454F', description: 'Sophisticated and versatile' },
        { name: 'Cream White', hex: '#F5F5DC', description: 'Clean and minimalist' },
        { name: 'Navy Blue', hex: '#1E3A8A', description: 'Bold and professional' },
        { name: 'Warm Beige', hex: '#F5E6D3', description: 'Cozy and inviting' }
      ],
      traditional: [
        { name: 'Rich Brown', hex: '#8B4513', description: 'Classic leather look' },
        { name: 'Deep Burgundy', hex: '#800020', description: 'Elegant and timeless' },
        { name: 'Forest Green', hex: '#355E3B', description: 'Natural and calming' },
        { name: 'Antique Gold', hex: '#B8860B', description: 'Luxurious accent' }
      ],
      rustic: [
        { name: 'Weathered Oak', hex: '#A0522D', description: 'Natural wood tone' },
        { name: 'Sage Green', hex: '#9CAF88', description: 'Earthy and peaceful' },
        { name: 'Warm Gray', hex: '#8B8680', description: 'Neutral farmhouse' },
        { name: 'Terracotta', hex: '#E2725B', description: 'Warm earth tone' }
      ]
    },
    
    tables: {
      modern: [
        { name: 'Matte Black', hex: '#1C1C1C', description: 'Sleek and contemporary' },
        { name: 'Pure White', hex: '#FFFFFF', description: 'Clean and bright' },
        { name: 'Natural Wood', hex: '#D2B48C', description: 'Warm Scandinavian' },
        { name: 'Steel Blue', hex: '#4682B4', description: 'Industrial chic' }
      ],
      traditional: [
        { name: 'Mahogany', hex: '#C04000', description: 'Rich wood finish' },
        { name: 'Walnut Brown', hex: '#5D4037', description: 'Classic and refined' },
        { name: 'Cherry Wood', hex: '#8B0000', description: 'Elegant red tones' },
        { name: 'Espresso', hex: '#362D1A', description: 'Dark and sophisticated' }
      ],
      rustic: [
        { name: 'Reclaimed Wood', hex: '#8D6E63', description: 'Vintage character' },
        { name: 'Driftwood Gray', hex: '#A8A49C', description: 'Coastal charm' },
        { name: 'Barn Red', hex: '#98272F', description: 'Country farmhouse' },
        { name: 'Pine Green', hex: '#01796F', description: 'Natural forest' }
      ]
    },
    
    lighting: {
      modern: [
        { name: 'Brushed Silver', hex: '#C0C0C0', description: 'Contemporary metal' },
        { name: 'Matte Black', hex: '#28282B', description: 'Bold statement piece' },
        { name: 'Copper', hex: '#B87333', description: 'Warm metallic accent' },
        { name: 'White', hex: '#F8F8FF', description: 'Clean and bright' }
      ],
      traditional: [
        { name: 'Antique Brass', hex: '#CD7F32', description: 'Classic elegance' },
        { name: 'Oil Rubbed Bronze', hex: '#4A4A4A', description: 'Timeless finish' },
        { name: 'Pewter', hex: '#96A8A1', description: 'Sophisticated gray' },
        { name: 'Gold', hex: '#FFD700', description: 'Luxurious accent' }
      ],
      rustic: [
        { name: 'Weathered Iron', hex: '#6D6D6D', description: 'Industrial heritage' },
        { name: 'Natural Wood', hex: '#8B7355', description: 'Organic warmth' },
        { name: 'Copper Patina', hex: '#80A695', description: 'Aged character' },
        { name: 'Antique White', hex: '#FAEBD7', description: 'Vintage charm' }
      ]
    },
    
    storage: {
      modern: [
        { name: 'High Gloss White', hex: '#F8F8FF', description: 'Clean and spacious feel' },
        { name: 'Graphite', hex: '#41424C', description: 'Modern and sleek' },
        { name: 'Light Oak', hex: '#DEB887', description: 'Scandinavian style' },
        { name: 'Sage Green', hex: '#87A96B', description: 'Calming nature tone' }
      ],
      traditional: [
        { name: 'Dark Cherry', hex: '#722F37', description: 'Rich traditional wood' },
        { name: 'Mahogany Stain', hex: '#C04000', description: 'Classic library look' },
        { name: 'Antique White', hex: '#FAEBD7', description: 'Elegant vintage' },
        { name: 'Hunter Green', hex: '#355E3B', description: 'Sophisticated depth' }
      ],
      rustic: [
        { name: 'Barnwood Gray', hex: '#8B8682', description: 'Authentic aged wood' },
        { name: 'Distressed White', hex: '#FAF0E6', description: 'Shabby chic charm' },
        { name: 'Cedar', hex: '#A0522D', description: 'Natural wood grain' },
        { name: 'Vintage Blue', hex: '#4F81BD', description: 'Cottage style' }
      ]
    }
  };

  // Get appropriate colors based on object type and style
  const selectedScheme = colorSchemes[objectType]?.[style] || colorSchemes[objectType]?.modern || [];
  
  // If no specific scheme found, provide general interior design colors
  if (selectedScheme.length === 0) {
    return getGeneralColorSuggestions(objectCategory);
  }
  
  return selectedScheme;
}

function detectObjectType(objectName, objectCategory) {
  const name = objectName.toLowerCase();
  const category = objectCategory.toLowerCase();
  
  if (name.includes('sofa') || name.includes('chair') || name.includes('bench') || 
      name.includes('seat') || category.includes('seating')) {
    return 'seating';
  }
  
  if (name.includes('table') || name.includes('desk') || name.includes('counter')) {
    return 'tables';
  }
  
  if (name.includes('lamp') || name.includes('light') || name.includes('chandelier') || 
      name.includes('sconce') || category.includes('lighting')) {
    return 'lighting';
  }
  
  if (name.includes('shelf') || name.includes('cabinet') || name.includes('dresser') || 
      name.includes('wardrobe') || name.includes('storage')) {
    return 'storage';
  }
  
  return 'general';
}

function detectStyleFromName(objectName) {
  const name = objectName.toLowerCase();
  
  if (name.includes('modern') || name.includes('contemporary') || name.includes('minimalist') ||
      name.includes('sleek') || name.includes('industrial')) {
    return 'modern';
  }
  
  if (name.includes('traditional') || name.includes('classic') || name.includes('vintage') ||
      name.includes('antique') || name.includes('elegant')) {
    return 'traditional';
  }
  
  if (name.includes('rustic') || name.includes('farmhouse') || name.includes('country') ||
      name.includes('weathered') || name.includes('reclaimed')) {
    return 'rustic';
  }
  
  return 'modern'; // Default to modern
}

function getGeneralColorSuggestions(category) {
  return [
    { name: 'Classic White', hex: '#FFFFFF', description: 'Timeless and versatile' },
    { name: 'Warm Gray', hex: '#8B8680', description: 'Neutral and calming' },
    { name: 'Natural Wood', hex: '#D2B48C', description: 'Organic warmth' },
    { name: 'Deep Navy', hex: '#1E3A8A', description: 'Sophisticated accent' }
  ];
}

module.exports = router;
