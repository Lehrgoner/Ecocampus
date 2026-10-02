import requests
import json

# Login
r = requests.post('http://localhost:8000/api/v1/auth/login', json={
    'email': 'admin@greenmetric.com',
    'password': 'admin123456'
})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Recomendaciones
r2 = requests.get(
    'http://localhost:8000/api/v1/recomendaciones/?campus_id=1&presupuesto_max=100000&top_n=5',
    headers=headers
)
data = r2.json()

print("=" * 60)
print("RECOMENDACIONES DE INTERVENCIÓN")
print("=" * 60)
print(f"Ranking actual: #{data['ranking_actual']}")
print(f"Puntaje SI actual: {data['puntaje_si_actual']:.2f}")
print(f"Presupuesto usado: ${data['presupuesto_usado']:.0f}")
print()
print("TOP 5 RECOMENDACIONES:")
print("-" * 60)
for i, rec in enumerate(data['recomendaciones'], 1):
    print(f"{i}. {rec['tipo']}")
    print(f"   Área: {rec['area_m2']:.0f} m²")
    print(f"   Costo: ${rec['costo_estimado_usd']:.2f}")
    print(f"   Ganancia SI: +{rec['ganancia_si']:.2f} ({rec['porcentaje_ganancia_si']:.1f}%)")
    print(f"   Ranking predicho: #{rec['ranking_predicho']}")
    print(f"   Posiciones mejoradas: {rec['posiciones_mejoradas']:+d}")
    print()
print("ÁREAS MÍNIMAS PARA AVANZAR:")
print("-" * 60)
for area in data['areas_minimas_para_avanzar']:
    print(f"{area['indicador']}: necesita +{area['area_adicional_m2']:.0f} m²")
    print(f"   → Sube de {area['multiplicador_actual']} a {area['multiplicador_siguiente']}")
    print(f"   → Ganancia: +{area['ganancia_puntaje_si']:.2f} pts")
    print()
print("=" * 60)