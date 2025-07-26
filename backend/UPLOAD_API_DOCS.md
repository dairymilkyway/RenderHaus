## 3D Model Upload API Documentation

### New Upload Endpoints Added to Admin Panel

#### 1. Upload New 3D Model
**POST** `/api/models/upload`

**Headers:**
- `Authorization: Bearer <admin_jwt_token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `modelFile` (required): The 3D model file
- `name` (optional): Model name
- `description` (optional): Model description
- `category` (optional): Model category (default: 'furniture')
- `subcategory` (optional): Model subcategory (default: 'chair')
- `style` (optional): Model style (default: 'modern')
- `tags` (optional): Comma-separated tags
- `dimensions` (optional): JSON string of dimensions `{"width": 1, "height": 1, "depth": 1}`
- `materials` (optional): Comma-separated materials
- `compatibility` (optional): Comma-separated compatibility options

**Supported File Formats:**
- `.gltf` (recommended)
- `.glb` (recommended)
- `.obj`
- `.fbx`
- `.dae`
- `.3ds`

**File Size Limit:** 250MB

**Response:**
```json
{
  "status": "success",
  "message": "Model uploaded successfully",
  "data": {
    "_id": "...",
    "name": "model_name",
    "fileUrl": "https://res.cloudinary.com/...",
    "cloudinaryId": "...",
    ...
  }
}
```

#### 2. Update Existing Model with New File
**PUT** `/api/models/:id/upload`

**Headers:**
- `Authorization: Bearer <admin_jwt_token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `modelFile` (optional): New 3D model file to replace existing
- Any other model fields to update

**Response:**
```json
{
  "status": "success",
  "message": "Model updated successfully",
  "data": {
    "_id": "...",
    "name": "updated_model_name",
    "fileUrl": "https://res.cloudinary.com/...",
    ...
  }
}
```

### Usage Example with JavaScript (Frontend)

```javascript
// Upload new model
const uploadModel = async (file, modelData) => {
  const formData = new FormData();
  formData.append('modelFile', file);
  formData.append('name', modelData.name);
  formData.append('description', modelData.description);
  formData.append('category', modelData.category);
  formData.append('tags', modelData.tags.join(','));
  
  const response = await fetch('/api/models/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });
  
  return response.json();
};

// Update existing model with new file
const updateModelFile = async (modelId, file, updateData) => {
  const formData = new FormData();
  if (file) formData.append('modelFile', file);
  
  Object.keys(updateData).forEach(key => {
    formData.append(key, updateData[key]);
  });
  
  const response = await fetch(`/api/models/${modelId}/upload`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });
  
  return response.json();
};
```

### Error Responses

```json
// No file uploaded
{
  "status": "error",
  "message": "No file uploaded"
}

// Invalid file type
{
  "status": "error",
  "message": "Invalid file type. Only 3D model files are allowed."
}

// File too large
{
  "status": "error",
  "message": "File size exceeds 250MB limit"
}

// Cloudinary upload error
{
  "status": "error",
  "message": "Cloudinary upload failed: ..."
}
```

### Implementation Notes

1. Files are uploaded to Cloudinary under the folder `renderhaus/models`
2. Old files are automatically deleted from Cloudinary when updating with a new file
3. File metadata (size, format, original name) is stored in the database
4. The `cloudinaryId` is stored for future file management
5. Admin authentication is required for all upload operations
