import requests

# Login
r = requests.post('http://localhost:8000/api/v1/auth/login', json={
    'email': 'admin@greenmetric.com',
    'password': 'admin123456'
})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Listar zonas
r2 = requests.get('http://localhost:8000/api/v1/zonas-verdes/?campus_id=1', headers=headers)
zonas = r2.json()

print(f"Encontradas {len(zonas)} zonas")

for zona in zonas:
    r3 = requests.delete(
        f"http://localhost:8000/api/v1/zonas-verdes/{zona['id']}",
        headers=headers
    )
    print(f"Eliminada: {zona['nombre']} (status {r3.status_code})")

print("✅ Listo")