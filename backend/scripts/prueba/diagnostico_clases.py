import requests
import re

headers = {'User-Agent': 'Mozilla/5.0'}
anios = [2020, 2021, 2022, 2023, 2024]

for anio in anios:
    url = f'https://uigreenmetric.com/rankings/university/overall-rankings-{anio}'
    r = requests.get(url, headers=headers, timeout=30)
    text = r.text
    
    # Buscar todas las clases CSS que contengan 'uni'
    clases_uni = set(re.findall(r'class="([^"]*uni[^"]*)"', text))
    
    # Buscar clases en enlaces que apunten a /university/
    patron_enlace = r'<a href="https://uigreenmetric\.com/university/[^"]*"[^>]*class="([^"]*)"'
    clases_enlaces = set(re.findall(patron_enlace, text))
    
    print(f"=== {anio} ===")
    print(f"Clases con 'uni': {clases_uni}")
    print(f"Clases en enlaces a university: {clases_enlaces}")
    print()