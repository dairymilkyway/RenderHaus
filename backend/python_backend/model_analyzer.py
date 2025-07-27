import json
import requests
import tempfile
import os
from typing import List, Dict, Any, Tuple
import numpy as np
from PIL import Image, ImageStat
from pygltflib import GLTF2
import base64
from io import BytesIO
import colorsys
from sklearn.cluster import KMeans
import cv2

class Model3DAnalyzer:
    def __init__(self):
        self.color_cache = {}
        
    def analyze_model_from_url(self, model_url: str, model_name: str = "") -> Dict[str, Any]:
        """
        Download and analyze a 3D model from Uploadcare URL
        Returns color analysis and material information
        """
        try:
            print(f"Analyzing 3D model: {model_name} from {model_url}")
            
            # Download the GLB file
            response = requests.get(model_url, timeout=30)
            if response.status_code != 200:
                raise Exception(f"Failed to download model: {response.status_code}")
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.glb', delete=False) as temp_file:
                temp_file.write(response.content)
                temp_path = temp_file.name
            
            try:
                # Analyze the GLB file
                analysis = self._analyze_glb_file(temp_path, model_name)
                return analysis
            finally:
                # Clean up temporary file
                os.unlink(temp_path)
                
        except Exception as e:
            print(f"Error analyzing model {model_name}: {str(e)}")
            return {
                'colors': [],
                'dominant_colors': [],
                'materials': [],
                'error': str(e),
                'fallback': True
            }
    
    def _analyze_glb_file(self, file_path: str, model_name: str) -> Dict[str, Any]:
        """Analyze GLB file for colors and materials"""
        try:
            # Load GLTF file
            gltf_obj = GLTF2().load(file_path)
            
            analysis = {
                'colors': [],
                'dominant_colors': [],
                'materials': [],
                'textures_analyzed': 0,
                'material_colors': [],
                'texture_colors': []
            }
            
            # Analyze materials
            if gltf_obj.materials:
                for material in gltf_obj.materials:
                    material_analysis = self._analyze_material(material, gltf_obj)
                    analysis['materials'].append(material_analysis)
                    
                    # Extract colors from material properties
                    if material_analysis.get('base_color'):
                        analysis['material_colors'].extend(material_analysis['base_color'])
            
            # Analyze embedded textures
            if gltf_obj.images:
                for i, image in enumerate(gltf_obj.images):
                    try:
                        texture_colors = self._analyze_texture(image, gltf_obj, i)
                        analysis['texture_colors'].extend(texture_colors)
                        analysis['textures_analyzed'] += 1
                    except Exception as e:
                        print(f"Error analyzing texture {i}: {e}")
            
            # Combine and process all colors
            all_colors = analysis['material_colors'] + analysis['texture_colors']
            
            if all_colors:
                # Get dominant colors using clustering
                analysis['dominant_colors'] = self._get_dominant_colors(all_colors)
                hex_colors = [self._rgb_to_hex(color) for color in analysis['dominant_colors']]
                
                # Check if we only got white/neutral colors - if so, try material name analysis
                if all(color.upper() in ['#FFFFFF', '#F5F5DC', '#FFFDD0'] for color in hex_colors):
                    print("Only white/neutral colors found, trying material name analysis")
                    material_colors = self._analyze_material_names(gltf_obj.materials if gltf_obj.materials else [])
                    
                    if material_colors:
                        analysis['colors'] = material_colors
                        analysis['material_name_analysis'] = True
                        print(f"Material name analysis successful: {material_colors}")
                    else:
                        analysis['colors'] = hex_colors
                else:
                    analysis['colors'] = hex_colors
            else:
                # Alternative approach: Try to infer colors from material names
                print("No colors from materials/textures, trying material name analysis")
                material_colors = self._analyze_material_names(gltf_obj.materials if gltf_obj.materials else [])
                
                if material_colors:
                    analysis['colors'] = material_colors
                    analysis['material_name_analysis'] = True
                else:
                    # Final fallback to name-based analysis
                    print(f"No colors extracted from 3D model, using name-based fallback")
                    analysis['colors'] = self._fallback_color_analysis(model_name)
                    analysis['fallback'] = True
            
            return analysis
            
        except Exception as e:
            print(f"Error in GLB analysis: {e}")
            return {
                'colors': self._fallback_color_analysis(model_name),
                'error': str(e),
                'fallback': True
            }
    
    def _analyze_material(self, material, gltf_obj) -> Dict[str, Any]:
        """Analyze a single material for color information"""
        material_info = {
            'name': material.name if material.name else 'Unnamed',
            'base_color': [],
            'metallic': 0,
            'roughness': 0
        }
        
        if hasattr(material, 'pbrMetallicRoughness') and material.pbrMetallicRoughness:
            pbr = material.pbrMetallicRoughness
            
            # Extract base color factor (RGBA)
            if hasattr(pbr, 'baseColorFactor') and pbr.baseColorFactor:
                rgba = pbr.baseColorFactor
                # Convert to RGB (ignore alpha for color analysis)
                rgb = [int(rgba[0] * 255), int(rgba[1] * 255), int(rgba[2] * 255)]
                material_info['base_color'] = [rgb]
                print(f"Material '{material_info['name']}' base color: {rgb}")
            
            # Extract metallic and roughness factors
            if hasattr(pbr, 'metallicFactor'):
                material_info['metallic'] = pbr.metallicFactor or 0
            if hasattr(pbr, 'roughnessFactor'):
                material_info['roughness'] = pbr.roughnessFactor or 0
        
        return material_info
    
    def _analyze_texture(self, image, gltf_obj, index: int) -> List[List[int]]:
        """Extract colors from a texture image"""
        try:
            if hasattr(image, 'uri') and image.uri:
                if image.uri.startswith('data:'):
                    # Embedded base64 image
                    header, data = image.uri.split(',', 1)
                    image_data = base64.b64decode(data)
                    pil_image = Image.open(BytesIO(image_data))
                else:
                    # External image file (less common in GLB)
                    print(f"External texture reference found: {image.uri}")
                    return []
            elif hasattr(image, 'bufferView') and image.bufferView is not None:
                # Image stored in buffer
                buffer_view = gltf_obj.bufferViews[image.bufferView]
                buffer_obj = gltf_obj.buffers[buffer_view.buffer]
                
                # Access buffer data correctly
                if hasattr(buffer_obj, 'data'):
                    buffer_data = buffer_obj.data
                elif hasattr(buffer_obj, 'uri') and buffer_obj.uri:
                    # Handle data URI or external buffer
                    if buffer_obj.uri.startswith('data:'):
                        header, data = buffer_obj.uri.split(',', 1)
                        buffer_data = base64.b64decode(data)
                    else:
                        print(f"External buffer reference found: {buffer_obj.uri}")
                        return []
                else:
                    print(f"Cannot access buffer data for texture {index}")
                    return []
                
                start = buffer_view.byteOffset or 0
                end = start + buffer_view.byteLength
                image_data = buffer_data[start:end]
                pil_image = Image.open(BytesIO(image_data))
            else:
                return []
            
            # Convert to RGB if necessary
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Resize for faster processing (max 100x100)
            if pil_image.size[0] > 100 or pil_image.size[1] > 100:
                pil_image.thumbnail((100, 100), Image.Resampling.LANCZOS)
            
            # Extract dominant colors from texture
            colors = self._extract_colors_from_image(pil_image)
            print(f"Extracted {len(colors)} colors from texture {index}")
            
            return colors
            
        except Exception as e:
            print(f"Error processing texture {index}: {e}")
            return []
    
    def _extract_colors_from_image(self, image: Image.Image, max_colors: int = 5) -> List[List[int]]:
        """Extract dominant colors from a PIL Image"""
        try:
            # Convert image to numpy array
            img_array = np.array(image)
            pixels = img_array.reshape(-1, 3)
            
            # Remove pure black and white pixels (often background/noise)
            mask = ~((pixels == [0, 0, 0]).all(axis=1) | (pixels == [255, 255, 255]).all(axis=1))
            filtered_pixels = pixels[mask]
            
            if len(filtered_pixels) == 0:
                return []
            
            # Use KMeans to find dominant colors
            n_colors = min(max_colors, len(filtered_pixels))
            if n_colors < 1:
                return []
            
            kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
            kmeans.fit(filtered_pixels)
            
            # Get cluster centers (dominant colors)
            colors = []
            for center in kmeans.cluster_centers_:
                color = [int(c) for c in center]
                colors.append(color)
            
            return colors
            
        except Exception as e:
            print(f"Error extracting colors from image: {e}")
            return []
    
    def _get_dominant_colors(self, all_colors: List[List[int]], max_colors: int = 5) -> List[List[int]]:
        """Get dominant colors from all extracted colors using clustering"""
        if not all_colors:
            return []
        
        try:
            # Convert to numpy array
            colors_array = np.array(all_colors)
            
            # Use KMeans to find the most dominant colors across all sources
            n_colors = min(max_colors, len(all_colors))
            if n_colors < 1:
                return []
            
            kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
            kmeans.fit(colors_array)
            
            # Sort by cluster size (most common colors first)
            labels = kmeans.labels_
            centers = kmeans.cluster_centers_
            
            # Count occurrences of each cluster
            unique_labels, counts = np.unique(labels, return_counts=True)
            
            # Sort centers by count (descending)
            sorted_indices = np.argsort(counts)[::-1]
            dominant_colors = []
            
            for idx in sorted_indices:
                color = [int(c) for c in centers[idx]]
                dominant_colors.append(color)
            
            return dominant_colors
            
        except Exception as e:
            print(f"Error getting dominant colors: {e}")
            return all_colors[:max_colors]  # Fallback to first few colors
    
    def _rgb_to_hex(self, rgb: List[int]) -> str:
        """Convert RGB list to hex color code"""
        return "#{:02x}{:02x}{:02x}".format(rgb[0], rgb[1], rgb[2])
    
    def _hex_to_rgb(self, hex_color: str) -> List[int]:
        """Convert hex color to RGB list"""
        hex_color = hex_color.lstrip('#')
        return [int(hex_color[i:i+2], 16) for i in (0, 2, 4)]
    
    def _fallback_color_analysis(self, model_name: str) -> List[str]:
        """Fallback color analysis based on model name"""
        color_keywords = {
            'red': ['red', 'burgundy', 'maroon', 'crimson', 'cherry', 'rose', 'scarlet'],
            'blue': ['blue', 'navy', 'teal', 'aqua', 'cobalt', 'cerulean', 'azure'],
            'green': ['green', 'olive', 'forest', 'sage', 'mint', 'emerald', 'jade'],
            'brown': ['brown', 'wood', 'wooden', 'oak', 'walnut', 'mahogany', 'teak', 'rustic', 'chocolate'],
            'white': ['white', 'ivory', 'cream', 'pearl', 'alabaster'],
            'black': ['black', 'dark', 'charcoal', 'ebony', 'midnight'],
            'gray': ['gray', 'grey', 'silver', 'slate', 'ash', 'stone'],
            'yellow': ['yellow', 'gold', 'golden', 'amber', 'lemon'],
            'orange': ['orange', 'coral', 'peach', 'apricot', 'rust'],
            'beige': ['beige', 'tan', 'khaki', 'sand', 'camel', 'nude']
        }
        
        detected_colors = []
        model_name_lower = model_name.lower()
        
        for color, keywords in color_keywords.items():
            for keyword in keywords:
                if keyword in model_name_lower:
                    # Convert color name to hex
                    color_map = {
                        'red': '#DC143C', 'blue': '#0066CC', 'green': '#228B22',
                        'brown': '#8B4513', 'white': '#FFFFFF', 'black': '#000000',
                        'gray': '#808080', 'yellow': '#FFD700', 'orange': '#FF8C00',
                        'beige': '#F5F5DC'
                    }
                    if color in color_map:
                        detected_colors.append(color_map[color])
                    break
        
        # Default colors if none detected
        if not detected_colors:
            detected_colors = ['#8B4513', '#F5F5DC', '#808080']  # Brown, Beige, Gray
        
        return detected_colors[:3]  # Return top 3 colors
    
    def _analyze_material_names(self, materials) -> List[str]:
        """Analyze material names to infer colors"""
        detected_colors = []
        
        color_keywords = {
            'red': ['red', 'burgundy', 'maroon', 'crimson', 'cherry', 'rose'],
            'blue': ['blue', 'navy', 'teal', 'aqua', 'cobalt', 'azure'],
            'green': ['green', 'olive', 'forest', 'sage', 'mint', 'emerald'],
            'brown': ['brown', 'wood', 'wooden', 'oak', 'walnut', 'mahogany', 'teak', 'rustic', 'chocolate'],
            'white': ['white', 'ivory', 'cream', 'pearl', 'alabaster'],
            'black': ['black', 'dark', 'charcoal', 'ebony', 'midnight'],
            'gray': ['gray', 'grey', 'silver', 'slate', 'ash', 'stone'],
            'yellow': ['yellow', 'gold', 'golden', 'amber', 'lemon'],
            'orange': ['orange', 'coral', 'peach', 'apricot', 'rust'],
            'metal': ['metal', 'steel', 'aluminum', 'chrome', 'brass', 'copper', 'bronze', 'iron']
        }
        
        # Kitchen-specific material mappings
        kitchen_materials = {
            'appliance': ['#C0C0C0', '#FFFFFF'],  # Silver, White (appliances)
            'woodenFurniture': ['#8B4513', '#DEB887'],  # Brown, BurlyWood (wooden furniture)
            'cabinet': ['#8B4513', '#F5F5DC'],  # Brown, Beige (cabinets)
            'counter': ['#696969', '#FFFFFF'],  # DimGray, White (countertops)
            'floor': ['#8B4513', '#D2B48C'],  # Brown, Tan (floors)
            'wall': ['#F5F5DC', '#FFFFFF']  # Beige, White (walls)
        }
        
        for material in materials:
            if material.name:
                material_name = material.name.lower()
                print(f"Analyzing material name: '{material.name}'")
                
                # Check for kitchen-specific materials
                for kitchen_mat, colors in kitchen_materials.items():
                    if kitchen_mat in material_name:
                        detected_colors.extend(colors)
                        print(f"Found kitchen material '{kitchen_mat}' - added colors: {colors}")
                        break
                else:
                    # Check for general color keywords
                    for color, keywords in color_keywords.items():
                        for keyword in keywords:
                            if keyword in material_name:
                                color_map = {
                                    'red': '#DC143C', 'blue': '#0066CC', 'green': '#228B22',
                                    'brown': '#8B4513', 'white': '#FFFFFF', 'black': '#000000',
                                    'gray': '#808080', 'yellow': '#FFD700', 'orange': '#FF8C00',
                                    'metal': '#C0C0C0'
                                }
                                if color in color_map:
                                    detected_colors.append(color_map[color])
                                    print(f"Found color keyword '{keyword}' in material '{material.name}' - added color: {color_map[color]}")
                                break
        
        # Remove duplicates and return unique colors
        unique_colors = list(set(detected_colors))
        print(f"Material name analysis result: {unique_colors}")
        return unique_colors[:5]  # Return top 5 colors
    
    def get_color_name_from_hex(self, hex_color: str) -> str:
        """Convert hex color to nearest color name"""
        color_names = {
            '#DC143C': 'Red', '#8B4513': 'Brown', '#228B22': 'Green',
            '#0066CC': 'Blue', '#FFD700': 'Yellow', '#FF8C00': 'Orange',
            '#800080': 'Purple', '#FFC0CB': 'Pink', '#FFFFFF': 'White',
            '#000000': 'Black', '#808080': 'Gray', '#F5F5DC': 'Beige',
            '#FFFDD0': 'Cream', '#000080': 'Navy', '#008080': 'Teal'
        }
        
        # Find closest color by RGB distance
        target_rgb = self._hex_to_rgb(hex_color)
        min_distance = float('inf')
        closest_name = 'Unknown'
        
        for hex_val, name in color_names.items():
            rgb = self._hex_to_rgb(hex_val)
            distance = sum((a - b) ** 2 for a, b in zip(target_rgb, rgb))
            if distance < min_distance:
                min_distance = distance
                closest_name = name
        
        return closest_name
