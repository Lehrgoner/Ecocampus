"""
Script para extraer datos de Overall Rankings de UI GreenMetric.
Maneja los formatos de 2020-2021 (tabla clásica) y 2022-2025 (HTML moderno).
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
from pathlib import Path

RUTA_DATOS = Path(__file__).parent / "datos_historicos"

def descargar_pagina(url: str) -> str:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    return response.text


def extraer_tabla_clasica(html: str, anio: int) -> pd.DataFrame:
    """
    Extrae datos de tablas clásicas (2020-2021).
    Formato: <table> → <tr> → <td>
    """
    soup = BeautifulSoup(html, "lxml")
    
    tabla = soup.find("table")
    if not tabla:
        return pd.DataFrame()
    
    filas = []
    for fila in tabla.find_all("tr"):
        celdas = fila.find_all(["td", "th"])
        if len(celdas) < 3:
            continue
        
        textos = [celda.get_text(strip=True) for celda in celdas]
        
        # Verificar que la fila contenga un ranking numérico
        if not textos[0].isdigit():
            continue
        
        filas.append(textos)
    
    if not filas:
        return pd.DataFrame()
    
    # Columnas: ranking, universidad, país, total, SI, EC, WS, WR, TR, ED
    columnas = ["ranking", "university", "country", "total", "SI", "EC", "WS", "WR", "TR", "ED"]
    
    # Limpiar filas para que tengan exactamente 10 columnas
    filas_limpias = []
    for fila in filas:
        if len(fila) == len(columnas):
            filas_limpias.append(fila[:len(columnas)])
        elif len(fila) > len(columnas):
            # Tomar las primeras 10
            filas_limpias.append(fila[:len(columnas)])
        elif len(fila) == len(columnas) - 1:
            # Falta el país
            fila.insert(2, "")
            filas_limpias.append(fila)
    
    df = pd.DataFrame(filas_limpias, columns=columnas)
    df["year"] = anio
    
    return df


def extraer_tabla_moderna(html: str, anio: int) -> pd.DataFrame:
    """
    Extrae datos de tablas modernas (2022-2025).
    Formato: filas <tr> con <td> y <strong>.
    """
    soup = BeautifulSoup(html, "lxml")
    
    filas = soup.find_all("tr")
    
    datos = []
    for fila in filas:
        # Obtener celdas
        celdas = fila.find_all("td")
        if len(celdas) < 3:
            continue
        
        # Primera celda: ranking
        ranking_td = celdas[0]
        ranking_texto = ranking_td.get_text(strip=True)
        
        if not ranking_texto.isdigit():
            continue
        
        ranking = int(ranking_texto)
        
        # Segunda celda: universidad y país
        universidad_td = celdas[1]
        nombre_uni = universidad_td.get_text(strip=True)
        
        # Separar universidad y país
        span_pais = universidad_td.find("span")
        if span_pais:
            pais = span_pais.get_text(strip=True)
            nombre_uni = nombre_uni.replace(pais, "").strip()
        else:
            pais = ""
        
        # Resto de celdas: puntajes
        puntajes = []
        for celda in celdas[2:]:
            texto = celda.get_text(strip=True)
            # Limpiar texto: quitar comas y espacios
            texto_limpio = texto.replace(",", "")
            try:
                puntajes.append(float(texto_limpio))
            except ValueError:
                continue
        
        if len(puntajes) >= 7:
            # Asumimos: total, SI, EC, WS, WR, TR, ED
            total, si, ec, ws, wr, tr, ed = puntajes[:7]
        elif len(puntajes) == 6:
            # Sin total separado: SI, EC, WS, WR, TR, ED
            si, ec, ws, wr, tr, ed = puntajes[:6]
            total = si + ec + ws + wr + tr + ed
        else:
            continue
        
        datos.append({
            "ranking": ranking,
            "university": nombre_uni,
            "country": pais,
            "total": total,
            "SI": si,
            "EC": ec,
            "WS": ws,
            "WR": wr,
            "TR": tr,
            "ED": ed,
            "year": anio,
        })
    
    if not datos:
        return pd.DataFrame()
    
    return pd.DataFrame(datos)


def main():
    anios = [2020, 2021, 2022, 2023, 2024, 2025]
    RUTA_DATOS.mkdir(parents=True, exist_ok=True)
    
    todos_dfs = []
    
    for anio in anios:
        print(f"\n📥 Procesando año {anio}...")
        
        url = f"https://uigreenmetric.com/rankings/university/overall-rankings-{anio}"
        
        try:
            html = descargar_pagina(url)
            
            # Intentar con formato clásico (2020-2021)
            df_clasico = extraer_tabla_clasica(html, anio)
            
            if not df_clasico.empty:
                print(f"   ✅ {anio}: {len(df_clasico)} universidades (formato clásico)")
                todos_dfs.append(df_clasico)
            else:
                # Intentar con formato moderno (2022-2025)
                df_moderno = extraer_tabla_moderna(html, anio)
                
                if not df_moderno.empty:
                    print(f"   ✅ {anio}: {len(df_moderno)} universidades (formato moderno)")
                    todos_dfs.append(df_moderno)
                else:
                    print(f"   ⚠️ Sin datos para {anio}")
        
        except Exception as e:
            print(f"   ❌ Error con {anio}: {e}")
    
    if todos_dfs:
        df_final = pd.concat(todos_dfs, ignore_index=True)
        archivo_final = RUTA_DATOS / "overall_rankings_2020_2025.csv"
        df_final.to_csv(archivo_final, index=False)
        print(f"\n✅ Datos combinados guardados en: {archivo_final}")
        print(f"Total de registros: {len(df_final)}")
        print(f"Columnas: {list(df_final.columns)}")
    else:
        print("\n❌ No se pudo extraer ningún dato")


if __name__ == "__main__":
    main()