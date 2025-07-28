import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  ClockIcon,
  SparklesIcon,
  CubeIcon 
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ExportSection = ({ placedModels = [] }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAiSuggestions, setCurrentAiSuggestions] = useState([]);
  const [currentColorSuggestions, setCurrentColorSuggestions] = useState([]);

  // Capture 3D canvas screenshot
  const capture3DCanvas = async () => {
    try {
      console.log('Starting 3D canvas capture...');
      
      // Look for the Three.js canvas element
      const canvasElements = document.querySelectorAll('canvas');
      console.log('Found canvas elements:', canvasElements.length);
      
      if (canvasElements.length === 0) {
        console.warn('No canvas elements found for 3D capture');
        return null;
      }

      // Get the first canvas (usually the Three.js canvas)
      const canvasElement = canvasElements[0];
      console.log('Canvas element:', canvasElement);
      console.log('Canvas dimensions:', canvasElement.width, 'x', canvasElement.height);

      // Create a new canvas to capture the current frame
      const captureCanvas = document.createElement('canvas');
      const ctx = captureCanvas.getContext('2d');
      
      // Set the capture canvas size to match the original
      captureCanvas.width = canvasElement.width || 800;
      captureCanvas.height = canvasElement.height || 600;
      
      console.log('Capture canvas dimensions:', captureCanvas.width, 'x', captureCanvas.height);
      
      // Draw the Three.js canvas onto our capture canvas
      ctx.drawImage(canvasElement, 0, 0);
      
      // Test if the canvas has any content
      const imageData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
      const hasContent = imageData.data.some((value, index) => index % 4 !== 3 && value !== 0);
      
      if (hasContent) {
        console.log('Canvas capture completed successfully with content');
        return captureCanvas;
      } else {
        console.log('Canvas capture completed but appears empty');
        // Return the canvas anyway, it might have subtle content
        return captureCanvas;
      }
    } catch (error) {
      console.error('Error capturing 3D canvas:', error);
      return null;
    }
  };

  // Fetch AI data for export
  const fetchAIDataForExport = async () => {
    let suggestions = [];
    let colors = [];

    try {
      const requestBody = {
        current_models: placedModels.map(model => ({
          name: model.name,
          category: model.category,
          position: model.position,
          modelFile: model.modelFile,
          fileUrl: model.modelFile?.fileUrl || model.fileUrl,
          _id: model._id
        })),
        room_type: 'living_room'
      };

      // Fetch furniture suggestions
      const furnitureResponse = await fetch('http://localhost:5000/api/python/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (furnitureResponse.ok) {
        const furnitureData = await furnitureResponse.json();
        suggestions = furnitureData.suggestions || [];
        setCurrentAiSuggestions(suggestions);
      }

      // Fetch color suggestions
      const colorResponse = await fetch('http://localhost:5000/api/python/ai/color-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (colorResponse.ok) {
        const colorData = await colorResponse.json();
        colors = colorData.color_suggestions || [];
        setCurrentColorSuggestions(colors);
      }
    } catch (error) {
      console.error('Error fetching AI data for export:', error);
    }

    return { suggestions, colors };
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Starting PDF generation...');
      
      // First capture the 3D canvas
      const canvasCapture = await capture3DCanvas();
      console.log('Canvas capture result:', canvasCapture);
      
      // Then fetch the latest AI data
      const { suggestions: aiSuggestions, colors: colorSuggestions } = await fetchAIDataForExport();
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('RenderHaus - 3D Design Export', margin, yPosition);
      yPosition += 15;

      // Add timestamp
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const timestamp = new Date().toLocaleString();
      pdf.text(`Generated on: ${timestamp}`, margin, yPosition);
      yPosition += 20;

      // Add separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Section: 3D Models
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('3D Models in Scene', margin, yPosition);
      yPosition += 10;

      if (placedModels.length === 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('No 3D models placed in the scene.', margin, yPosition);
        yPosition += 15;
      } else {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        
        placedModels.forEach((model, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.setFont(undefined, 'bold');
          pdf.text(`${index + 1}. ${model.name || 'Unnamed Model'}`, margin, yPosition);
          yPosition += 8;
          
          pdf.setFont(undefined, 'normal');
          if (model.category) {
            pdf.text(`   Category: ${model.category}`, margin, yPosition);
            yPosition += 6;
          }
          if (model.description) {
            const lines = pdf.splitTextToSize(`   Description: ${model.description}`, pageWidth - margin * 2 - 10);
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6;
          }
          if (model.position) {
            pdf.text(`   Position: X:${model.position.x?.toFixed(2) || 0}, Y:${model.position.y?.toFixed(2) || 0}, Z:${model.position.z?.toFixed(2) || 0}`, margin, yPosition);
            yPosition += 6;
          }
          yPosition += 5;
        });
      }

      yPosition += 10;

      // Add separator line
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Add 3D Canvas Screenshot
      if (canvasCapture) {
        console.log('Adding 3D canvas to PDF...');
        
        // Check if we need a new page for the image
        if (yPosition > pageHeight - 120) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('3D Scene Preview', margin, yPosition);
        yPosition += 15;

        // Add the canvas image
        const imgData = canvasCapture.toDataURL('image/png');
        console.log('Image data length:', imgData.length);
        console.log('Image data preview:', imgData.substring(0, 100));
        
        const imgWidth = Math.min(150, pageWidth - margin * 2);
        const imgHeight = (canvasCapture.height * imgWidth) / canvasCapture.width;
        
        console.log('Image dimensions for PDF:', imgWidth, 'x', imgHeight);
        
        // Center the image
        const imgX = (pageWidth - imgWidth) / 2;
        
        pdf.addImage(imgData, 'PNG', imgX, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
        
        console.log('3D canvas added to PDF successfully');

        // Add separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;
      } else {
        console.log('No canvas capture available, skipping 3D scene preview');
      }

      // Section: AI Furniture Suggestions
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('AI Furniture Suggestions', margin, yPosition);
      yPosition += 10;

      if (aiSuggestions.length === 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('No AI furniture suggestions available.', margin, yPosition);
        yPosition += 15;
      } else {
        pdf.setFontSize(12);
        
        aiSuggestions.forEach((suggestion, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.setFont(undefined, 'bold');
          pdf.text(`${index + 1}. ${suggestion.furniture_type}`, margin, yPosition);
          yPosition += 8;
          
          pdf.setFont(undefined, 'normal');
          const reasonLines = pdf.splitTextToSize(`   Reason: ${suggestion.reason}`, pageWidth - margin * 2 - 10);
          pdf.text(reasonLines, margin, yPosition);
          yPosition += reasonLines.length * 6;
          
          if (suggestion.confidence) {
            pdf.text(`   Confidence: ${Math.round(suggestion.confidence * 100)}%`, margin, yPosition);
            yPosition += 6;
          }
          yPosition += 5;
        });
      }

      yPosition += 10;

      // Add separator line
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Section: AI Color Suggestions
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('AI Color Suggestions', margin, yPosition);
      yPosition += 10;

      if (colorSuggestions.length === 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('No AI color suggestions available.', margin, yPosition);
        yPosition += 15;
      } else {
        pdf.setFontSize(12);
        
        colorSuggestions.forEach((colorSuggestion, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.setFont(undefined, 'bold');
          pdf.text(`${index + 1}. ${colorSuggestion.color}`, margin, yPosition);
          yPosition += 8;
          
          pdf.setFont(undefined, 'normal');
          if (colorSuggestion.hex_code) {
            pdf.text(`   Color Code: ${colorSuggestion.hex_code}`, margin, yPosition);
            yPosition += 6;
          }
          
          const reasonLines = pdf.splitTextToSize(`   Reason: ${colorSuggestion.reason}`, pageWidth - margin * 2 - 10);
          pdf.text(reasonLines, margin, yPosition);
          yPosition += reasonLines.length * 6 + 5;
        });
      }

      // Add footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Generated by RenderHaus - Page ${i} of ${totalPages}`, margin, pageHeight - 10);
      }

      // Save the PDF
      const filename = `RenderHaus_Design_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
      pdf.save(filename);

      console.log('PDF generated successfully:', filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="sections-content" style={{ padding: '20px' }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <DocumentArrowDownIcon className="section-icon" style={{ width: '24px', height: '24px' }} />
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Export Design</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          Export your 3D design with AI suggestions to PDF
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '15px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', display: 'flex', alignItems: 'center' }}>
            <ClockIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Export Summary
          </h3>
          
          <div style={{ fontSize: '14px', color: '#555' }}>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <CubeIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              <strong>3D Models:</strong> {placedModels.length} model(s) in scene
            </div>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <SparklesIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              <strong>AI Furniture Suggestions:</strong> {currentAiSuggestions.length} suggestion(s)
            </div>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <SparklesIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              <strong>AI Color Suggestions:</strong> {currentColorSuggestions.length} suggestion(s)
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
              Timestamp will be included in the exported PDF
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={generatePDF}
        disabled={isGenerating}
        style={{
          width: '100%',
          padding: '12px 20px',
          backgroundColor: isGenerating ? '#ccc' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => {
          if (!isGenerating) {
            e.target.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseOut={(e) => {
          if (!isGenerating) {
            e.target.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        <DocumentArrowDownIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
        {isGenerating ? 'Generating PDF...' : 'Export to PDF'}
      </button>

      {placedModels.length === 0 && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>Note:</strong> Place some 3D models in your scene and get AI suggestions for a more detailed export.
        </div>
      )}
    </div>
  );
};

export default ExportSection;
