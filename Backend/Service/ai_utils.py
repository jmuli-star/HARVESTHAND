from google import genai
from django.conf import settings
import PIL.Image
import io

class AgriBrain:
    @staticmethod
    def get_client():
        api_key = getattr(settings, 'GOOGLE_API_KEY', None)
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is not defined in Django settings.")
        
        return genai.Client(
            api_key=api_key,
            http_options={'api_version': 'v1'} 
        )

    @staticmethod
    def process_request(mode, text_query=None, image_file=None):
        try:
            client = AgriBrain.get_client()
            
            # --- UPDATED MODEL FOR 2026 ---
            # 'gemini-1.5-flash' is no longer supported in the v1 stable API.
            model_id = "gemini-2.5-flash" 

            if mode == 'chat':
                prompt = (
                    "You are an expert Agronomist. Provide detailed advice for farmers. "
                    f"User Question: {text_query}"
                )
                response = client.models.generate_content(
                    model=model_id, 
                    contents=prompt
                )
                return response.text

            elif mode == 'vision' and image_file:
                img = PIL.Image.open(image_file)
                prompt = (
                    "Analyze this agricultural image. Identify the plant and any "
                    "diseases or pests. Suggest organic and chemical treatments."
                )
                response = client.models.generate_content(
                    model=model_id, 
                    contents=[prompt, img]
                )
                return response.text

            elif mode == 'market':
                prompt = (
                    f"Perform market research for the crop: {text_query}. "
                    "Predict potential price trends in the East African market for the next 3 months."
                )
                response = client.models.generate_content(
                    model=model_id, 
                    contents=prompt
                )
                return response.text

        except Exception as e:
            print(f"AI Hub Error: {str(e)}")
            return f"The AI Assistant is unavailable: {str(e)}"
        
        return "Invalid mode or missing data."