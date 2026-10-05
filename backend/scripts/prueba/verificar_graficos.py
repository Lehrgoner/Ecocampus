import requests
import json

r = requests.post('http://localhost:8000/api/v1/auth/login', json={
    'email': 'admin@greenmetric.com',
    'password': 'admin123456'
})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

r2 = requests.get(
    'http://localhost:8000/api/v1/reportes/datos-graficos?campus_id=1',
    headers=headers
)
print(json.dumps(r2.json(), indent=2, ensure_ascii=False))