import json
import random
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from model_analyzer import Model3DAnalyzer

class FurnitureAISuggester:
    def __init__(self):
        # Initialize 3D model analyzer
        self.model_analyzer = Model3DAnalyzer()
        
        # Enhanced color to hex code mapping
        self.color_hex_map = {
            "white": "#FFFFFF",
            "black": "#000000",
            "gray": "#808080",
            "grey": "#808080",
            "brown": "#8B4513",
            "beige": "#F5F5DC",
            "cream": "#FFFDD0",
            "navy": "#000080",
            "blue": "#0066CC",
            "red": "#DC143C",
            "green": "#228B22",
            "yellow": "#FFD700",
            "orange": "#FF8C00",
            "purple": "#800080",
            "pink": "#FFC0CB",
            "wood": "#DEB887",
            "metal": "#C0C0C0",
            "gold": "#FFD700",
            "silver": "#C0C0C0",
            "charcoal": "#36454F",
            "tan": "#D2B48C",
            "neutral": "#F0F0F0",
            "teal": "#008080",
            "burgundy": "#800020",
            "olive": "#808000",
            "maroon": "#800000",
            "coral": "#FF7F50",
            "salmon": "#FA8072",
            "ivory": "#FFFFF0",
            "khaki": "#F0E68C"
        }
        
        # Define furniture categories and their characteristics
        self.furniture_database = {
            "sofa": {
                "colors": ["beige", "gray", "brown", "navy", "cream", "charcoal"],
                "styles": ["modern", "classic", "minimalist", "industrial"],
                "room_compatibility": ["living_room", "bedroom", "office"],
                "complements": ["coffee_table", "side_table", "lamp", "rug"]
            },
            "coffee_table": {
                "colors": ["wood", "glass", "black", "white", "metal"],
                "styles": ["modern", "rustic", "glass", "industrial"],
                "room_compatibility": ["living_room"],
                "complements": ["sofa", "armchair", "rug", "lamp"]
            },
            "dining_table": {
                "colors": ["wood", "white", "black", "marble"],
                "styles": ["modern", "rustic", "classic", "industrial"],
                "room_compatibility": ["dining_room", "kitchen"],
                "complements": ["dining_chair", "chandelier", "sideboard"]
            },
            "bed": {
                "colors": ["white", "gray", "brown", "black", "cream"],
                "styles": ["modern", "classic", "minimalist", "rustic"],
                "room_compatibility": ["bedroom"],
                "complements": ["nightstand", "dresser", "wardrobe", "lamp"]
            },
            "chair": {
                "colors": ["wood", "black", "white", "gray", "brown"],
                "styles": ["modern", "classic", "ergonomic", "vintage"],
                "room_compatibility": ["dining_room", "office", "bedroom"],
                "complements": ["table", "desk", "lamp"]
            },
            "bookshelf": {
                "colors": ["wood", "white", "black", "gray"],
                "styles": ["modern", "classic", "industrial", "minimalist"],
                "room_compatibility": ["living_room", "bedroom", "office"],
                "complements": ["desk", "chair", "lamp", "plant"]
            },
            "wardrobe": {
                "colors": ["white", "wood", "gray", "black"],
                "styles": ["modern", "classic", "minimalist", "rustic"],
                "room_compatibility": ["bedroom"],
                "complements": ["bed", "dresser", "mirror"]
            },
            "lamp": {
                "colors": ["white", "black", "brass", "copper", "gray"],
                "styles": ["modern", "classic", "industrial", "minimalist"],
                "room_compatibility": ["living_room", "bedroom", "office"],
                "complements": ["sofa", "bed", "desk", "side_table"]
            }
        }
        
        # Enhanced color harmony rules
        self.color_harmony = {
            "complementary": {
                "red": ["green", "white", "cream", "beige"],
                "green": ["red", "white", "cream", "brown"],
                "blue": ["orange", "white", "cream", "wood"],
                "orange": ["blue", "white", "gray", "brown"],
                "yellow": ["purple", "gray", "white", "black"],
                "purple": ["yellow", "white", "gray", "silver"],
                "beige": ["navy", "charcoal", "brown", "green"],
                "gray": ["white", "black", "yellow", "blue"],
                "brown": ["cream", "beige", "white", "blue"],
                "navy": ["white", "cream", "gold", "beige"],
                "white": ["black", "gray", "navy", "brown"],
                "black": ["white", "gray", "gold", "silver"],
                "wood": ["white", "cream", "gray", "green"]
            },
            "analogous": {
                "red": ["orange", "pink", "burgundy"],
                "orange": ["red", "yellow", "brown"],
                "yellow": ["orange", "green", "gold"],
                "green": ["yellow", "blue", "teal"],
                "blue": ["green", "purple", "navy"],
                "purple": ["blue", "pink", "magenta"],
                "beige": ["cream", "brown", "tan"],
                "gray": ["charcoal", "silver", "white"],
                "brown": ["beige", "tan", "wood"],
                "navy": ["blue", "teal", "purple"]
            }
        }
    
    def analyze_current_furniture(self, placed_models: List[Dict]) -> Dict[str, Any]:
        """Analyze the current furniture setup on the canvas"""
        # Store models for color analysis
        self._current_models = placed_models
        
        analysis = {
            "furniture_types": [],
            "dominant_colors": [],
            "style_preferences": [],
            "room_type": "living_room",  # Default
            "missing_essentials": [],
            "model_names": [],  # Add model names for better analysis
            "model_count": len(placed_models),
            "color_diversity_score": 0,
            "furniture_harmony": []
        }
        
        print(f"🎨 Analyzing {len(placed_models)} models on canvas:")
        
        # Extract furniture types and colors from placed models
        for i, model in enumerate(placed_models):
            model_name = model.get('name', '')
            analysis["model_names"].append(model_name)
            print(f"  {i+1}. '{model_name}' - {model.get('category', 'unknown')}")
            
            furniture_type = self.categorize_furniture(model_name.lower())
            if furniture_type:
                analysis["furniture_types"].append(furniture_type)
        
        # Extract dominant colors based on actual models
        analysis["dominant_colors"] = self.extract_dominant_colors(analysis)
        
        # Calculate color diversity (more colors = more interesting suggestions)
        analysis["color_diversity_score"] = len(set(analysis["dominant_colors"])) / 10.0
        
        # Analyze furniture harmony
        analysis["furniture_harmony"] = self._analyze_furniture_harmony(analysis["furniture_types"])
        
        # Determine room type based on furniture
        analysis["room_type"] = self.determine_room_type(analysis["furniture_types"])
        
        # Find missing essential furniture
        analysis["missing_essentials"] = self.find_missing_essentials(
            analysis["furniture_types"], 
            analysis["room_type"]
        )
        
        print(f"🎯 Analysis complete: {len(analysis['dominant_colors'])} colors, {len(analysis['furniture_types'])} furniture types")
        
        return analysis
    
    def _analyze_furniture_harmony(self, furniture_types: List[str]) -> List[str]:
        """Analyze how well current furniture pieces work together"""
        harmony_notes = []
        
        # Check for complementary furniture pairs
        complementary_pairs = {
            ("sofa", "coffee_table"): "Classic living room pairing",
            ("bed", "nightstand"): "Perfect bedroom combination", 
            ("dining_table", "chair"): "Essential dining set",
            ("desk", "chair"): "Productive workspace setup",
            ("bookshelf", "chair"): "Cozy reading nook"
        }
        
        for (item1, item2), note in complementary_pairs.items():
            if item1 in furniture_types and item2 in furniture_types:
                harmony_notes.append(f"✅ {note}")
        
        # Check for style consistency
        if len(furniture_types) > 1:
            # This could be enhanced with actual style detection from model names
            harmony_notes.append(f"🎨 {len(furniture_types)} pieces create layered design")
        
        return harmony_notes
    
    def categorize_furniture(self, furniture_name: str) -> str:
        """Categorize furniture based on its name"""
        furniture_keywords = {
            "sofa": ["sofa", "couch", "sectional"],
            "coffee_table": ["coffee table", "center table", "coffee_table"],
            "dining_table": ["dining table", "table", "dining_table"],
            "bed": ["bed", "mattress"],
            "chair": ["chair", "seat", "stool"],
            "bookshelf": ["bookshelf", "shelf", "bookcase"],
            "wardrobe": ["wardrobe", "closet", "armoire"],
            "lamp": ["lamp", "light", "lighting"]
        }
        
        for category, keywords in furniture_keywords.items():
            for keyword in keywords:
                if keyword in furniture_name:
                    return category
        return "misc"
    
    def determine_room_type(self, furniture_types: List[str]) -> str:
        """Determine room type based on furniture present"""
        if "bed" in furniture_types:
            return "bedroom"
        elif "dining_table" in furniture_types:
            return "dining_room"
        elif "sofa" in furniture_types or "coffee_table" in furniture_types:
            return "living_room"
        else:
            return "living_room"  # Default
    
    def find_missing_essentials(self, current_furniture: List[str], room_type: str) -> List[str]:
        """Find essential furniture missing from the room"""
        essentials = {
            "living_room": ["sofa", "coffee_table", "lamp"],
            "bedroom": ["bed", "wardrobe", "nightstand"],
            "dining_room": ["dining_table", "chair"]
        }
        
        room_essentials = essentials.get(room_type, [])
        missing = [item for item in room_essentials if item not in current_furniture]
        return missing
    
    def suggest_furniture(self, analysis: Dict[str, Any], limit: int = 3) -> List[Dict[str, Any]]:
        """Generate furniture suggestions based on analysis"""
        suggestions = []
        current_types = analysis["furniture_types"]
        room_type = analysis["room_type"]
        missing_essentials = analysis["missing_essentials"]
        
        # Prioritize missing essentials
        for essential in missing_essentials[:limit]:
            if essential in self.furniture_database:
                furniture_info = self.furniture_database[essential]
                suggestion = {
                    "furniture_type": essential.replace("_", " ").title(),
                    "type": essential,
                    "reason": f"Essential {essential.replace('_', ' ')} missing from {room_type.replace('_', ' ')}",
                    "priority": "high",
                    "confidence": 0.9,
                    "colors": furniture_info["colors"][:3],
                    "styles": furniture_info["styles"][:2]
                }
                suggestions.append(suggestion)
        
        # Add complementary furniture
        if len(suggestions) < limit:
            for furniture_type in current_types:
                if furniture_type in self.furniture_database:
                    complements = self.furniture_database[furniture_type]["complements"]
                    for complement in complements:
                        if (complement not in current_types and 
                            complement not in [s["type"] for s in suggestions] and
                            len(suggestions) < limit):
                            
                            complement_info = self.furniture_database.get(complement, {})
                            suggestion = {
                                "furniture_type": complement.replace("_", " ").title(),
                                "type": complement,
                                "reason": f"Complements your {furniture_type.replace('_', ' ')}",
                                "priority": "medium",
                                "confidence": 0.7,
                                "colors": complement_info.get("colors", ["neutral"])[:3],
                                "styles": complement_info.get("styles", ["modern"])[:2]
                            }
                            suggestions.append(suggestion)
        
        return suggestions[:limit]
    
    def suggest_colors(self, analysis: Dict[str, Any], furniture_type: str = None) -> List[Dict[str, Any]]:
        """Generate diverse color suggestions based on current furniture colors"""
        # Get current dominant colors from 3D analysis
        current_colors = analysis.get('dominant_colors', [])
        model_count = analysis.get('model_count', 1)
        color_diversity = analysis.get('color_diversity_score', 0.5)
        furniture_harmony = analysis.get('furniture_harmony', [])
        
        print(f"🎨 Generating suggestions for {model_count} models with {len(current_colors)} colors")
        print(f"Current colors: {current_colors}")
        print(f"Color diversity score: {color_diversity:.2f}")
        
        # Create diverse color suggestions pool
        color_suggestions = []
        suggested_colors = set()  # Track suggested colors to avoid duplicates
        
        # Adjust suggestion strategy based on number of models
        if model_count == 1:
            suggestion_context = "single piece"
            harmony_weight = 0.8
        elif model_count == 2:
            suggestion_context = "dual furniture setup" 
            harmony_weight = 0.9
        else:
            suggestion_context = f"multi-piece ({model_count} items) collection"
            harmony_weight = 1.0
        
        # 1. Complementary colors (opposites on color wheel)
        complementary_colors = self._get_complementary_colors(current_colors)
        for color_name, hex_code in complementary_colors:
            if color_name not in suggested_colors:
                color_suggestions.append({
                    "color": color_name.title(),
                    "hex_code": hex_code,
                    "harmony_score": 0.9 * harmony_weight,
                    "harmony_type": "complementary",
                    "reason": f"Creates dynamic contrast with your {suggestion_context} - Perfect for bold accent pieces"
                })
                suggested_colors.add(color_name)
        
        # 2. Analogous colors (adjacent on color wheel)
        analogous_colors = self._get_analogous_colors(current_colors)
        for color_name, hex_code in analogous_colors:
            if color_name not in suggested_colors:
                color_suggestions.append({
                    "color": color_name.title(),
                    "hex_code": hex_code,
                    "harmony_score": 0.85 * harmony_weight,
                    "harmony_type": "analogous", 
                    "reason": f"Flows seamlessly with your {suggestion_context} - Creates unified design language"
                })
                suggested_colors.add(color_name)
        
        # 3. Triadic colors (evenly spaced on color wheel)
        triadic_colors = self._get_triadic_colors(current_colors)
        for color_name, hex_code in triadic_colors:
            if color_name not in suggested_colors:
                color_suggestions.append({
                    "color": color_name.title(),
                    "hex_code": hex_code,
                    "harmony_score": 0.88 * harmony_weight,
                    "harmony_type": "triadic",
                    "reason": f"Balances your {suggestion_context} with geometric harmony - Sophisticated color triad"
                })
                suggested_colors.add(color_name)
        
        # 4. Multi-model specific suggestions
        if model_count > 1:
            bridging_colors = self._get_bridging_colors(current_colors, model_count)
            for color_name, hex_code in bridging_colors:
                if color_name not in suggested_colors:
                    color_suggestions.append({
                        "color": color_name.title(),
                        "hex_code": hex_code,
                        "harmony_score": 0.92 * harmony_weight,
                        "harmony_type": "bridging",
                        "reason": f"Unifies your {model_count} pieces with connecting color thread - Ties everything together"
                    })
                    suggested_colors.add(color_name)
        
        # 5. Contextual colors based on furniture harmony
        if furniture_harmony:
            contextual_colors = self._get_contextual_colors(current_colors, analysis)
            for color_name, hex_code in contextual_colors:
                if color_name not in suggested_colors:
                    color_suggestions.append({
                        "color": color_name.title(),
                        "hex_code": hex_code,
                        "harmony_score": 0.83 * harmony_weight,
                        "harmony_type": "contextual",
                        "reason": f"Enhances the functional harmony of your {suggestion_context} - Purposeful color choice"
                    })
                    suggested_colors.add(color_name)
        
        # Sort by harmony score and diversify selection
        color_suggestions.sort(key=lambda x: x["harmony_score"], reverse=True)
        
        # Select diverse suggestions (different harmony types)
        final_suggestions = []
        used_types = set()
        
        # First, try to get one from each type
        for suggestion in color_suggestions:
            if suggestion["harmony_type"] not in used_types and len(final_suggestions) < 3:
                final_suggestions.append(suggestion)
                used_types.add(suggestion["harmony_type"])
        
        # Fill remaining slots with highest scoring suggestions
        for suggestion in color_suggestions:
            if len(final_suggestions) >= 3:
                break
            if suggestion not in final_suggestions:
                final_suggestions.append(suggestion)
        
        print(f"✨ Generated {len(final_suggestions)} diverse suggestions for {model_count}-model canvas")
        return final_suggestions[:3]
    
    def extract_dominant_colors(self, analysis: Dict[str, Any]) -> List[str]:
        """Extract dominant colors from current furniture using actual 3D model analysis"""
        colors = []
        
        # Get the actual placed models from the analysis context
        if hasattr(self, '_current_models'):
            placed_models = self._current_models
            print(f"Analyzing {len(placed_models)} models for color extraction using 3D analysis")
        else:
            # Fallback to default if no models provided
            print("No models provided, using default colors")
            return ["neutral", "white"]
        
        all_extracted_colors = []
        
        for model in placed_models:
            model_name = model.get('name', '')
            model_category = model.get('category', '')
            
            # Try to get 3D model URL from the model data
            model_url = None
            if 'modelFile' in model and 'fileUrl' in model['modelFile']:
                model_url = model['modelFile']['fileUrl']
            elif 'fileUrl' in model:
                model_url = model['fileUrl']
            
            print(f"Processing model: {model_name}")
            
            if model_url:
                print(f"Found 3D model URL: {model_url}")
                # Analyze actual 3D model
                try:
                    model_analysis = self.model_analyzer.analyze_model_from_url(model_url, model_name)
                    
                    if model_analysis.get('colors') and not model_analysis.get('fallback', False):
                        print(f"✅ Successfully extracted colors from 3D model: {model_analysis['colors']}")
                        # Convert hex colors to color names
                        for hex_color in model_analysis['colors']:
                            color_name = self.model_analyzer.get_color_name_from_hex(hex_color)
                            all_extracted_colors.append(color_name.lower())
                        continue
                    else:
                        print(f"⚠️ 3D analysis failed or no colors found, using fallback for {model_name}")
                except Exception as e:
                    print(f"❌ Error in 3D model analysis for {model_name}: {e}")
            
            # Fallback to name-based analysis if 3D analysis fails
            fallback_colors = self._extract_colors_from_name(model_name, model_category)
            all_extracted_colors.extend(fallback_colors)
        
        # Remove duplicates and return unique colors
        unique_colors = list(set(all_extracted_colors))
        if not unique_colors:
            unique_colors = ["neutral", "brown", "beige"]  # Default fallback
        
        print(f"Final extracted colors: {unique_colors}")
        return unique_colors[:5]  # Return top 5 colors
    
    def _get_complementary_colors(self, current_colors: List[str]) -> List[tuple]:
        """Get complementary colors for current palette"""
        complementary_map = {
            'red': [('Green', '#228B22'), ('Teal', '#008080'), ('Mint', '#98FB98')],
            'green': [('Red', '#DC143C'), ('Pink', '#FF69B4'), ('Coral', '#FF7F50')],
            'blue': [('Orange', '#FF8C00'), ('Peach', '#FFCBA4'), ('Gold', '#FFD700')],
            'orange': [('Blue', '#0066CC'), ('Navy', '#000080'), ('Periwinkle', '#CCCCFF')],
            'yellow': [('Purple', '#800080'), ('Violet', '#8A2BE2'), ('Plum', '#DDA0DD')],
            'purple': [('Yellow', '#FFD700'), ('Lime', '#32CD32'), ('Chartreuse', '#7FFF00')],
            'brown': [('Turquoise', '#40E0D0'), ('Sky Blue', '#87CEEB'), ('Aqua', '#00FFFF')],
            'pink': [('Forest Green', '#228B22'), ('Hunter Green', '#355E3B'), ('Sage', '#9CAF88')],
            'white': [('Charcoal', '#36454F'), ('Navy', '#000080'), ('Deep Blue', '#003366')],
            'black': [('Gold', '#FFD700'), ('Silver', '#C0C0C0'), ('Cream', '#FFFDD0')],
            'gray': [('Coral', '#FF7F50'), ('Salmon', '#FA8072'), ('Peach', '#FFCBA4')]
        }
        
        complements = []
        for color in current_colors:
            if color.lower() in complementary_map:
                complements.extend(complementary_map[color.lower()][:2])
        
        return complements[:3]
    
    def _get_analogous_colors(self, current_colors: List[str]) -> List[tuple]:
        """Get analogous colors for current palette"""
        analogous_map = {
            'red': [('Burgundy', '#800020'), ('Rose', '#FF007F'), ('Crimson', '#DC143C')],
            'orange': [('Red', '#DC143C'), ('Yellow', '#FFD700'), ('Amber', '#FFBF00')],
            'yellow': [('Orange', '#FF8C00'), ('Green', '#32CD32'), ('Lime', '#00FF00')],
            'green': [('Yellow', '#FFD700'), ('Blue', '#0066CC'), ('Teal', '#008080')],
            'blue': [('Green', '#228B22'), ('Purple', '#800080'), ('Indigo', '#4B0082')],
            'purple': [('Blue', '#0066CC'), ('Pink', '#FF69B4'), ('Magenta', '#FF00FF')],
            'brown': [('Orange', '#FF8C00'), ('Tan', '#D2B48C'), ('Rust', '#B7410E')],
            'pink': [('Red', '#DC143C'), ('Purple', '#800080'), ('Lavender', '#E6E6FA')],
            'white': [('Ivory', '#FFFFF0'), ('Cream', '#FFFDD0'), ('Pearl', '#EAE0C8')],
            'gray': [('Silver', '#C0C0C0'), ('Charcoal', '#36454F'), ('Slate', '#708090')]
        }
        
        analogs = []
        for color in current_colors:
            if color.lower() in analogous_map:
                analogs.extend(analogous_map[color.lower()][:2])
        
        return analogs[:3]
    
    def _get_bridging_colors(self, current_colors: List[str], model_count: int) -> List[tuple]:
        """Get colors that bridge/connect multiple furniture pieces"""
        # These are colors that work well to unify diverse furniture
        universal_bridging_colors = [
            ('Warm White', '#FDF6E3'),
            ('Sage Green', '#9CAF88'), 
            ('Soft Gray', '#D3D3D3'),
            ('Cream', '#FFFDD0'),
            ('Taupe', '#483C32'),
            ('Ivory', '#FFFFF0')
        ]
        
        # Colors that specifically bridge warm and cool tones
        if any(color in ['brown', 'red', 'orange', 'yellow'] for color in [c.lower() for c in current_colors]):
            if any(color in ['blue', 'green', 'purple'] for color in [c.lower() for c in current_colors]):
                # Mixed warm/cool - need bridging neutrals
                return [('Mushroom', '#C9B3A0'), ('Driftwood', '#AF9B8C'), ('Linen', '#FAF0E6')]
        
        # For many models, suggest more neutral bridges
        if model_count >= 3:
            return universal_bridging_colors[:3]
        
        return universal_bridging_colors[:2]
    
    def _get_triadic_colors(self, current_colors: List[str]) -> List[tuple]:
        """Get triadic colors for current palette"""
        triadic_map = {
            'red': [('Blue', '#0066CC'), ('Yellow', '#FFD700')],
            'blue': [('Red', '#DC143C'), ('Yellow', '#FFD700')],
            'yellow': [('Red', '#DC143C'), ('Blue', '#0066CC')],
            'green': [('Orange', '#FF8C00'), ('Purple', '#800080')],
            'orange': [('Green', '#228B22'), ('Purple', '#800080')],
            'purple': [('Green', '#228B22'), ('Orange', '#FF8C00')],
            'brown': [('Teal', '#008080'), ('Lavender', '#E6E6FA')],
            'pink': [('Mint', '#98FB98'), ('Gold', '#FFD700')],
            'white': [('Navy', '#000080'), ('Maroon', '#800000')],
            'black': [('Gold', '#FFD700'), ('Silver', '#C0C0C0')]
        }
        
        triads = []
        for color in current_colors:
            if color.lower() in triadic_map:
                triads.extend(triadic_map[color.lower()][:1])
        
        return triads[:2]
    
    def _get_neutral_enhancements(self, current_colors: List[str]) -> List[tuple]:
        """Get neutral colors that enhance current palette"""
        # Smart neutrals based on current colors
        if any(color in ['brown', 'wood', 'rustic'] for color in [c.lower() for c in current_colors]):
            return [('Warm Gray', '#8B8680'), ('Linen', '#FAF0E6'), ('Stone', '#928B85')]
        elif any(color in ['white', 'cream'] for color in [c.lower() for c in current_colors]):
            return [('Charcoal', '#36454F'), ('Taupe', '#483C32'), ('Mushroom', '#C9B3A0')]
        elif any(color in ['blue', 'navy'] for color in [c.lower() for c in current_colors]):
            return [('Dove Gray', '#6E6E6E'), ('Oyster', '#DAD4B6'), ('Platinum', '#E5E4E2')]
        else:
            return [('Greige', '#8B8680'), ('Warm White', '#FDF6E3'), ('Soft Gray', '#D3D3D3')]
    
    def _get_contextual_colors(self, current_colors: List[str], analysis: Dict) -> List[tuple]:
        """Get colors based on context and room type"""
        room_type = analysis.get('room_type', 'living_room')
        model_names = analysis.get('model_names', [])
        
        # Kitchen context
        if any('kitchen' in name.lower() for name in model_names):
            return [('Sage Green', '#9CAF88'), ('Copper', '#B87333'), ('Warm White', '#FDF6E3')]
        
        # Living room context  
        elif room_type == 'living_room':
            return [('Terracotta', '#E2725B'), ('Forest Green', '#355E3B'), ('Dusty Rose', '#DCAE96')]
        
        # Bedroom context
        elif room_type == 'bedroom':
            return [('Lavender', '#E6E6FA'), ('Soft Blue', '#87CEEB'), ('Blush', '#FFC0CB')]
        
        # Default contextual colors
        return [('Accent Blue', '#4A90E2'), ('Warm Terracotta', '#C65D07'), ('Deep Green', '#2E4B34')]
    
    def _extract_colors_from_name(self, model_name: str, model_category: str) -> List[str]:
        """Fallback method to extract colors from model name and category"""
        colors = []
        model_name_lower = model_name.lower()
        model_category_lower = model_category.lower()
        
        # Enhanced color keywords with more variations
        color_keywords = {
            'white': ['white', 'ivory', 'cream', 'off-white', 'snow', 'pearl'],
            'black': ['black', 'dark', 'charcoal', 'ebony', 'midnight', 'onyx'],
            'brown': ['brown', 'wood', 'wooden', 'oak', 'walnut', 'mahogany', 'teak', 'rustic', 'chocolate', 'coffee', 'espresso'],
            'gray': ['gray', 'grey', 'silver', 'slate', 'ash', 'stone'],
            'blue': ['blue', 'navy', 'teal', 'aqua', 'cobalt', 'cerulean', 'azure'],
            'red': ['red', 'burgundy', 'maroon', 'crimson', 'cherry', 'rose', 'scarlet'],
            'green': ['green', 'olive', 'forest', 'sage', 'mint', 'emerald', 'jade'],
            'yellow': ['yellow', 'gold', 'golden', 'amber', 'lemon', 'citrus'],
            'beige': ['beige', 'tan', 'khaki', 'sand', 'camel', 'nude'],
            'orange': ['orange', 'coral', 'peach', 'apricot', 'rust'],
            'purple': ['purple', 'violet', 'lavender', 'plum', 'magenta'],
            'pink': ['pink', 'rose', 'blush', 'salmon'],
            'metal': ['metal', 'steel', 'aluminum', 'chrome', 'brass', 'copper', 'bronze', 'iron']
        }
        
        # Check model name for color keywords
        detected_colors = []
        for color, keywords in color_keywords.items():
            for keyword in keywords:
                if keyword in model_name_lower:
                    detected_colors.append(color)
                    print(f"Detected color '{color}' from keyword '{keyword}' in '{model_name}'")
                    break  # Only add each color once per model
        
        # Enhanced category-based color inference
        if not detected_colors:
            print(f"No colors detected from name, checking category defaults")
            category_colors = {
                'kitchen': ['wood', 'white', 'gray'],
                'dining': ['wood', 'brown', 'white'],
                'living': ['beige', 'gray', 'brown'],
                'bedroom': ['white', 'beige', 'gray'],
                'sofa': ['gray', 'beige', 'brown'],
                'chair': ['wood', 'black', 'gray'],
                'table': ['wood', 'white', 'black'],
                'bed': ['white', 'gray', 'wood'],
                'cabinet': ['wood', 'white', 'gray'],
                'bookshelf': ['wood', 'white', 'black'],
                'lamp': ['white', 'black', 'metal']
            }
            
            # Check both category and name for furniture type
            for cat, default_colors in category_colors.items():
                if cat in model_category_lower or cat in model_name_lower:
                    detected_colors.extend(default_colors[:2])  # Add first 2 default colors
                    print(f"Added category colors {default_colors[:2]} for category/name containing '{cat}'")
                    break
        
        # If still no colors detected, use generic based on common furniture words
        if not detected_colors:
            print(f"No colors detected, using generic inference")
            if any(word in model_name_lower for word in ['modern', 'contemporary']):
                detected_colors = ['white', 'gray', 'black']
            elif any(word in model_name_lower for word in ['rustic', 'vintage', 'antique']):
                detected_colors = ['brown', 'wood', 'beige']
            elif any(word in model_name_lower for word in ['classic', 'traditional']):
                detected_colors = ['brown', 'beige', 'white']
            else:
                detected_colors = ['neutral']
            
            print(f"Generic inference result: {detected_colors}")
        
        return detected_colors
    
    def calculate_color_harmony(self, color: str, current_colors: List[str]) -> float:
        """Calculate how well a color harmonizes with current colors"""
        if not current_colors:
            return 0.7  # Neutral score for empty rooms
        
        harmony_score = 0.0
        for current_color in current_colors:
            # Check complementary harmony
            if (current_color in self.color_harmony["complementary"] and
                color in self.color_harmony["complementary"][current_color]):
                harmony_score += 0.9
            # Check analogous harmony
            elif (current_color in self.color_harmony["analogous"] and
                  color in self.color_harmony["analogous"][current_color]):
                harmony_score += 0.8
            # Neutral colors always work well
            elif color in ["white", "gray", "beige", "cream"] or current_color in ["white", "gray"]:
                harmony_score += 0.7
            else:
                harmony_score += 0.3
        
        return min(harmony_score / len(current_colors), 1.0)
    
    def get_harmony_type(self, color: str, current_colors: List[str]) -> str:
        """Determine the type of color harmony"""
        for current_color in current_colors:
            if (current_color in self.color_harmony["complementary"] and
                color in self.color_harmony["complementary"][current_color]):
                return "complementary"
            elif (current_color in self.color_harmony["analogous"] and
                  color in self.color_harmony["analogous"][current_color]):
                return "analogous"
        return "neutral"
    
    def get_color_reason(self, color: str, current_colors: List[str], score: float) -> str:
        """Generate a reason for the color suggestion"""
        current_colors_str = ', '.join(current_colors) if current_colors else "neutral"
        
        # More specific and varied reasons based on colors and score
        if score > 0.8:
            reasons = [
                f"Perfect harmony with your {current_colors_str} furniture pieces",
                f"Creates excellent contrast with your current {current_colors_str} scheme",
                f"Beautifully complements the {current_colors_str} tones in your space"
            ]
        elif score > 0.6:
            reasons = [
                f"Works well with your existing {current_colors_str} color palette",
                f"Adds warmth while maintaining harmony with {current_colors_str}",
                f"Provides subtle contrast to your {current_colors_str} furniture"
            ]
        else:
            reasons = [
                f"A versatile choice that adapts to any color scheme",
                f"Safe, neutral option that won't clash with existing pieces",
                f"Classic color that provides flexibility for future additions"
            ]
        
        # Add color-specific reasons
        color_specific_reasons = {
            'white': "Creates a clean, spacious feeling",
            'black': "Adds sophisticated contrast and depth",
            'wood': "Brings natural warmth and organic texture",
            'gray': "Provides modern elegance and timeless appeal",
            'beige': "Offers warm neutrality and cozy atmosphere",
            'blue': "Introduces calming, peaceful vibes",
            'green': "Brings natural, refreshing energy"
        }
        
        if color in color_specific_reasons:
            return f"{random.choice(reasons)} - {color_specific_reasons[color]}"
        else:
            return random.choice(reasons)
    
    def generate_full_suggestions(self, placed_models: List[Dict]) -> Dict[str, Any]:
        """Generate comprehensive AI suggestions"""
        analysis = self.analyze_current_furniture(placed_models)
        
        furniture_suggestions = self.suggest_furniture(analysis)
        
        # Generate color suggestions for each suggested furniture
        for suggestion in furniture_suggestions:
            suggestion["color_recommendations"] = self.suggest_colors(
                analysis, 
                suggestion["type"]
            )
        
        return {
            "analysis": analysis,
            "furniture_suggestions": furniture_suggestions,
            "room_completion": len(analysis["furniture_types"]) / max(len(analysis["missing_essentials"]) + len(analysis["furniture_types"]), 1) * 100,
            "style_consistency": "modern",  # Simplified
            "tips": self.generate_design_tips(analysis)
        }
    
    def generate_design_tips(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate helpful design tips"""
        tips = []
        
        if len(analysis["furniture_types"]) < 3:
            tips.append("Consider adding more furniture pieces to create a complete room setup")
        
        if "lamp" not in analysis["furniture_types"]:
            tips.append("Good lighting is essential - consider adding table or floor lamps")
        
        if analysis["room_type"] == "living_room" and "rug" not in analysis["furniture_types"]:
            tips.append("A rug can help define the space and add warmth to your living room")
        
        tips.append("Maintain visual balance by distributing furniture evenly across the space")
        tips.append("Use the rule of thirds when positioning key furniture pieces")
        
        return tips[:3]

# Initialize the AI suggester
ai_suggester = FurnitureAISuggester()
