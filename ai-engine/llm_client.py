import os
import anthropic
from dotenv import load_dotenv
import json

load_dotenv()

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

def analyze_with_claude(prompt, system_prompt="You are an expert AI Recruiter and ATS System."):
    """
    General purpose function to call Claude for various ATS layers.
    """
    if not os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_API_KEY") == "your_anthropic_api_key_here":
        return {"error": "Missing Anthropic API Key. Please add it to the .env file."}
        
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            temperature=0.2,
            system=system_prompt,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.content[0].text
    except Exception as e:
        print(f"Error calling Claude: {e}")
        return {"error": str(e)}

def extract_json_from_claude(response_text):
    """
    Helper to extract JSON from Claude's response if it wraps it in markdown blocks.
    """
    if isinstance(response_text, dict) and "error" in response_text:
        return response_text
        
    try:
        # Strip out markdown formatting if present
        if "```json" in response_text:
            json_str = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            json_str = response_text.split("```")[1].split("```")[0].strip()
        else:
            json_str = response_text.strip()
            
        return json.loads(json_str)
    except Exception as e:
        print(f"Error parsing JSON from Claude: {e}")
        return {"error": "Failed to parse LLM response into JSON", "raw_response": response_text}
