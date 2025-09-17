import os
import asyncio
from typing import List, Optional, Dict
from groq import AsyncGroq
from datetime import datetime
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductDescriptionGenerator:
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the product description generator with GroqCloud.
        
        Args:
            api_key: GroqCloud API key. If not provided, will try to get from environment.
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY must be provided either as parameter or environment variable")
        
        self.client = AsyncGroq(api_key=self.api_key)
        self.model = "llama-3.3-70b-versatile"  # Fast and efficient model
    
    async def generate_product_description(
        self,
        keywords: List[str],
        product_name: Optional[str] = None,
        craft_type: Optional[str] = None,
        artisan_location: Optional[str] = None,
        target_length: str = "medium",
        tone: str = "professional"
    ) -> Dict[str, str]:
        """
        Generate a compelling product description using keywords and context.
        
        Args:
            keywords: List of keywords describing the product
            product_name: Optional product name
            craft_type: Type of craft (e.g., "pottery", "weaving", "woodcarving")
            artisan_location: Location of the artisan (adds cultural context)
            target_length: "short" (50-100 words), "medium" (100-200 words), "long" (200-300 words)
            tone: "professional", "casual", "artistic", "traditional"
        
        Returns:
            Dict containing generated description, title, and metadata
        """
        try:
            # Build the prompt
            prompt = self._build_prompt(
                keywords, product_name, craft_type, artisan_location, target_length, tone
            )
            
            # Make the API call
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert copywriter specializing in authentic Indian handicrafts and artisan products. You create compelling, culturally-sensitive product descriptions that highlight craftsmanship, tradition, and artistic value."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.0,
                max_tokens=1000,
                top_p=1,
                stream=False
            )
            
            # Parse the response
            content = response.choices[0].message.content.strip()
            
            # Try to parse as JSON if the response is structured
            try:
                parsed_content = json.loads(content)
                if isinstance(parsed_content, dict):
                    return {
                        "description": parsed_content.get("description", content),
                        "title": parsed_content.get("title", product_name or "Handcrafted Item"),
                        "short_description": parsed_content.get("short_description", ""),
                        "highlights": parsed_content.get("highlights", []),
                        "generated_at": datetime.utcnow().isoformat(),
                        "keywords_used": keywords
                    }
            except json.JSONDecodeError:
                pass
            
            # If not JSON, return the content as description
            return {
                "description": content,
                "title": product_name or self._generate_title_from_keywords(keywords),
                "short_description": content[:100] + "..." if len(content) > 100 else content,
                "highlights": keywords,
                "generated_at": datetime.utcnow().isoformat(),
                "keywords_used": keywords
            }
            
        except Exception as e:
            logger.error(f"Error generating product description: {str(e)}")
            raise Exception(f"Failed to generate product description: {str(e)}")
    
    def _build_prompt(
        self,
        keywords: List[str],
        product_name: Optional[str],
        craft_type: Optional[str],
        artisan_location: Optional[str],
        target_length: str,
        tone: str
    ) -> str:
        """Build the prompt for the LLM based on provided parameters."""
        
        # Length guidelines
        length_guides = {
            "short": "50-100 words",
            "medium": "100-200 words", 
            "long": "200-300 words"
        }
        
        # Tone guidelines
        tone_guides = {
            "professional": "formal, informative, and business-appropriate",
            "casual": "friendly, approachable, and conversational",
            "artistic": "creative, expressive, and emotion-evoking",
            "traditional": "respectful of heritage, emphasizing cultural significance"
        }
        
        prompt_parts = [
            f"Create a compelling product description with a {tone_guides.get(tone, 'professional')} tone.",
            f"Target length: {length_guides.get(target_length, '100-200 words')}."
        ]
        
        if keywords:
            prompt_parts.append(f"Keywords to incorporate: {', '.join(keywords)}")
        
        if product_name:
            prompt_parts.append(f"Product name: {product_name}")
        
        if craft_type:
            prompt_parts.append(f"Type of craft: {craft_type}")
        
        if artisan_location:
            prompt_parts.append(f"Artisan location: {artisan_location} (add relevant cultural context)")
        
        prompt_parts.extend([
            "",
            "Please respond with a JSON object containing:",
            "- 'description': The full product description",
            "- 'title': A catchy product title",
            "- 'short_description': A brief 1-2 sentence summary",
            "- 'highlights': An array of key product highlights/features",
            "",
            "Focus on:",
            "- Authentic craftsmanship and traditional techniques",
            "- Cultural heritage and artistic value",
            "- Quality materials and attention to detail",
            "- Uniqueness and handmade character",
            "- Supporting local artisan communities",
            "",
            "Avoid:",
            "- Generic descriptions",
            "- Overly promotional language",
            "- Cultural stereotypes or clichés"
        ])
        
        return "\n".join(prompt_parts)
    
    def _generate_title_from_keywords(self, keywords: List[str]) -> str:
        """Generate a basic title from keywords if no product name is provided."""
        if not keywords:
            return "Handcrafted Artisan Product"
        
        # Take the first few keywords and create a title
        main_keywords = keywords[:3]
        title = " ".join(word.capitalize() for word in main_keywords)
        return f"Handcrafted {title}"
    
    async def generate_bulk_descriptions(
        self,
        products_data: List[Dict],
        batch_size: int = 5
    ) -> List[Dict]:
        """
        Generate descriptions for multiple products in batches.
        
        Args:
            products_data: List of dicts, each containing product information
            batch_size: Number of products to process concurrently
        
        Returns:
            List of generated descriptions with metadata
        """
        results = []
        
        # Process in batches to avoid rate limits
        for i in range(0, len(products_data), batch_size):
            batch = products_data[i:i + batch_size]
            
            # Create tasks for the batch
            tasks = []
            for product in batch:
                task = self.generate_product_description(
                    keywords=product.get("keywords", []),
                    product_name=product.get("product_name"),
                    craft_type=product.get("craft_type"),
                    artisan_location=product.get("artisan_location"),
                    target_length=product.get("target_length", "medium"),
                    tone=product.get("tone", "professional")
                )
                tasks.append(task)
            
            # Execute batch
            try:
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for j, result in enumerate(batch_results):
                    if isinstance(result, Exception):
                        logger.error(f"Error processing product {i+j}: {str(result)}")
                        results.append({
                            "error": str(result),
                            "product_index": i + j
                        })
                    else:
                        results.append(result)
                        
            except Exception as e:
                logger.error(f"Error processing batch {i//batch_size + 1}: {str(e)}")
                # Add error entries for the whole batch
                for j in range(len(batch)):
                    results.append({
                        "error": str(e),
                        "product_index": i + j
                    })
            
            # Small delay between batches to respect rate limits
            if i + batch_size < len(products_data):
                await asyncio.sleep(1)
        
        return results


# Convenience functions for easy use
async def generate_description(
    keywords: List[str],
    product_name: Optional[str] = None,
    craft_type: Optional[str] = None,
    artisan_location: Optional[str] = None,
    target_length: str = "medium",
    tone: str = "professional"
) -> Dict[str, str]:
    """
    Convenience function to generate a single product description.
    """
    generator = ProductDescriptionGenerator()
    return await generator.generate_product_description(
        keywords=keywords,
        product_name=product_name,
        craft_type=craft_type,
        artisan_location=artisan_location,
        target_length=target_length,
        tone=tone
    )
