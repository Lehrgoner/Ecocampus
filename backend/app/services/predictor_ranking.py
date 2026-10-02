"""
Servicio de predicción de ranking global usando el modelo entrenado.
Carga el modelo .pkl una sola vez y lo reutiliza en todas las peticiones.
"""

import joblib
from pathlib import Path
import numpy as np

RUTA_MODELO = Path(__file__).parent.parent / "ml" / "modelo_ranking.pkl"

# Variable global para cargar el modelo una sola vez
_modelo = None


def cargar_modelo():
    """Carga el modelo de ranking si no está cargado."""
    global _modelo
    if _modelo is None:
        if RUTA_MODELO.exists():
            _modelo = joblib.load(RUTA_MODELO)
        else:
            raise FileNotFoundError(
                f"Modelo no encontrado en {RUTA_MODELO}. "
                "Ejecuta: python app/ml/train_ranking.py"
            )
    return _modelo


def predecir_ranking(puntajes: dict) -> int:
    """
    Predice la posición en el ranking global.
    
    Args:
        puntajes: Diccionario con las 6 categorías:
            {"SI": float, "EC": float, "WS": float, "WR": float, "TR": float, "ED": float}
    
    Returns:
        int: Posición estimada en el ranking (1 = mejor)
    """
    modelo = cargar_modelo()
    
    # Preparar features en el orden exacto del entrenamiento
    features = np.array([[
        puntajes.get("SI", 0),
        puntajes.get("EC", 0),
        puntajes.get("WS", 0),
        puntajes.get("WR", 0),
        puntajes.get("TR", 0),
        puntajes.get("ED", 0),
    ]])
    
    ranking_predicho = modelo.predict(features)[0]
    
    # Asegurar que sea un entero positivo
    return max(1, int(round(ranking_predicho)))