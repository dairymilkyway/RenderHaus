import React, { useState } from 'react';
import { LightBulbIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import './css/Sections.css';

const AIExplainSection = () => {
  const [query, setQuery] = useState('');
  const [explanations, setExplanations] = useState([
    {
      id: 1,
      question: 'What makes this room layout effective?',
      answer: 'The current layout follows the principles of spatial flow and functionality. The furniture arrangement creates clear pathways while maintaining conversation areas. The focal point (fireplace/TV) is properly emphasized, and the seating is arranged to promote social interaction while maximizing the view outside.',
      timestamp: '2 min ago'
    },
    {
      id: 2,
      question: 'Why choose these materials?',
      answer: 'The selected materials create a cohesive design through complementary textures and colors. The wood flooring adds warmth, while the metal accents provide modern contrast. The fabric choices are durable and suitable for high-traffic areas while maintaining aesthetic appeal.',
      timestamp: '5 min ago'
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newExplanation = {
      id: explanations.length + 1,
      question: query,
      answer: 'Analyzing your question... The AI will provide a detailed explanation shortly.',
      timestamp: 'Just now'
    };

    setExplanations([newExplanation, ...explanations]);
    setQuery('');
  };

  return (
    <div className="section-container">
      <h2>AI Design Assistant</h2>
      
      <form onSubmit={handleSubmit} className="explain-form">
        <div className="input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your design..."
            className="explain-input"
          />
          <button type="submit" className="ask-button">
            Ask AI
          </button>
        </div>
      </form>

      <div className="explanations-list">
        {explanations.map(explanation => (
          <div key={explanation.id} className="explanation-card">
            <div className="explanation-header">
              <LightBulbIcon className="explanation-icon" />
              <div className="explanation-meta">
                <h4>{explanation.question}</h4>
                <span className="timestamp">{explanation.timestamp}</span>
              </div>
            </div>
            <div className="explanation-body">
              <p>{explanation.answer}</p>
            </div>
            <button className="expand-button">
              <ChevronDownIcon className="expand-icon" />
              Show more
            </button>
          </div>
        ))}
      </div>

      <div className="quick-questions">
        <h3>Suggested Questions</h3>
        <div className="question-buttons">
          <button>How can I improve lighting?</button>
          <button>Suggest color schemes</button>
          <button>Optimize room flow</button>
        </div>
      </div>
    </div>
  );
};

export default AIExplainSection; 