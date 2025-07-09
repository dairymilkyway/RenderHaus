from flask import Flask, jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv
import os

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

if __name__ == '__main__':
    port = int(os.getenv('PYTHON_PORT', 5001))
    app.run(host='0.0.0.0', port=port) 