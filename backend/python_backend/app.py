from flask import Flask, jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from ai_suggestions import ai_suggester

# Load environment variables
load_dotenv()

app = Flask(__name__)

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
db = client['renderhaus']

@app.route('/api/python/test', methods=['GET'])
def test_route():
    return jsonify({
        'status': 'success',
        'message': 'Python backend is working!'
    })

@app.route('/api/python/health', methods=['GET'])
def health_check():
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        return jsonify({
            'status': 'success',
            'message': 'Python backend is healthy',
            'mongodb_status': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'mongodb_status': 'disconnected'
        }), 500

@app.route('/api/python/ai/suggestions', methods=['POST'])
def get_ai_suggestions():
    try:
        data = request.get_json()
        # Handle both parameter names for compatibility
        placed_models = data.get('placedModels', data.get('current_models', []))
        
        # Generate AI suggestions
        suggestions = ai_suggester.generate_full_suggestions(placed_models)
        
        return jsonify({
            'status': 'success',
            'suggestions': suggestions
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/python/ai/color-suggestions', methods=['POST'])
def get_color_suggestions():
    try:
        data = request.get_json()
        # Handle both parameter names for compatibility
        placed_models = data.get('placedModels', data.get('current_models', []))
        furniture_type = data.get('furnitureType', 'sofa')
        
        # Analyze current setup
        analysis = ai_suggester.analyze_current_furniture(placed_models)
        
        # Get color suggestions for specific furniture type
        color_suggestions = ai_suggester.suggest_colors(analysis, furniture_type)
        
        return jsonify({
            'status': 'success',
            'color_suggestions': color_suggestions,
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PYTHON_PORT', 5001))
    app.run(host='0.0.0.0', port=port) 