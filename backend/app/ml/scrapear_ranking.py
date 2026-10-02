"""
Script para descargar datos históricos de UI GreenMetric desde la web.
Extrae la tabla de rankings por categoría para cada año disponible.
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from pathlib import Path

RUTA_DATOS = Path(__file__).parent / "datos_historicos"

def descargar_pagina(url: str) -> str:
    """Descarga el HTML de una página web."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    return response.text


def extraer_tabla_categoria(html: str, categoria: str, anio: int) -> pd.DataFrame:
    """
    Extrae la tabla de rankings por categoría.
    
    Args:
        html: HTML de la página
        categoria: Nombre de la categoría (SI, EC, WS, WR, TR, ED)
        anio: Año del ranking
    
    Returns:
        DataFrame con columnas: university, year, {categoria}
    """
    soup = BeautifulSoup(html, "lxml")
    
    # Buscar todas las tablas en la página
    tablas = soup.find_all("table")
    
    if not tablas:
        print(f"⚠️ No se encontraron tablas para {categoria} {anio}")
        return pd.DataFrame()
    
    # La tabla principal suele ser la más grande
    tabla = max(tablas, key=lambda t: len(t.find_all("tr")))
    
    filas = []
    for fila in tabla.find_all("tr"):
        celdas = fila.find_all(["td", "th"])
        if len(celdas) >= 2:
            texto_celdas = [celda.get_text(strip=True) for celda in celdas]
            filas.append(texto_celdas)
    
    if not filas:
        return pd.DataFrame()
    
    # Intentar identificar encabezados
    df = pd.DataFrame(filas)
    
    # La primera fila suele ser encabezado
    df.columns = df.iloc[0]
    df = df.iloc[1:].reset_index(drop=True)
    
    # Agregar columna de año
    df["year"] = anio
    
    return df


def extraer_tabla_overall(html: str, anio: int) -> pd.DataFrame:
    """
    Extrae la tabla de ranking global.
    """
    soup = BeautifulSoup(html, "lxml")
    
    tablas = soup.find_all("table")
    if not tablas:
        print(f"⚠️ No se encontraron tablas para overall {anio}")
        return pd.DataFrame()
    
    tabla = max(tablas, key=lambda t: len(t.find_all("tr")))
    
    filas = []
    for fila in tabla.find_all("tr"):
        celdas = fila.find_all(["td", "th"])
        if len(celdas) >= 2:
            texto_celdas = [celda.get_text(strip=True) for celda in celdas]
            filas.append(texto_celdas)
    
    if not filas:
        return pd.DataFrame()
    
    df = pd.DataFrame(filas)
    df.columns = df.iloc[0]
    df = df.iloc[1:].reset_index(drop=True)
    df["year"] = anio
    
    return df


def main():
    anios = [2020, 2021, 2022, 2023, 2024, 2025]
    
    RUTA_DATOS.mkdir(parents=True, exist_ok=True)
    
    for anio in anios:
        print(f"\n📥 Descargando datos del año {anio}...")
        
        # URL de rankings por categoría
        url_categoria = f"https://uigreenmetric.com/rankings/university/ranking-by-category-{anio}"
        
        try:
            html = descargar_pagina(url_categoria)
            
            # Extraer tabla de categorías
            df_categoria = extraer_tabla_categoria(html, "todas", anio)
            
            if not df_categoria.empty:
                archivo = RUTA_DATOS / f"categorias_{anio}.csv"
                df_categoria.to_csv(archivo, index=False)
                print(f"   ✅ Categorías {anio}: {len(df_categoria)} filas → {archivo}")
            else:
                print(f"   ⚠️ Sin datos de categorías para {anio}")
            
            time.sleep(2)  # Esperar entre peticiones
        
        except Exception as e:
            print(f"   ❌ Error con {anio}: {e}")
        
        # URL de ranking global
        url_overall = f"https://uigreenmetric.com/rankings/university/overall-rankings-{anio}"
        
        try:
            html = descargar_pagina(url_overall)
            
            df_overall = extraer_tabla_overall(html, anio)
            
            if not df_overall.empty:
                archivo = RUTA_DATOS / f"overall_{anio}.csv"
                df_overall.to_csv(archivo, index=False)
                print(f"   ✅ Overall {anio}: {len(df_overall)} filas → {archivo}")
            else:
                print(f"   ⚠️ Sin datos overall para {anio}")
            
            time.sleep(2)
        
        except Exception as e:
            print(f"   ❌ Error con overall {anio}: {e}")
    
    print("\n✅ Descarga completada")


if __name__ == "__main__":
    main()