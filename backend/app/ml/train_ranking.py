"""
Script para entrenar el modelo de predicción de ranking global.
Usa datos REALES extraídos de UI GreenMetric (2020-2025).

NOTA: GD (Governance & Digitalization) es nueva en 2026. Para no
introducir data leakage, entrenamos con 6 categorías reales (SI, EC,
WS, WR, TR, ED). Cuando salgan los datos reales de GD en 2026,
reentrenaremos con 7 categorías.
"""

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from pathlib import Path

RUTA_DATOS = Path(__file__).parent / "datos_historicos" / "overall_rankings_2020_2025.csv"
RUTA_MODELO = Path(__file__).parent / "modelo_ranking.pkl"


def cargar_datos() -> pd.DataFrame:
    """Carga los datos históricos reales y limpia las columnas."""
    if not RUTA_DATOS.exists():
        raise FileNotFoundError(
            f"No se encontró {RUTA_DATOS}. "
            "Ejecuta primero: python app/ml/scrapear_overall.py"
        )
    
    print(f"📂 Cargando datos desde {RUTA_DATOS}...")
    df = pd.read_csv(RUTA_DATOS)
    
    columnas_numericas = ["ranking", "total", "SI", "EC", "WS", "WR", "TR", "ED", "year"]
    for col in columnas_numericas:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    
    df["country"] = df["country"].str.replace(r"\s*\(\s*\)\s*$", "", regex=True)
    
    antes = len(df)
    df = df.dropna(subset=["total", "SI", "EC", "WS", "WR", "TR", "ED", "ranking"])
    despues = len(df)
    
    if antes != despues:
        print(f"   ⚠️ Eliminadas {antes - despues} filas con valores nulos")
    
    print(f"   Registros válidos: {despues}")
    
    return df


def entrenar_modelo(df: pd.DataFrame):
    """Entrena el modelo con 6 categorías reales."""
    print("\n🧠 Entrenando modelo (6 categorías)...")
    
    # Features: solo las 6 categorías reales
    X = df[["SI", "EC", "WS", "WR", "TR", "ED"]]
    y = df["ranking"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    modelo = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        random_state=42,
        n_jobs=-1,
    )
    
    modelo.fit(X_train, y_train)
    
    y_pred = modelo.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n✅ Modelo entrenado correctamente")
    print(f"   MAE: {mae:.2f} posiciones")
    print(f"   R² Score: {r2:.3f}")
    
    importancias = modelo.feature_importances_
    print(f"\n📊 Importancia de cada categoría:")
    for nombre, imp in zip(X.columns, importancias):
        print(f"   {nombre}: {imp:.3f}")
    
    return modelo


def main():
    print("=" * 60)
    print("ENTRENAMIENTO DEL MODELO DE RANKING")
    print("=" * 60)
    
    df = cargar_datos()
    modelo = entrenar_modelo(df)
    
    joblib.dump(modelo, RUTA_MODELO)
    print(f"\n💾 Modelo guardado en: {RUTA_MODELO}")
    print("=" * 60)
    
    print("\n📌 NOTA: Este modelo usa 6 categorías (sin GD).")
    print("   Cuando salgan datos reales de GD en 2026, reentrenaremos con 7.")


if __name__ == "__main__":
    main()