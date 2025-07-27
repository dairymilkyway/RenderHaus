import json
import random
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class FurnitureAISuggester:
    def __init__(self):
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
        
        # Color harmony rules
        self.color_harmony = {
            "complementary": {
                "beige": ["navy", "charcoal", "brown"],
                "gray": ["white", "black", "yellow", "blue"],
                "brown": ["cream", "beige", "white", "blue"],
                "navy": ["white", "cream", "gold", "beige"],
                "white": ["black", "gray", "navy", "any"],
                "black": ["white", "gray", "gold", "silver"],
                "wood": ["white", "cream", "gray", "green"]
            },
            "analogous": {
                "beige": ["cream", "brown", "tan"],
                "gray": ["charcoal", "silver", "white"],
                "brown": ["beige", "tan", "wood"],
                "navy": ["blue", "teal", "purple"]
            }
        }
    
    def analyze_current_furniture(self, placed_models: List[Dict]) -> Dict[str, Any]:
        """Analyze the current furniture setup on the canvas"""
        analysis = {
            "furniture_types": [],
            "dominant_colors": [],
            "style_preferences": [],
            "room_type": "living_room",  # Default
            "missing_essentials": []
        }
        
        # Extract furniture types and colors from placed models
        for model in placed_models:
            furniture_type = self.categorize_furniture(model.get('name', '').lower())
            if furniture_type:
                analysis["furniture_types"].append(furniture_type)
        
        # Determine room type based on furniture
        analysis["room_type"] = self.determine_room_type(analysis["furniture_types"])
        
        # Find missing essential furniture
        analysis["missing_essentials"] = self.find_missing_essentials(
            analysis["furniture_types"], 
            analysis["room_type"]
        )
        
        return analysis
    
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
                    "type": essential,
                    "name": essential.replace("_", " ").title(),
                    "reason": f"Essential {essential.replace('_', ' ')} missing from {room_type.replace('_', ' ')}",
                    "priority": "high",
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
                                "type": complement,
                                "name": complement.replace("_", " ").title(),
                                "reason": f"Complements your {furniture_type.replace('_', ' ')}",
                                "priority": "medium",
                                "colors": complement_info.get("colors", ["neutral"])[:3],
                                "styles": complement_info.get("styles", ["modern"])[:2]
                            }
                            suggestions.append(suggestion)
        
        return suggestions[:limit]
    
    def suggest_colors(self, analysis: Dict[str, Any], furniture_type: str) -> List[Dict[str, Any]]:
        """Suggest colors for a specific furniture type"""
        # Get current dominant colors (simplified - in real implementation, 
        # you'd analyze actual colors from 3D models)
        current_colors = self.extract_dominant_colors(analysis)
        
        color_suggestions = []
        
        # Get base colors for this furniture type
        if furniture_type in self.furniture_database:
            base_colors = self.furniture_database[furniture_type]["colors"]
            
            for color in base_colors[:5]:
                harmony_score = self.calculate_color_harmony(color, current_colors)
                
                suggestion = {
                    "color": color,
                    "harmony_score": harmony_score,
                    "harmony_type": self.get_harmony_type(color, current_colors),
                    "reason": self.get_color_reason(color, current_colors, harmony_score)
                }
                color_suggestions.append(suggestion)
        
        # Sort by harmony score
        color_suggestions.sort(key=lambda x: x["harmony_score"], reverse=True)
        return color_suggestions[:3]
    
    def extract_dominant_colors(self, analysis: Dict[str, Any]) -> List[str]:
        """Extract dominant colors from current furniture (simplified)"""
        # In a real implementation, you'd analyze the actual 3D model textures
        # For now, return common neutral colors
        return ["white", "gray", "wood"]
    
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
        if score > 0.8:
            return f"Excellent harmony with your current {', '.join(current_colors)} furniture"
        elif score > 0.6:
            return f"Good complement to your existing color scheme"
        else:
            return f"Neutral choice that works with most color schemes"
    
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
