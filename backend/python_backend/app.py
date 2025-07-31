from flask import Flask, jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from ai_suggestions import ai_suggester
from thumbnail_generator import thumbnail_generator

# Load environment variables
load_dotenv()

app = Flask(__name__)

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
    db = client['renderhaus']
    # Test connection
    client.admin.command('ping')
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"⚠️  MongoDB connection failed: {e}")
    print("📝 Server will continue without MongoDB (some features may be limited)")
    client = None
    db = None

@app.route('/api/python/test', methods=['GET'])
def test_route():
    return jsonify({
        'status': 'success',
        'message': 'Python backend is working!'
    })

@app.route('/api/python/health', methods=['GET'])
def health_check():
    mongodb_status = 'disconnected'
    try:
        if client:
            # Test MongoDB connection
            client.admin.command('ping')
            mongodb_status = 'connected'
        
        return jsonify({
            'status': 'success',
            'message': 'Python backend is healthy',
            'mongodb_status': mongodb_status
        })
    except Exception as e:
        return jsonify({
            'status': 'partial',
            'message': 'Python backend is running but MongoDB is unavailable',
            'mongodb_status': 'disconnected',
            'error': str(e)
        })

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

@app.route('/api/python/thumbnail/generate', methods=['POST'])
def generate_thumbnail():
    try:
        data = request.get_json()
        model_url = data.get('modelUrl')
        size = data.get('size', [400, 400])  # Default size
        
        if not model_url:
            return jsonify({
                'status': 'error',
                'message': 'modelUrl is required'
            }), 400
        
        # Generate thumbnail from the 3D model URL
        thumbnail_base64 = thumbnail_generator.generate_thumbnail_from_url(
            model_url, 
            output_format='base64', 
            size=tuple(size)
        )
        
        if thumbnail_base64:
            return jsonify({
                'status': 'success',
                'thumbnail': f"data:image/png;base64,{thumbnail_base64}",
                'message': 'Thumbnail generated successfully'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to generate thumbnail'
            }), 500
            
    except Exception as e:
        print(f"Error in thumbnail generation endpoint: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Thumbnail generation failed: {str(e)}'
        }), 500

@app.route('/api/python/thumbnail/batch', methods=['POST'])
def generate_thumbnails_batch():
    try:
        data = request.get_json()
        models = data.get('models', [])  # Array of {id, modelUrl}
        size = data.get('size', [400, 400])
        
        if not models:
            return jsonify({
                'status': 'error',
                'message': 'models array is required'
            }), 400
        
        results = []
        
        for model in models:
            model_id = model.get('id')
            model_url = model.get('modelUrl')
            
            if not model_id or not model_url:
                results.append({
                    'id': model_id,
                    'status': 'error',
                    'message': 'Both id and modelUrl are required'
                })
                continue
            
            try:
                thumbnail_base64 = thumbnail_generator.generate_thumbnail_from_url(
                    model_url, 
                    output_format='base64', 
                    size=tuple(size)
                )
                
                if thumbnail_base64:
                    results.append({
                        'id': model_id,
                        'status': 'success',
                        'thumbnail': f"data:image/png;base64,{thumbnail_base64}"
                    })
                else:
                    results.append({
                        'id': model_id,
                        'status': 'error',
                        'message': 'Failed to generate thumbnail'
                    })
                    
            except Exception as e:
                results.append({
                    'id': model_id,
                    'status': 'error',
                    'message': str(e)
                })
        
        return jsonify({
            'status': 'success',
            'results': results,
            'message': f'Processed {len(results)} models'
        })
        
    except Exception as e:
        print(f"Error in batch thumbnail generation: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Batch thumbnail generation failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PYTHON_PORT', 5001))
    app.run(host='0.0.0.0', port=port) 