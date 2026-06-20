import requests

url = "http://localhost:8000/analyze"

try:
    with open("ai-engine/temp_Jainam_Jain_SDE.pdf", "rb") as f:
        files = {'file': ('temp_Jainam_Jain_SDE.pdf', f, 'application/pdf')}
        data = {'job_description': ''}
        response = requests.post(url, files=files, data=data)
        print("STATUS:", response.status_code)
        print("RESPONSE:", response.text)
except Exception as e:
    print("ERROR:", e)
