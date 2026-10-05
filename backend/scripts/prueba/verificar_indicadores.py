import requests
import json

# Login
r = requests.post('http://localhost:8000/api/v1/auth/login', json={
    'email': 'admin@greenmetric.com',
    'password': 'admin123456'
})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Obtener indicadores
r2 = requests.get(
    'http://localhost:8000/api/v1/indicadores/actuales?campus_id=1',
    headers=headers
)
data = r2.json()

print("=" * 60)
print("INDICADORES ACTUALES")
print("=" * 60)

for ind in data['indicadores']:
    puntaje = ind['puntaje']
    maximo = ind['puntaje_maximo']
    porcentaje = ind['porcentaje']
    print(f"{ind['codigo']}: {puntaje:.2f}/{maximo:.0f} ({porcentaje:.1f}%)")

print("-" * 60)
print(f"TOTAL SI: {data['puntaje_total_si']:.2f}/1100")
print(f"PORCENTAJE: {data['porcentaje_total']:.2f}%")
print("=" * 60)