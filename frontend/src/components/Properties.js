import React from 'react';
import TemplatesSection from './Functions/TemplatesSection';
import ComponentsSection from './Functions/ComponentsSection';
import MaterialsSection from './Functions/MaterialsSection';
import ViewSection from './Functions/ViewSection';
import AISuggestSection from './Functions/AISuggestSection';
import AIExplainSection from './Functions/AIExplainSection';
import SaveExportSection from './Functions/SaveExportSection';
import './css/Properties.css';

const Properties = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'templates':
        return <TemplatesSection />;
      case 'components':
        return <ComponentsSection />;
      case 'materials':
        return <MaterialsSection />;
      case 'view':
        return <ViewSection />;
      case 'ai-suggest':
        return <AISuggestSection />;
      case 'ai-explain':
        return <AIExplainSection />;
      case 'save-export':
        return <SaveExportSection />;
      default:
        return (
          <div className="properties-panel">
            <h3>Properties</h3>
            <div className="property-placeholder">
              Select a tool from the sidebar to view options
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-sidebar right">
      {renderSection()}
    </div>
  );
};

export default Properties; 