import base64
import io
import hashlib
import requests
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class ThumbnailGenerator:
    def __init__(self):
        self.default_size = (400, 400)
        self.cache = {}  # Simple in-memory cache
    
    def generate_thumbnail_from_url(self, model_url: str, output_format: str = 'base64', size: Tuple[int, int] = None) -> Optional[str]:
        """
        Generate a thumbnail from a 3D model URL.
        
        For now, this creates a placeholder thumbnail since we don't have 3D rendering capabilities.
        In a full implementation, this would use libraries like Open3D or Blender Python API.
        
        Args:
            model_url (str): URL of the 3D model
            output_format (str): Output format ('base64', 'bytes', 'file')
            size (Tuple[int, int]): Size of the thumbnail (width, height)
        
        Returns:
            str: Base64 encoded thumbnail or None if failed
        """
        if not model_url:
            return None
        
        size = size or self.default_size
        
        # Create cache key
        cache_key = f"{model_url}_{size[0]}x{size[1]}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            # Generate placeholder thumbnail
            thumbnail_image = self._create_placeholder_thumbnail(model_url, size)
            
            if output_format == 'base64':
                # Convert to base64
                buffer = io.BytesIO()
                thumbnail_image.save(buffer, format='PNG')
                thumbnail_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                
                # Cache the result
                self.cache[cache_key] = thumbnail_base64
                return thumbnail_base64
            
            elif output_format == 'bytes':
                buffer = io.BytesIO()
                thumbnail_image.save(buffer, format='PNG')
                return buffer.getvalue()
            
            else:
                logger.warning(f"Unsupported output format: {output_format}")
                return None
        
        except Exception as e:
            logger.error(f"Error generating thumbnail for {model_url}: {str(e)}")
            return None
    
    def _create_placeholder_thumbnail(self, model_url: str, size: Tuple[int, int]) -> Image.Image:
        """Create a placeholder thumbnail image."""
        width, height = size
        
        # Create a unique hash for the model URL
        model_hash = hashlib.md5(model_url.encode()).hexdigest()[:8]
        
        # Create base image with gradient background
        image = Image.new('RGB', (width, height), color='#f8fafc')
        draw = ImageDraw.Draw(image)
        
        # Add gradient effect
        for y in range(height):
            color_value = int(248 - (y / height) * 40)  # Gradient from light to darker
            draw.line([(0, y), (width, y)], fill=(color_value, color_value + 10, 255))
        
        # Draw 3D model icon (isometric cube)
        self._draw_3d_cube(draw, width, height)
        
        # Add model information text
        try:
            # Try to load a font, fall back to default if not available
            try:
                font_large = ImageFont.truetype("arial.ttf", 16)
                font_small = ImageFont.truetype("arial.ttf", 12)
            except (OSError, IOError):
                font_large = ImageFont.load_default()
                font_small = ImageFont.load_default()
            
            # Add title
            title = "3D Model"
            title_bbox = draw.textbbox((0, 0), title, font=font_large)
            title_width = title_bbox[2] - title_bbox[0]
            title_x = (width - title_width) // 2
            title_y = height - 60
            draw.text((title_x, title_y), title, fill='#374151', font=font_large)
            
            # Add hash
            hash_text = f"ID: {model_hash}"
            hash_bbox = draw.textbbox((0, 0), hash_text, font=font_small)
            hash_width = hash_bbox[2] - hash_bbox[0]
            hash_x = (width - hash_width) // 2
            hash_y = height - 35
            draw.text((hash_x, hash_y), hash_text, fill='#6B7280', font=font_small)
            
            # Add file format hint
            format_text = self._guess_format_from_url(model_url)
            format_bbox = draw.textbbox((0, 0), format_text, font=font_small)
            format_width = format_bbox[2] - format_bbox[0]
            format_x = (width - format_width) // 2
            format_y = height - 15
            draw.text((format_x, format_y), format_text, fill='#9CA3AF', font=font_small)
            
        except Exception as e:
            logger.warning(f"Could not add text to thumbnail: {str(e)}")
        
        return image
    
    def _draw_3d_cube(self, draw: ImageDraw.Draw, width: int, height: int):
        """Draw a simple 3D cube icon in isometric projection."""
        # Calculate cube dimensions and position
        cube_size = min(width, height) // 6
        center_x, center_y = width // 2, height // 2 - 30
        
        # Define cube vertices in isometric projection
        # Front face
        front_vertices = [
            (center_x - cube_size//2, center_y + cube_size//4),      # bottom left
            (center_x + cube_size//2, center_y + cube_size//4),      # bottom right
            (center_x + cube_size//2, center_y - cube_size//2),      # top right
            (center_x - cube_size//2, center_y - cube_size//2),      # top left
        ]
        
        # Top face
        top_vertices = [
            (center_x - cube_size//2, center_y - cube_size//2),      # front left
            (center_x + cube_size//2, center_y - cube_size//2),      # front right
            (center_x + cube_size//2 + cube_size//3, center_y - cube_size//2 - cube_size//3),  # back right
            (center_x - cube_size//2 + cube_size//3, center_y - cube_size//2 - cube_size//3),  # back left
        ]
        
        # Right face
        right_vertices = [
            (center_x + cube_size//2, center_y + cube_size//4),      # front bottom
            (center_x + cube_size//2, center_y - cube_size//2),      # front top
            (center_x + cube_size//2 + cube_size//3, center_y - cube_size//2 - cube_size//3),  # back top
            (center_x + cube_size//2 + cube_size//3, center_y + cube_size//4 - cube_size//3),  # back bottom
        ]
        
        # Draw faces with different shades
        draw.polygon(front_vertices, fill='#3B82F6', outline='#1E40AF', width=2)  # Blue front face
        draw.polygon(top_vertices, fill='#60A5FA', outline='#1E40AF', width=2)    # Light blue top face
        draw.polygon(right_vertices, fill='#2563EB', outline='#1E40AF', width=2)  # Dark blue right face
    
    def _guess_format_from_url(self, url: str) -> str:
        """Guess the 3D model format from the URL."""
        url_lower = url.lower()
        if '.glb' in url_lower:
            return 'GLB Format'
        elif '.gltf' in url_lower:
            return 'glTF Format'
        elif '.obj' in url_lower:
            return 'OBJ Format'
        elif '.fbx' in url_lower:
            return 'FBX Format'
        elif '.dae' in url_lower:
            return 'COLLADA Format'
        else:
            return '3D Model'
    
    def generate_batch_thumbnails(self, model_urls: list, size: Tuple[int, int] = None) -> dict:
        """Generate thumbnails for multiple models."""
        results = {}
        
        for url in model_urls:
            try:
                thumbnail = self.generate_thumbnail_from_url(url, 'base64', size)
                results[url] = {
                    'success': True,
                    'thumbnail': thumbnail
                }
            except Exception as e:
                results[url] = {
                    'success': False,
                    'error': str(e)
                }
        
        return results
    
    def clear_cache(self):
        """Clear the thumbnail cache."""
        self.cache.clear()
        logger.info("Thumbnail cache cleared")

# Create global instance
thumbnail_generator = ThumbnailGenerator()
