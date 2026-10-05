import requests
import re

headers = {'User-Agent': 'Mozilla/5.0'}

for anio in [2020, 2024]:
    url = f'https://uigreenmetric.com/rankings/university/overall-rankings-{anio}'
    r = requests.get(url, headers=headers, timeout=30)
    text = r.text
    
    print(f"=== Año {anio} ===")
    
    # Buscar el contexto alrededor de 'wageningen' para ver la estructura
    pos = text.lower().find('wageningen')
    if pos >= 0:
        inicio = max(0, pos - 300)
        fin = min(len(text), pos + 500)
        print(f"Contexto de 'wageningen':")
        print(text[inicio:fin])
        print()
    
    # Buscar todos los enlaces que contengan /university/
    enlaces = re.findall(r'<a[^>]*href="[^"]*university[^"]*"[^>]*>', text)
    print(f"Enlaces a /university/: {len(enlaces)}")
    for e in enlaces[:5]:
        print(e)
    print()