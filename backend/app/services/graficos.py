"""
Servicio para generar gráficos con matplotlib y convertirlos a imágenes
para embeber en PDFs.
"""

import io
import matplotlib
matplotlib.use("Agg")  # Backend sin GUI
import matplotlib.pyplot as plt
import numpy as np


def _figura_a_bytes(fig) -> bytes:
    """Convierte una figura de matplotlib a bytes PNG."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=100, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def generar_grafico_radar(datos: dict) -> bytes:
    """
    Genera un gráfico radar con las 6 categorías.
    
    Args:
        datos: {"SI": 410, "EC": 1000, "WS": 850, "WR": 550, "TR": 850, "ED": 650}
    """
    categorias = list(datos.keys())
    valores = list(datos.values())
    
    # Cerrar el círculo
    valores += valores[:1]
    
    # Ángulos
    angulos = np.linspace(0, 2 * np.pi, len(categorias), endpoint=False).tolist()
    angulos += angulos[:1]
    
    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
    
    # Plot
    ax.plot(angulos, valores, "o-", linewidth=2, color="#1B5E20")
    ax.fill(angulos, valores, alpha=0.25, color="#4CAF50")
    
    # Etiquetas
    ax.set_xticks(angulos[:-1])
    ax.set_xticklabels(categorias, fontsize=11)
    
    # Título
    ax.set_title("Perfil de Sostenibilidad por Categoría", fontsize=13, pad=20)
    
    return _figura_a_bytes(fig)


def generar_grafico_barras_si(indicadores: list) -> bytes:
    """
    Genera un gráfico de barras con los indicadores SI 1-8.
    
    Args:
        indicadores: [{"codigo": "SI1", "puntaje": 50, "puntaje_maximo": 200}, ...]
    """
    codigos = [ind["codigo"] for ind in indicadores]
    puntajes = [ind["puntaje"] for ind in indicadores]
    maximos = [ind["puntaje_maximo"] for ind in indicadores]
    
    x = np.arange(len(codigos))
    width = 0.35
    
    fig, ax = plt.subplots(figsize=(10, 5))
    
    # Barras: puntaje actual y máximo
    bars1 = ax.bar(x - width/2, puntajes, width, label="Puntaje actual", color="#4CAF50")
    bars2 = ax.bar(x + width/2, maximos, width, label="Puntaje máximo", color="#E0E0E0")
    
    # Etiquetas
    ax.set_xlabel("Indicador", fontsize=11)
    ax.set_ylabel("Puntaje", fontsize=11)
    ax.set_title("Indicadores SI 1-8", fontsize=13)
    ax.set_xticks(x)
    ax.set_xticklabels(codigos)
    ax.legend()
    
    # Valores sobre las barras
    for bar in bars1:
        height = bar.get_height()
        ax.annotate(f"{height:.0f}",
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha="center", fontsize=8)
    
    plt.tight_layout()
    return _figura_a_bytes(fig)


def generar_grafico_torta_zonas(zonas_por_tipo: dict) -> bytes:
    """
    Genera un gráfico de torta con la distribución de zonas verdes.
    
    Args:
        zonas_por_tipo: {"bosque_academico": 10914, "vegetacion_plantada": 12127, ...}
    """
    tipos = list(zonas_por_tipo.keys())
    areas = list(zonas_por_tipo.values())
    
    colores = {
        "bosque_academico": "#1B5E20",
        "vegetacion_plantada": "#4CAF50",
        "cesped": "#8BC34A",
        "jardin": "#689F38",
        "jardin_lluvia": "#00897B",
    }
    colors = [colores.get(t, "#999999") for t in tipos]
    
    fig, ax = plt.subplots(figsize=(7, 7))
    ax.pie(areas, labels=tipos, autopct="%1.1f%%", colors=colors, startangle=90)
    ax.set_title("Distribución de Zonas Verdes por Tipo", fontsize=13)
    
    return _figura_a_bytes(fig)


def generar_grafico_barras_ranking(recomendaciones: list) -> bytes:
    """
    Genera un gráfico de barras horizontales con las recomendaciones.
    
    Args:
        recomendaciones: Lista de dicts con "tipo", "ganancia_si", "costo_estimado_usd"
    """
    tipos = [r["tipo"] for r in recomendaciones]
    ganancias = [r["ganancia_si"] for r in recomendaciones]
    
    fig, ax = plt.subplots(figsize=(10, 5))
    
    y = np.arange(len(tipos))
    ax.barh(y, ganancias, color="#4CAF50")
    
    ax.set_yticks(y)
    ax.set_yticklabels(tipos)
    ax.set_xlabel("Ganancia en SI (puntos)", fontsize=11)
    ax.set_title("Impacto de las Recomendaciones en SI", fontsize=13)
    
    # Valores
    for i, v in enumerate(ganancias):
        ax.text(v + 1, i, f"+{v:.0f}", va="center", fontsize=10)
    
    plt.tight_layout()
    return _figura_a_bytes(fig)