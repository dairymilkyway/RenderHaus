const express = require('express');
const router = express.Router();

// Mock AI suggestions for furniture
router.post('/ai/suggestions', async (req, res) => {
  try {
    const { current_models, room_type } = req.body;
    
    console.log('Mock AI Suggestions - Received:', {
      modelsCount: current_models?.length || 0,
      roomType: room_type,
      models: current_models?.map(m => ({ name: m.name, category: m.category }))
    });

    // Dynamic furniture suggestions based on current models
    const existingTypes = current_models?.map(model => model.name?.toLowerCase()) || [];
    const existingCategories = current_models?.map(model => model.category?.toLowerCase()) || [];
    
    console.log('Existing furniture:', existingTypes);
    
    // All possible suggestions
    const allSuggestions = [
      {
        furniture_type: 'Coffee Table',
        reason: 'A coffee table would complement your seating area and provide a central focal point.',
        confidence: 0.85,
        category: 'furniture-tables'
      },
      {
        furniture_type: 'Floor Lamp',
        reason: 'Additional lighting would enhance the ambiance and functionality of your space.',
        confidence: 0.78,
        category: 'lighting'
      },
      {
        furniture_type: 'Area Rug',
        reason: 'A rug would help define the seating area and add warmth to the room.',
        confidence: 0.72,
        category: 'decor'
      },
      {
        furniture_type: 'Dining Chair',
        reason: 'Dining chairs would complete your dining area setup.',
        confidence: 0.80,
        category: 'furniture-seating'
      },
      {
        furniture_type: 'Bookshelf',
        reason: 'A bookshelf would add storage and personality to your space.',
        confidence: 0.75,
        category: 'furniture-storage'
      },
      {
        furniture_type: 'Side Table',
        reason: 'A side table would provide convenient surface space next to seating.',
        confidence: 0.70,
        category: 'furniture-tables'
      },
      {
        furniture_type: 'Accent Chair',
        reason: 'An accent chair would provide additional seating and visual interest.',
        confidence: 0.68,
        category: 'furniture-seating'
      },
      {
        furniture_type: 'Wall Art',
        reason: 'Wall art would add personality and complete the room\'s aesthetic.',
        confidence: 0.65,
        category: 'decor'
      },
      {
        furniture_type: 'TV Stand',
        reason: 'A TV stand would provide media storage and entertainment focus.',
        confidence: 0.73,
        category: 'furniture'
      },
      {
        furniture_type: 'Ottoman',
        reason: 'An ottoman would provide extra seating and can double as a coffee table.',
        confidence: 0.67,
        category: 'furniture-seating'
      }
    ];

    // Filter out suggestions that are similar to existing furniture
    let filteredSuggestions = allSuggestions.filter(suggestion => {
      const suggestionLower = suggestion.furniture_type.toLowerCase();
      
      // Don't suggest if we already have something similar
      return !existingTypes.some(existing => {
        return suggestionLower.includes(existing) || 
               existing.includes(suggestionLower.split(' ')[0]) ||
               existing.includes(suggestionLower.split(' ')[1] || '');
      });
    });

    // Smart suggestions based on what's already there
    if (existingTypes.some(type => type.includes('sofa') || type.includes('chair'))) {
      // If we have seating, prioritize tables and lighting
      filteredSuggestions = filteredSuggestions.map(s => 
        s.category === 'furniture-tables' || s.category === 'lighting' 
          ? { ...s, confidence: s.confidence + 0.1 } 
          : s
      );
    }

    if (existingTypes.some(type => type.includes('table'))) {
      // If we have tables, prioritize seating and lighting
      filteredSuggestions = filteredSuggestions.map(s => 
        s.category === 'furniture-seating' || s.category === 'lighting' 
          ? { ...s, confidence: s.confidence + 0.1 } 
          : s
      );
    }

    if (current_models?.length === 0) {
      // For empty rooms, suggest foundational pieces
      filteredSuggestions = [
        {
          furniture_type: 'Sofa',
          reason: 'A sofa would serve as the main seating and focal point for your room.',
          confidence: 0.90,
          category: 'furniture-seating'
        },
        {
          furniture_type: 'Coffee Table',
          reason: 'A coffee table would provide a central surface and anchor the seating area.',
          confidence: 0.85,
          category: 'furniture-tables'
        },
        {
          furniture_type: 'Floor Lamp',
          reason: 'A floor lamp would provide essential lighting and ambiance.',
          confidence: 0.80,
          category: 'lighting'
        }
      ];
    }

    // Sort by confidence and limit to top 5
    const finalSuggestions = filteredSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    console.log('Final suggestions:', finalSuggestions.map(s => s.furniture_type));

    res.json({
      status: 'success',
      suggestions: finalSuggestions
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI suggestions'
    });
  }
});

