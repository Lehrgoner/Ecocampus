import requests
import json

# Login
r = requests.post('http://localhost:8000/api/v1/auth/login', json={
    'email': 'admin@greenmetric.com',
    'password': 'admin123456'
})
token = r.json()['access_token']
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Simulación de un bosque grande (~20,000 m²)
r2 = requests.post(
    'http://localhost:8000/api/v1/simulaciones/?campus_id=1',
    headers=headers,
    json={
        'tipo_intervencion': 'bosque_academico',
        'geom': {
            'type': 'Polygon',
            'coordinates': [[
                [-70.0030, 10.0000],
                [-70.0010, 10.0000],
                [-70.0010, 10.0009],
                [-70.0030, 10.0009],
                [-70.0030, 10.0000]
            ]]
        }
    }
)
data = r2.json()

print("=" * 60)
print("SIMULACIÓN DE BOSQUE GRANDE (~20,000 m²)")
print("=" * 60)
print(f"Área simulada: {data['area_m2']:.2f} m²")
print()

# Calcular porcentajes
area_bosque_antes = 10914.25
area_bosque_despues = area_bosque_antes + data['area_m2']
pct_antes = (area_bosque_antes / 100000) * 100
pct_despues = (area_bosque_despues / 100000) * 100

print(f"SI2 porcentaje antes: {pct_antes:.2f}%")
print(f"SI2 porcentaje después: {pct_despues:.2f}%")
print()

print("PUNTAJES ANTES:")
for k, v in data['puntajes_antes'].items():
    print(f"  {k}: {v:.2f}")

print()
print("PUNTAJES DESPUÉS:")
for k, v in data['puntajes_despues'].items():
    print(f"  {k}: {v:.2f}")

print()
print("DIFERENCIAS:")
for k in data['puntajes_antes']:
    dif = data['puntajes_despues'][k] - data['puntajes_antes'][k]
    if dif != 0:
        print(f"  {k}: {dif:+.2f}")
print("=" * 60)