"""
Nutri-Track API Key Diagnostic
Run this to verify your Gemini API key is valid and has the right capabilities.
"""
import sys
import os

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env from the correct directory
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(env_path)

api_key = os.environ.get('GEMINI_API_KEY', '')

print("=" * 50)
print("  Nutri-Track API Key Diagnostic")
print("=" * 50)

# Check 1: Is the key present?
if not api_key or api_key == 'PASTE_YOUR_GEMINI_API_KEY_HERE':
    print("\n[FAIL] API key not set!")
    print(f"  .env file: {env_path}")
    print("  Edit .env and replace PASTE_YOUR_GEMINI_API_KEY_HERE with your actual key.")
    sys.exit(1)

print(f"\n[OK] API key found: {api_key[:8]}...{api_key[-4:]}")
print(f"  Key length: {len(api_key)} characters")

# Check 2: Can we create a client?
print("\nTesting Gemini connection...")
try:
    from google import genai
    client = genai.Client(api_key=api_key)
    print("[OK] Client created successfully")
except Exception as e:
    print(f"[FAIL] Could not create client: {e}")
    sys.exit(1)

# Check 3: Can we do a simple text generation?
print("\nTesting text generation (gemini-2.0-flash)...")
try:
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=['Say hello in exactly 3 words']
    )
    print(f"[OK] Text response: {response.text.strip()}")
except Exception as e:
    print(f"[FAIL] Text generation failed: {e}")
    print("\n  Possible causes:")
    print("  - API key is invalid or expired")
    print("  - 'Generative Language API' is not enabled in Google Cloud Console")
    print("  - Billing is not set up (if using paid tier)")
    print("  - API key restrictions are blocking the request")
    sys.exit(1)

# Check 4: Can we do image analysis? (using a tiny test image)
print("\nTesting image/vision capability...")
try:
    from PIL import Image
    from google.genai import types
    import io

    # Create a tiny 10x10 red test image
    img = Image.new('RGB', (10, 10), 'red')
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    test_bytes = buf.getvalue()

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=[
            types.Part.from_bytes(data=test_bytes, mime_type='image/jpeg'),
            'What color is this image? Reply in one word.'
        ]
    )
    print(f"[OK] Vision response: {response.text.strip()}")
except Exception as e:
    print(f"[FAIL] Vision/image analysis failed: {e}")
    print("\n  The API key works for text but NOT for images.")
    print("  Make sure your API key is from AI Studio (aistudio.google.com)")
    print("  and not restricted to specific APIs.")
    sys.exit(1)

print("\n" + "=" * 50)
print("  All checks passed! Your API key is working.")
print("=" * 50)
print("\nIf the app still shows errors, restart the server after")
print("confirming the .env file is saved correctly.")
