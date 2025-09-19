
from typing import Dict, Any
import os
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
load_dotenv()

class MarketingService:
    @staticmethod
    async def generate_marketing_content(artisan_id: str, prompt: str, image_bytes: bytes = None) -> Dict[str, Any]:
        """Generate marketing content for an artisan using Gemini LLM, considering both prompt and image."""
        try:
            GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
            if not GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY not set in environment variables.")
            client = genai.Client(api_key=GEMINI_API_KEY)
            text_input = (
                "You are an expert marketing copywriter. "
                "Given the following prompt and product image, generate a catchy, engaging, and persuasive marketing statement for an artisan's handcrafted products. "
                "Make it suitable for social media, highlight authenticity, uniqueness, and supporting local artisans. "
                "Limit the output to a maximum of 2 lines.\n\n"
                "Give only the marketing statement and do not mention anything else."
                f"Prompt: {prompt}\n\nMarketing Statement (max 2 lines):"
            )
            parts = [types.Part(text=text_input)]
            if image_bytes:
                image_input = Image.open(BytesIO(image_bytes))
                img_byte_arr = BytesIO()
                image_input.save(img_byte_arr, format='JPEG')
                img_byte_arr = img_byte_arr.getvalue()
                parts.append(types.Part(inline_data=types.Blob(mime_type="image/jpeg", data=img_byte_arr)))
            content = types.Content(parts=parts)
            response = client.models.generate_content(
                model="gemini-2.0-flash-preview-image-generation",
                contents=content,
                config=types.GenerateContentConfig(response_modalities=['TEXT', 'IMAGE'])
            )
            # Extract text response (marketing statement)
            marketing_content = ""
            for part in response.candidates[0].content.parts:
                if hasattr(part, "text") and part.text:
                    marketing_content = part.text.strip()
                    break
            return {
                "status": "success",
                "content": marketing_content,
                "artisan_id": artisan_id
            }
        except Exception as e:
            raise ValueError(f"Failed to generate marketing content: {str(e)}")



from app.db import db
from app.services.artisan_service import serialize_artisan

async def generate_story_for_artisan(artisan_id: str, extra_info: str = "") -> Dict[str, Any]:
    """Fetch artisan by ID, combine with extra info, and generate a story using Gemini API."""
    import google.generativeai as genai
    try:
        from bson import ObjectId
        # Try to interpret as ObjectId, else fallback to user_id
        artisan = None
        if ObjectId.is_valid(artisan_id):
            artisan = await db["artisans"].find_one({"_id": ObjectId(artisan_id)})
        if not artisan:
            # Try user_id field
            artisan = await db["artisans"].find_one({"user_id": artisan_id})
        if not artisan:
            raise ValueError("Artisan not found for given ID or user_id")
        artisan = serialize_artisan(artisan)
        # Gather all relevant artisan info
        name = artisan.get("name") or artisan.get("username") or "The artisan"
        location = artisan.get("location", "")
        skills = ", ".join(artisan.get("skills", []))
        bio = artisan.get("bio", "")
        shop_name = artisan.get("shop_name", "")
        created_at = artisan.get("created_at", "")
        updated_at = artisan.get("updated_at", "")
        # Compose the full context
        context = f"Name: {name}\nLocation: {location}\nSkills: {skills}\nBio: {bio}\nShop Name: {shop_name}\nCreated At: {created_at}\nUpdated At: {updated_at}\n"
        if extra_info:
            context += f"Additional Info: {extra_info}\n"
        # Compose the prompt
        prompt = (
            "You are an expert creative writer for artisan stories. "
            "Given the following artisan details and extra info, write an inspiring, clear, and engaging story for customers. "
            "Keep the artisan's voice and details, but improve grammar, flow, and impact.\n\n"
            f"Artisan details:\n{context}\n\nStory:"
        )
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not set in environment variables.")
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        improved_story = response.text.strip() if hasattr(response, "text") else str(response).strip()
        return {
            "status": "success",
            "story": improved_story,
            "artisan_id": artisan_id,
            "original_context": context
        }
    except Exception as e:
        raise ValueError(f"Failed to generate story: {str(e)}")