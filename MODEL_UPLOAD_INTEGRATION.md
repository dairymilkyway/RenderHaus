# 3D Model Upload Integration Guide

## 📍 **Where to Find the Upload Feature in Admin Dashboard**

### **Navigation Path:**
1. **Login as Admin** → Admin Dashboard loads
2. **Click "3D Models"** in the left sidebar
3. **Click "Upload New Model"** button (top right)

### **File Locations:**

#### **1. Admin Sidebar Navigation**
📁 `frontend/src/components/Admins/Sidebar.js`
- **Added**: "3D Models" menu item with CubeIcon
- **Route**: `/admin/models`

#### **2. Main Upload Component**
📁 `frontend/src/components/Admins/ModelManagement.js`
- **Features**:
  - ✅ Browse all existing 3D models
  - ✅ Search and filter models
  - ✅ Upload new models with form
  - ✅ Edit existing models
  - ✅ Delete models with confirmation
  - ✅ File validation (format & size)

#### **3. Styling**
📁 `frontend/src/components/Admins/css/ModelManagement.css`
- **Includes**: Professional admin panel styling, responsive design

#### **4. Routing**
📁 `frontend/src/App.js`
- **Added**: `/admin/models` route with admin protection

## 🎯 **How the Upload Works:**

### **Step-by-Step Upload Process:**
1. **Access**: Admin → 3D Models → "Upload New Model"
2. **Select File**: Choose .gltf, .glb, .obj, .fbx, .dae, or .3ds file (max 250MB)
3. **Fill Details**: Name, description, category, subcategory, style, tags, materials
4. **Submit**: File uploads to Cloudinary, metadata saves to MongoDB

### **API Endpoints Used:**
- `GET /api/models` - Fetch all models
- `POST /api/models/upload` - Upload new model with file
- `PUT /api/models/:id/upload` - Update model with new file
- `DELETE /api/models/:id` - Delete model

## 🎨 **Admin Dashboard UI Features:**

### **Model Management Interface:**
- **Grid View**: Cards showing model previews, metadata, and actions
- **Search Bar**: Search by name, description, or tags
- **Category Filter**: Filter by furniture, lighting, decoration, etc.
- **Action Buttons**: View, Edit, Delete for each model

### **Upload Modal:**
- **File Picker**: Drag & drop or click to select
- **Form Fields**: All model metadata inputs
- **Validation**: Real-time file type and size checking
- **Progress**: Upload status and error handling

## 🔧 **Backend Integration:**

### **File Upload Configuration:**
📁 `backend/controllers/modelController.js`
- **Multer**: Memory storage, 250MB limit, file type validation
- **Cloudinary**: Upload to `renderhaus/models` folder
- **Database**: Store file URL, metadata, and Cloudinary ID

### **API Routes:**
📁 `backend/routes/models.js`
- `POST /api/models/upload` - Admin only upload endpoint
- `PUT /api/models/:id/upload` - Admin only update endpoint

### **Environment Configuration:**
📁 `backend/.env`
```
CLOUDINARY_CLOUD_NAME=dqo2p0voh
CLOUDINARY_API_KEY=751995628489729
CLOUDINARY_API_SECRET=mRr_Jq6jMOhlOHi9hmF1ZxOiSJ0
```

## 🚀 **Usage Instructions:**

### **For Development:**
1. Start backend: `cd backend && node index.js`
2. Start frontend: `cd frontend && npm start`
3. Login as admin user
4. Navigate to Admin Dashboard → 3D Models

### **For Production:**
- Ensure Cloudinary credentials are configured
- Set up admin user accounts
- Test file upload limits and error handling

## 📱 **Responsive Design:**
- **Desktop**: Full grid layout with sidebar
- **Tablet**: Responsive grid with collapsible sidebar
- **Mobile**: Single column layout with mobile-optimized forms

## 🛡️ **Security Features:**
- **Admin Only**: All upload endpoints require admin authentication
- **File Validation**: Type and size checking on both frontend and backend
- **Error Handling**: Comprehensive error messages and validation
- **JWT Protection**: All API calls use bearer token authentication

---

## 🎯 **Quick Access:**
**Direct URL**: `http://localhost:3000/admin/models` (after admin login)
**Sidebar**: Admin Dashboard → "3D Models" → "Upload New Model"
