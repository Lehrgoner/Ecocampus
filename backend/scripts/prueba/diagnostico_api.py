import requests
import re

url = 'https://uigreenmetric.com/rankings/university/overall-rankings-2025'
headers = {'User-Agent': 'Mozilla/5.0'}

response = requests.get(url, headers=headers)
text = response.text

print(f"Status: {response.status_code}")
print(f"Longitud: {len(text)}")
print()

# Buscar nombres de universidades conocidas que aparecen en rankings
universidades_prueba = [
    "Wageningen", "Oxford", "California", "Sao Paulo", 
    "Indonesia", "Tokyo", "Sydney", "Toronto"
]

print("=== Buscando universidades de prueba ===")
for uni in universidades_prueba:
    if uni.lower() in text.lower():
        pos = text.lower().find(uni.lower())
        inicio = max(0, pos - 100)
        fin = min(len(text), pos + 300)
        print(f"\n✅ '{uni}' encontrada en posición {pos}")
        print(f"Contexto: {text[inicio:fin]}")
        print("---")
    else:
        print(f"❌ '{uni}' no encontrada")

print()

# Buscar números que parezcan puntajes (ej: 8500, 7500, etc.)
print("=== Buscando puntajes ===")
puntajes = re.findall(r'>\s*(\d{3,4})\s*<', text)
print(f"Números de 3-4 dígitos encontrados: {len(puntajes)}")
if puntajes:
    print(f"Primeros 20: {puntajes[:20]}")
    print(f"Últimos 20: {puntajes[-20:]}")

print()

# Buscar la palabra "Rank" o "Score"
print("=== Buscando encabezados de tabla ===")
encabezados = ["Rank", "Overall", "SI", "EC", "WS", "WR", "TR", "ED", "Score"]
for enc in encabezados:
    count = text.count(f">{enc}<")
    print(f"'{enc}': {count} ocurrencias como encabezado")