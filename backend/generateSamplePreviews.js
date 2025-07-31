// Generate sample preview images for test projects
const generateSamplePreview = (projectName, itemCount) => {
  // Create a simple canvas-based preview image
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  
  try {
    const width = 400;
    const height = 300;
    const canvasElement = createCanvas(width, height);
    const ctx = canvasElement.getContext('2d');
    
    // Create different gradients based on project type
    let gradient;
    if (projectName.includes('Living')) {
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
    } else if (projectName.includes('Bedroom')) {
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f093fb');
      gradient.addColorStop(1, '#f5576c');
    } else if (projectName.includes('Kitchen')) {
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#4facfe');
      gradient.addColorStop(1, '#00f2fe');
    } else if (projectName.includes('Office')) {
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#43e97b');
      gradient.addColorStop(1, '#38d9a9');
    } else {
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#fa709a');
      gradient.addColorStop(1, '#fee140');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some geometric shapes to simulate furniture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(50, 100, 100, 60);  // Table
    ctx.fillRect(200, 80, 80, 100);  // Chair
    ctx.fillRect(320, 50, 50, 150);  // Lamp
    
    // Add project title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(projectName, width/2, 50);
    
    // Add item count
    ctx.font = '16px Arial';
    ctx.fillText(`${itemCount} items`, width/2, height - 30);
    
    return canvasElement.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error generating preview:', error);
    // Return a simple fallback
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+CjxyZWN0IHg9IjUwIiB5PSIxMDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNjAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8cmVjdCB4PSIyMDAiIHk9IjgwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHJlY3QgeD0iMzIwIiB5PSI1MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iNTAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9qZWN0IFByZXZpZXc8L3RleHQ+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjMwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNjY3ZWVhIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzc2NGJhMiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=';
  }
};

module.exports = { generateSamplePreview };
