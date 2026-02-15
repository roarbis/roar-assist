import json
import os
from google import genai
from google.genai import types


def get_client():
    return genai.Client(api_key=os.environ.get('GEMINI_API_KEY', ''))


def analyze_food_image(image_bytes: bytes, mime_type: str) -> dict:
    """Send a food photo to Gemini and get calorie/nutrition analysis."""
    client = get_client()

    prompt = """You are a professional nutritionist analyzing a food photo.
Analyze this food image carefully and return a JSON object with EXACTLY these fields:

{
    "food_name": "Name of the food/dish (be specific)",
    "calories": estimated total calories as a number,
    "protein": estimated protein in grams as a number,
    "carbs": estimated carbohydrates in grams as a number,
    "fat": estimated fat in grams as a number,
    "food_score": nutritional density score from 1-10 (10 = extremely nutritious like salmon/broccoli/quinoa, 1 = empty calories like candy/soda),
    "health_benefits": ["benefit 1", "benefit 2", "benefit 3"],
    "health_negatives": ["negative 1", "negative 2"],
    "portion_estimate": "estimated portion size (e.g., '1 cup', '250g', '1 medium plate')"
}

Guidelines:
- Be realistic with calorie estimates based on visible portion size
- Include 2-5 health benefits and 1-3 health negatives
- Food score should reflect overall nutritional value
- Return ONLY valid JSON, no markdown fences, no extra text"""

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt
        ]
    )

    text = response.text.strip()
    # Strip markdown fences if Gemini wraps the JSON
    if text.startswith('```'):
        text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()

    return json.loads(text)


def get_meal_suggestions(remaining_calories: int, recent_meals: list) -> list:
    """Get AI-powered meal suggestions based on remaining calorie budget."""
    client = get_client()

    recent_names = ', '.join(recent_meals[-5:]) if recent_meals else 'none yet'

    prompt = f"""I have {remaining_calories} calories remaining for today.
My recent meals today were: {recent_names}.

Suggest 3 healthy meal options that each fit within {remaining_calories} calories.
Consider variety from what I've already eaten.

Return as a JSON array of objects with these keys:
- name: meal name
- calories: estimated calories (number)
- protein: estimated protein in grams (number)
- reason: why this is a good choice (1 sentence)

Return ONLY valid JSON array, no markdown fences, no extra text."""

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=[prompt]
    )

    text = response.text.strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()

    return json.loads(text)


def analyze_food_text(query: str) -> dict:
    """Analyze food from text description and return nutrition estimates."""
    client = get_client()

    prompt = f"""You are a professional nutritionist. Analyze this food query:

"{query}"

Return a JSON object with EXACTLY these fields:
{{
    "food_name": "Interpreted food name (be specific)",
    "calories": estimated total calories as a number,
    "protein": estimated protein in grams as a number,
    "carbs": estimated carbohydrates in grams as a number,
    "fat": estimated fat in grams as a number,
    "food_score": nutritional density score from 1-10 (10 = extremely nutritious, 1 = empty calories),
    "health_benefits": ["benefit 1", "benefit 2", "benefit 3"],
    "health_negatives": ["negative 1", "negative 2"],
    "portion_estimate": "interpreted portion size (e.g., '200g', '1 cup', '1 medium piece')"
}}

Guidelines:
- Parse any quantity mentioned in the query (e.g., "200g", "2 cups", "1 large")
- If no quantity specified, assume a standard serving
- Be realistic with estimates
- Include 2-5 health benefits and 1-3 negatives
- Food score reflects nutritional value
- Return ONLY valid JSON, no markdown fences, no extra text"""

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=[prompt]
    )

    text = response.text.strip()
    # Strip markdown fences if present
    if text.startswith('```'):
        text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()

    return json.loads(text)