// Mock AI color suggestions
router.post('/ai/color-suggestions', async (req, res) => {
  try {
    const { current_models, room_type } = req.body;
    
    console.log('Mock AI Color Suggestions - Received:', {
      modelsCount: current_models?.length || 0,
      roomType: room_type,
      models: current_models?.map(m => ({ name: m.name, category: m.category }))
    });

    // Dynamic color suggestions based on current models
    let colorSuggestions = [];
    
    // Base color palette
    const colorPalettes = {
      modern: [
        { color: 'Charcoal Gray', hex_code: '#36454F', reason: 'Charcoal gray complements modern furniture with a sophisticated edge.' },
        { color: 'Pure White', hex_code: '#FFFFFF', reason: 'Pure white creates a clean, minimalist backdrop for modern pieces.' },
        { color: 'Steel Blue', hex_code: '#4682B4', reason: 'Steel blue adds a contemporary touch that works well with modern designs.' }
      ],
      traditional: [
        { color: 'Warm Beige', hex_code: '#F5F5DC', reason: 'Warm beige creates a cozy and inviting atmosphere for traditional furniture.' },
        { color: 'Deep Burgundy', hex_code: '#800020', reason: 'Deep burgundy adds richness and elegance to traditional settings.' },
        { color: 'Forest Green', hex_code: '#228B22', reason: 'Forest green provides a classic, timeless feel with traditional pieces.' }
      ],
      rustic: [
        { color: 'Earthy Brown', hex_code: '#8B4513', reason: 'Earthy brown enhances the natural, rustic character of your furniture.' },
        { color: 'Sage Green', hex_code: '#9CAF88', reason: 'Sage green adds a natural, calming element that complements rustic wood.' },
        { color: 'Cream White', hex_code: '#FFFDD0', reason: 'Cream white provides a soft contrast to rustic textures and materials.' }
      ],
      furniture: [
        { color: 'Soft Blue', hex_code: '#87CEEB', reason: 'Soft blue provides a serene backdrop that makes furniture the focal point.' },
        { color: 'Neutral Gray', hex_code: '#808080', reason: 'Neutral gray allows your furniture colors and textures to stand out.' },
        { color: 'Warm Ivory', hex_code: '#FFFFF0', reason: 'Warm ivory creates a versatile base that works with various furniture styles.' }
      ]
    };

    // Determine dominant style/category from current models
    const categories = current_models?.map(m => m.category?.toLowerCase()) || [];
    const modelNames = current_models?.map(m => m.name?.toLowerCase()) || [];
    
    let selectedPalette = 'furniture'; // default
    
    if (categories.some(cat => cat?.includes('modern')) || modelNames.some(name => name?.includes('modern'))) {
      selectedPalette = 'modern';
    } else if (categories.some(cat => cat?.includes('traditional')) || modelNames.some(name => name?.includes('traditional'))) {
      selectedPalette = 'traditional';
    } else if (modelNames.some(name => name?.includes('rustic') || name?.includes('wood'))) {
      selectedPalette = 'rustic';
    }

    colorSuggestions = colorPalettes[selectedPalette];

    // Add specific color suggestions based on model count and types
    if (current_models?.length === 0) {
      colorSuggestions = [
        { color: 'Light Gray', hex_code: '#D3D3D3', reason: 'Light gray provides a neutral foundation to start your design.' },
        { color: 'Off White', hex_code: '#FAF0E6', reason: 'Off white creates a clean slate for any furniture style you choose.' },
        { color: 'Pale Blue', hex_code: '#AFEEEE', reason: 'Pale blue offers a calming base that works with most color schemes.' }
      ];
    } else if (current_models?.length >= 3) {
      // For rooms with many items, suggest more muted colors
      colorSuggestions = colorSuggestions.map(color => ({
        ...color,
        reason: color.reason + ' The muted tone prevents overwhelming your well-furnished space.'
      }));
    }

    console.log('Selected palette:', selectedPalette, 'for', current_models?.length || 0, 'models');

    res.json({
      status: 'success',
      color_suggestions: colorSuggestions
    });
  } catch (error) {
    console.error('Error generating color suggestions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate color suggestions'
    });
  }
});

module.exports = router;
