import requests

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

# Zona 1: Bosque académico (~10,000 m²)
zona1 = {
    'nombre': 'Bosque Académico',
    'tipo': 'bosque_academico',
    'uso_academico': True,
    'geom': {
        'type': 'Polygon',
        'coordinates': [[
            [-70.0000, 10.0000],
            [-69.9990, 10.0000],
            [-69.9990, 10.0009],
            [-70.0000, 10.0009],
            [-70.0000, 10.0000]
        ]]
    }
}

# Zona 2: Bosque no académico (~10,000 m²)
zona2 = {
    'nombre': 'Bosque Decorativo',
    'tipo': 'bosque_academico',
    'uso_academico': False,
    'geom': {
        'type': 'Polygon',
        'coordinates': [[
            [-70.0010, 10.0000],
            [-70.0000, 10.0000],
            [-70.0000, 10.0009],
            [-70.0010, 10.0009],
            [-70.0010, 10.0000]
        ]]
    }
}

# Zona 3: Vegetación plantada (~10,000 m²)
zona3 = {
    'nombre': 'Jardín Central',
    'tipo': 'vegetacion_plantada',
    'geom': {
        'type': 'Polygon',
        'coordinates': [[
            [-70.0000, 9.9990],
            [-69.9990, 9.9990],
            [-69.9990, 10.0000],
            [-70.0000, 10.0000],
            [-70.0000, 9.9990]
        ]]
    }
}

for zona in [zona1, zona2, zona3]:
    r2 = requests.post(
        'http://localhost:8000/api/v1/zonas-verdes/?campus_id=1',
        headers=headers,
        json=zona
    )
    print(f"Creada: {zona['nombre']}")
    print(f"  ID: {r2.json()['id']}")
    print(f"  Área: {r2.json()['area_m2']:.2f} m²")
    print(f"  uso_academico: {r2.json()['uso_academico']}")
    print()