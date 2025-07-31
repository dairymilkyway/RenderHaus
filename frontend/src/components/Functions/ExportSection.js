import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  ClockIcon,
  SparklesIcon,
  CubeIcon 
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as THREE from 'three';

const ExportSection = ({ placedModels = [] }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAiSuggestions, setCurrentAiSuggestions] = useState([]);
  const [currentColorSuggestions, setCurrentColorSuggestions] = useState([]);

  // Helper function to draw a table in PDF
  const drawTable = (pdf, headers, rows, startX, startY, columnWidths) => {
    const cellHeight = 8;
    const headerHeight = 10;
    let currentY = startY;

    // Draw headers
    pdf.setFillColor(240, 240, 240);
    pdf.rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), headerHeight, 'F');
    
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(10);
    let currentX = startX;
    headers.forEach((header, index) => {
      pdf.text(header, currentX + 2, currentY + 7);
      currentX += columnWidths[index];
    });
    
    currentY += headerHeight;

    // Draw rows
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(9);
    rows.forEach((row, rowIndex) => {
      // Alternate row background
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), cellHeight, 'F');
      }
      
      currentX = startX;
      row.forEach((cell, cellIndex) => {
        // Wrap text if it's too long
        const maxWidth = columnWidths[cellIndex] - 4;
        const wrappedText = pdf.splitTextToSize(cell, maxWidth);
        
        if (wrappedText.length > 1) {
          // Multi-line cell
          wrappedText.forEach((line, lineIndex) => {
            pdf.text(line, currentX + 2, currentY + 6 + (lineIndex * 4));
          });
          if (wrappedText.length > 2) {
            currentY += (wrappedText.length - 1) * 4; // Adjust for extra lines
          }
        } else {
          pdf.text(cell, currentX + 2, currentY + 6);
        }
        currentX += columnWidths[cellIndex];
      });
      currentY += cellHeight;
    });

    // Draw table borders
    pdf.setDrawColor(200, 200, 200);
    // Horizontal lines
    for (let i = 0; i <= rows.length + 1; i++) {
      const y = startY + (i === 0 ? 0 : headerHeight) + (i > 1 ? (i - 1) * cellHeight : 0);
      pdf.line(startX, y, startX + columnWidths.reduce((a, b) => a + b, 0), y);
    }
    // Vertical lines
    currentX = startX;
    for (let i = 0; i <= columnWidths.length; i++) {
      pdf.line(currentX, startY, currentX, currentY);
      if (i < columnWidths.length) currentX += columnWidths[i];
    }

    return currentY + 10; // Return next Y position
  };

  // Capture 3D canvas screenshot (main view only)
  const capture3DCanvas = async (perspective = 'default') => {
    try {
      console.log(`Starting 3D canvas capture for ${perspective} view...`);
      
      // Look for the Three.js canvas element
      const canvasElements = document.querySelectorAll('canvas');
      console.log('Found canvas elements:', canvasElements.length);
      
      if (canvasElements.length === 0) {
        console.warn('No canvas elements found for 3D capture');
        return null;
      }

      // Get the first canvas (usually the Three.js canvas)
      const canvasElement = canvasElements[0];
      
      // Create capture canvas
      const captureCanvas = document.createElement('canvas');
      const ctx = captureCanvas.getContext('2d');
      captureCanvas.width = canvasElement.width || 800;
      captureCanvas.height = canvasElement.height || 600;
      
      console.log('Capture canvas dimensions:', captureCanvas.width, 'x', captureCanvas.height);
      
      // Draw the Three.js canvas onto our capture canvas
      ctx.drawImage(canvasElement, 0, 0);
      
      // Add a simple label for the main view
      ctx.fillStyle = 'rgba(60, 60, 60, 0.9)';
      ctx.fillRect(10, 10, 120, 35);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('DESIGN VIEW', 70, 32);
      ctx.textAlign = 'left'; // Reset alignment
      
      // Test if the canvas has any content
      const imageData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
      const hasContent = imageData.data.some((value, index) => index % 4 !== 3 && value !== 0);
      
      if (hasContent) {
        console.log(`Canvas capture completed successfully for ${perspective} view`);
        return captureCanvas;
      } else {
        console.log(`Canvas capture completed but appears empty for ${perspective} view`);
        return captureCanvas; // Return anyway, might have subtle content
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
          // Removed position information as requested
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
        suggestions = furnitureData.suggestions?.furniture_suggestions || [];
        colors = furnitureData.suggestions?.color_suggestions || [];
        setCurrentAiSuggestions(suggestions);
        setCurrentColorSuggestions(colors);
      }
    } catch (error) {
      console.error('Error fetching AI data for export:', error);
    }

    return { suggestions, colors };
  };

  const generatePDF = async () => {
    console.log('=== PDF GENERATION STARTED ===');
    setIsGenerating(true);
    
    try {
      console.log('Starting PDF generation...');
      
      // Capture the 3D scene (main view only)
      console.log('Capturing main view...');
      const mainCapture = await capture3DCanvas('default');
      console.log('Main capture result:', !!mainCapture);
      
      console.log('Final canvas capture result:', { 
        main: !!mainCapture,
        mainWidth: mainCapture?.width,
        mainHeight: mainCapture?.height
      });
      
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

      // Section: 3D Models in Scene (Table Format)
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('3D Models in Scene', margin, yPosition);
      yPosition += 15;

      if (placedModels.length === 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('No 3D models placed in the scene.', margin, yPosition);
        yPosition += 15;
      } else {
        // Prepare table data (removed position and description)
        const headers = ['#', 'Model Name', 'Category'];
        const columnWidths = [15, 90, 85]; // Total: 190 (fits in A4 width with margins)
        
        const rows = placedModels.map((model, index) => [
          (index + 1).toString(),
          model.name || 'Unnamed Model',
          model.category || 'N/A'
        ]);
        
        yPosition = drawTable(pdf, headers, rows, margin, yPosition, columnWidths);
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

      // Add 3D Design Preview (Main View Only)
      if (mainCapture) {
        console.log('Adding 3D design preview to PDF...');
        
        // Check if we need a new page for the image
        if (yPosition > pageHeight - 150) {
          pdf.addPage();
          yPosition = margin;
        }

        // Add section title
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('3D Design Preview', margin, yPosition);
        yPosition += 15;

        // Main perspective
        console.log('Adding main view to PDF...');
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Design View', margin, yPosition);
        yPosition += 10;
        
        const imgData = mainCapture.toDataURL('image/png');
        const imgWidth = Math.min(120, pageWidth - margin * 2);
        const imgHeight = (mainCapture.height * imgWidth) / mainCapture.width;
        
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;

        console.log('3D design preview added to PDF successfully');

        // Add separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;
      } else {
        console.log('No canvas capture available, skipping 3D design preview');
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
        // Prepare table data for AI suggestions
        const headers = ['#', 'Item', 'Category', 'Reason'];
        const columnWidths = [15, 40, 35, 100]; // Total: 190
        
        const rows = aiSuggestions.map((suggestion, index) => [
          (index + 1).toString(),
          suggestion.item || suggestion.furniture_type || 'N/A',
          suggestion.category || 'N/A',
          suggestion.reason || 'No reason provided'
        ]);
        
        yPosition = drawTable(pdf, headers, rows, margin, yPosition, columnWidths);
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

      // Section: AI Color Suggestions (Table Format)
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('AI Color Suggestions', margin, yPosition);
      yPosition += 15;

      if (colorSuggestions.length === 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('No AI color suggestions available.', margin, yPosition);
        yPosition += 15;
      } else {
        // Prepare table data for color suggestions
        const headers = ['#', 'Type', 'Color Code', 'Description'];
        const columnWidths = [15, 35, 40, 100]; // Total: 190
        
        const rows = colorSuggestions.map((colorSuggestion, index) => [
          (index + 1).toString(),
          colorSuggestion.type || 'Color',
          colorSuggestion.color || colorSuggestion.hex_code || 'N/A',
          colorSuggestion.description || colorSuggestion.reason || 'No description'
        ]);
        
        yPosition = drawTable(pdf, headers, rows, margin, yPosition, columnWidths);
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
