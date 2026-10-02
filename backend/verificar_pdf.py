import requests

# Login
r = requests.post('http://localhost:8000/api/v1/auth/login', json={
    'email': 'admin@greenmetric.com',
    'password': 'admin123456'
})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Descargar PDF
r2 = requests.get(
    'http://localhost:8000/api/v1/reportes/pdf?campus_id=1',
    headers=headers
)

if r2.status_code == 200:
    with open('reporte_test.pdf', 'wb') as f:
        f.write(r2.content)
    print(f"✅ PDF guardado: reporte_test.pdf ({len(r2.content)} bytes)")
else:
    print(f"❌ Error {r2.status_code}: {r2.text}")
    