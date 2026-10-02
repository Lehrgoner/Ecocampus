import requests
import json

# Login
r = requests.post('http://localhost:8000/api/v1/auth/login', json={
    'email': 'admin@greenmetric.com',
    'password': 'admin123456'
})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Obtener zonas actuales
r2 = requests.get('http://localhost:8000/api/v1/zonas-verdes/?campus_id=1', headers=headers)
zonas = r2.json()

print("=" * 60)
print("ZONAS REGISTRADAS")
print("=" * 60)

area_bosque_academico = 0
area_bosque_total = 0
for z in zonas:
    tipo = z['tipo']
    uso_ac = z.get('uso_academico', False)
    area = z.get('area_m2', 0)
    
    if tipo == 'bosque_academico':
        area_bosque_total += area
        if uso_ac:
            area_bosque_academico += area
    
    print(f"  ID {z['id']}: {z['nombre']}")
    print(f"    Tipo: {tipo}")
    print(f"    Uso académico: {uso_ac}")
    print(f"    Área: {area:.2f} m²")
    print()

print("=" * 60)
print(f"Área total de bosques: {area_bosque_total:.2f} m²")
print(f"Área de bosques con uso académico: {area_bosque_academico:.2f} m²")
print("=" * 60)

# Obtener indicadores
r3 = requests.get('http://localhost:8000/api/v1/indicadores/actuales?campus_id=1', headers=headers)
data = r3.json()

print()
print("=" * 60)
print("INDICADORES ACTUALES")
print("=" * 60)
for ind in data['indicadores']:
    print(f"  {ind['codigo']}: {ind['puntaje']:.2f} pts ({ind['porcentaje']:.1f}%)")
print(f"  TOTAL: {data['puntaje_total_si']:.2f} pts")
print("=" * 60)