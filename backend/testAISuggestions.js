const axios = require('axios');

const testAISuggestions = async () => {
  try {
    console.log('🤖 Testing AI Suggestions API...');

    // Test furniture suggestions
    const furnitureResponse = await axios.post('http://localhost:5000/api/python/ai/suggestions', {
      current_models: [
        {
          name: 'Modern Sofa',
          category: 'furniture',
          position: { x: 0, y: 0, z: 0 }
        }
      ],
      room_type: 'living_room'
    });

    console.log('✅ Furniture Suggestions Response:', furnitureResponse.data);

    // Test color suggestions
    const colorResponse = await axios.post('http://localhost:5000/api/python/ai/color-suggestions', {
      current_models: [
        {
          name: 'Modern Sofa',
          category: 'furniture'
        }
      ],
      room_type: 'living_room'
    });

    console.log('✅ Color Suggestions Response:', colorResponse.data);

  } catch (error) {
    console.error('❌ Error testing AI suggestions:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testAISuggestions();
