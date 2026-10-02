"""
Servicio para generar reportes PDF con fpdf2.
Incluye: portada, indicadores, gráficos, simulaciones, recomendaciones
detalladas, áreas mínimas y checklist detallado.
"""

import io
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional

from fpdf import FPDF

from app.services.graficos import (
    generar_grafico_radar,
    generar_grafico_barras_si,
    generar_grafico_torta_zonas,
    generar_grafico_barras_ranking,
)


# Rutas de assets
RUTA_ASSETS = Path(__file__).parent.parent / "assets"
RUTA_LOGO = RUTA_ASSETS / "logo.png"

# Constantes de la app
NOMBRE_APP = "Ecocampus"
SUBTITULO_APP = "Análisis Predictivo de Sostenibilidad Universitaria"


class ReportePDF(FPDF):
    """Clase personalizada de FPDF con header y footer."""

    def __init__(self, nombre_campus: str, tiene_logo: bool = False):
        super().__init__()
        self.nombre_campus = nombre_campus
        self.tiene_logo = tiene_logo

    def header(self):
        # Logo a la izquierda
        if self.tiene_logo:
            try:
                self.image(str(RUTA_LOGO), x=10, y=8, w=15)
            except Exception:
                pass

        # Nombre de la app centrado
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(27, 94, 32)
        self.set_xy(30, 10)
        self.cell(150, 8, NOMBRE_APP, 0, 1, "C")

        # Subtítulo
        self.set_font("Helvetica", "", 8)
        self.set_text_color(100, 100, 100)
        self.set_x(30)
        self.cell(150, 4, SUBTITULO_APP, 0, 1, "C")

        # Nombre del campus
        self.set_font("Helvetica", "I", 9)
        self.set_x(30)
        self.cell(150, 5, self.nombre_campus, 0, 1, "C")

        self.ln(3)
        self.set_draw_color(76, 175, 80)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"{NOMBRE_APP} - Página {self.page_no()}", 0, 0, "C")


def _imagen_temporal(img_bytes: bytes) -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    tmp.write(img_bytes)
    tmp.close()
    return tmp.name


def _limpiar_temporales(rutas: list):
    for ruta in rutas:
        try:
            os.unlink(ruta)
        except Exception:
            pass


def _seccion_titulo(pdf, texto):
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(27, 94, 32)
    pdf.cell(0, 12, texto, 0, 1, "L")
    pdf.ln(2)


def _subtitulo(pdf, texto):
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(50, 50, 50)
    pdf.cell(0, 8, texto, 0, 1, "L")
    pdf.ln(1)


def generar_reporte_pdf(
    campus,
    indicadores: list,
    puntajes_categorias: dict,
    zonas_por_tipo: dict,
    recomendaciones: list,
    checklist_resumen: dict,
    areas_minimas: list,
    simulaciones: list,
    ranking_estimado: Optional[int] = None,
) -> bytes:
    """
    Genera el PDF completo del reporte y devuelve los bytes.
    """
    tiene_logo = RUTA_LOGO.exists()
    pdf = ReportePDF(campus.nombre, tiene_logo=tiene_logo)
    temporales = []

    # ============ PORTADA ============
    pdf.add_page()

    # Logo grande en la portada
    if tiene_logo:
        try:
            # Centrar el logo horizontalmente (ancho de página = 210mm)
            pdf.image(str(RUTA_LOGO), x=75, y=30, w=60)
            pdf.ln(70)
        except Exception:
            pdf.ln(20)
    else:
        pdf.ln(30)

    # Nombre de la app
    pdf.set_font("Helvetica", "B", 32)
    pdf.set_text_color(27, 94, 32)
    pdf.cell(0, 15, NOMBRE_APP, 0, 1, "C")

    # Subtítulo
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, SUBTITULO_APP, 0, 1, "C")

    pdf.ln(15)

    # Título del reporte
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(50, 50, 50)
    pdf.cell(0, 12, "Reporte de Sostenibilidad", 0, 1, "C")

    pdf.set_font("Helvetica", "", 16)
    pdf.ln(5)
    pdf.cell(0, 10, campus.nombre, 0, 1, "C")

    pdf.set_font("Helvetica", "", 12)
    pdf.ln(8)
    if campus.ciudad:
        pdf.cell(0, 8, f"{campus.ciudad}, {campus.pais or ''}", 0, 1, "C")
    pdf.cell(0, 8, f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", 0, 1, "C")

    # Resumen ejecutivo
    pdf.ln(15)
    pdf.set_fill_color(240, 248, 240)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(27, 94, 32)
    pdf.cell(0, 12, "Resumen Ejecutivo", 0, 1, "L", True)
    pdf.ln(5)

    puntaje_total = sum(i["puntaje"] for i in indicadores)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(50, 50, 50)
    pdf.cell(0, 8, f"Puntaje SI Total: {puntaje_total:.0f} / 1100 pts ({puntaje_total/1100*100:.1f}%)", 0, 1, "L")
    if ranking_estimado:
        pdf.cell(0, 8, f"Ranking estimado: #{ranking_estimado}", 0, 1, "L")
    pdf.cell(0, 8, f"Zonas verdes registradas: {len(zonas_por_tipo)} tipos", 0, 1, "L")
    pdf.cell(0, 8, f"Area total del campus: {campus.area_total_m2:,.0f} m2", 0, 1, "L")
    pdf.cell(0, 8, f"Poblacion total: {campus.poblacion_total:,} personas", 0, 1, "L")
    pdf.cell(0, 8, f"Simulaciones realizadas: {len(simulaciones)}", 0, 1, "L")

    # ============ PÁGINA 2: INDICADORES ============
    pdf.add_page()
    _seccion_titulo(pdf, "Indicadores SI 1-8")

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(76, 175, 80)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(20, 8, "Codigo", 1, 0, "C", True)
    pdf.cell(90, 8, "Nombre", 1, 0, "C", True)
    pdf.cell(30, 8, "Puntaje", 1, 0, "C", True)
    pdf.cell(30, 8, "Maximo", 1, 0, "C", True)
    pdf.cell(20, 8, "%", 1, 1, "C", True)

    pdf.set_text_color(50, 50, 50)
    pdf.set_font("Helvetica", "", 9)

    for ind in indicadores:
        pdf.cell(20, 7, ind["codigo"], 1, 0, "C")
        pdf.cell(90, 7, ind["nombre"][:50], 1, 0, "L")
        pdf.cell(30, 7, f"{ind['puntaje']:.1f}", 1, 0, "C")
        pdf.cell(30, 7, f"{ind['puntaje_maximo']:.0f}", 1, 0, "C")
        pdf.cell(20, 7, f"{ind['porcentaje']:.1f}%", 1, 1, "C")

    pdf.ln(10)
    img_barras = generar_grafico_barras_si(indicadores)
    tmp_barras = _imagen_temporal(img_barras)
    temporales.append(tmp_barras)
    _subtitulo(pdf, "Comparativa SI 1-8")
    pdf.image(tmp_barras, x=15, w=180)

    # ============ PÁGINA 3: RADAR Y ZONAS ============
    pdf.add_page()
    img_radar = generar_grafico_radar(puntajes_categorias)
    tmp_radar = _imagen_temporal(img_radar)
    temporales.append(tmp_radar)

    _seccion_titulo(pdf, "Perfil de Sostenibilidad")
    pdf.image(tmp_radar, x=45, w=120)
    pdf.ln(5)

    if zonas_por_tipo:
        img_torta = generar_grafico_torta_zonas(zonas_por_tipo)
        tmp_torta = _imagen_temporal(img_torta)
        temporales.append(tmp_torta)
        _seccion_titulo(pdf, "Distribucion de Zonas Verdes")
        pdf.image(tmp_torta, x=50, w=110)

    # ============ PÁGINA 4: SIMULACIONES ============
    pdf.add_page()
    _seccion_titulo(pdf, "Historial de Simulaciones")

    if simulaciones:
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(76, 175, 80)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(35, 8, "Fecha", 1, 0, "C", True)
        pdf.cell(40, 8, "Tipo", 1, 0, "C", True)
        pdf.cell(25, 8, "Area (m2)", 1, 0, "C", True)
        pdf.cell(30, 8, "SI antes", 1, 0, "C", True)
        pdf.cell(30, 8, "SI despues", 1, 0, "C", True)
        pdf.cell(30, 8, "Ganancia", 1, 1, "C", True)

        pdf.set_text_color(50, 50, 50)
        pdf.set_font("Helvetica", "", 8)

        for sim in simulaciones:
            fecha = sim.get("creado_en", "")
            if fecha:
                try:
                    fecha = datetime.fromisoformat(fecha.replace("Z", "+00:00")).strftime("%d/%m/%Y")
                except Exception:
                    fecha = str(fecha)[:10]

            puntajes_antes = sim.get("puntajes_antes", {})
            puntajes_despues = sim.get("puntajes_despues", {})
            si_antes = puntajes_antes.get("total", 0) if isinstance(puntajes_antes, dict) else 0
            si_despues = puntajes_despues.get("total", 0) if isinstance(puntajes_despues, dict) else 0
            ganancia = si_despues - si_antes

            pdf.cell(35, 7, str(fecha)[:10], 1, 0, "C")
            pdf.cell(40, 7, sim.get("tipo_intervencion", "")[:20], 1, 0, "L")
            pdf.cell(25, 7, f"{sim.get('area_m2', 0):.0f}", 1, 0, "C")
            pdf.cell(30, 7, f"{si_antes:.0f}", 1, 0, "C")
            pdf.cell(30, 7, f"{si_despues:.0f}", 1, 0, "C")
            pdf.cell(30, 7, f"+{ganancia:.0f}", 1, 1, "C")
    else:
        pdf.set_font("Helvetica", "I", 10)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 10, "No hay simulaciones registradas.", 0, 1, "L")

    # ============ PÁGINA 5-6: RECOMENDACIONES ============
    pdf.add_page()
    _seccion_titulo(pdf, "Recomendaciones de Intervencion")

    if recomendaciones:
        img_recom = generar_grafico_barras_ranking(recomendaciones)
        tmp_recom = _imagen_temporal(img_recom)
        temporales.append(tmp_recom)
        pdf.image(tmp_recom, x=15, w=180)
        pdf.ln(5)

        for i, rec in enumerate(recomendaciones, 1):
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(27, 94, 32)
            pdf.cell(0, 8, f"#{i}. {rec['tipo'].replace('_', ' ').title()}", 0, 1, "L")

            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(50, 50, 50)
            pdf.set_x(15)
            pdf.cell(0, 6, f"Area sugerida: {rec['area_m2']:,.0f} m2", 0, 1, "L")

            pdf.set_x(15)
            pdf.cell(0, 6, f"Costo estimado: ${rec['costo_estimado_usd']:,.0f} USD", 0, 1, "L")

            pdf.set_x(15)
            pdf.cell(0, 6, f"Ganancia en SI: +{rec['ganancia_si']:.1f} pts ({rec['porcentaje_ganancia_si']:.1f}%)", 0, 1, "L")

            pdf.set_x(15)
            if rec.get("posiciones_mejoradas", 0) > 0:
                pdf.cell(0, 6, f"Ranking: #{rec['ranking_predicho']} (mejora {rec['posiciones_mejoradas']} posiciones)", 0, 1, "L")
            else:
                pdf.cell(0, 6, f"Ranking: #{rec.get('ranking_predicho', 'N/A')}", 0, 1, "L")

            pdf.set_x(15)
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(0, 6, f"Descripcion: {rec['descripcion']}", 0, 1, "L")

            pdf.ln(3)
    else:
        pdf.set_font("Helvetica", "I", 10)
        pdf.cell(0, 10, "No hay recomendaciones disponibles.", 0, 1, "L")

    # ============ PÁGINA 7: ÁREAS MÍNIMAS ============
    pdf.add_page()
    _seccion_titulo(pdf, "Areas Minimas para Avanzar de Rango")

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(
        0, 6,
        "Esta tabla muestra el area adicional necesaria para subir al siguiente "
        "rango de puntuacion en cada indicador cuantitativo (SI 1-4).",
    )
    pdf.ln(5)

    if areas_minimas:
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(76, 175, 80)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(25, 8, "Indicador", 1, 0, "C", True)
        pdf.cell(35, 8, "Actual (%)", 1, 0, "C", True)
        pdf.cell(35, 8, "Siguiente (%)", 1, 0, "C", True)
        pdf.cell(45, 8, "Area adicional (m2)", 1, 0, "C", True)
        pdf.cell(45, 8, "Ganancia (pts)", 1, 1, "C", True)

        pdf.set_text_color(50, 50, 50)
        pdf.set_font("Helvetica", "", 9)

        for area in areas_minimas:
            pdf.cell(25, 7, area["indicador"], 1, 0, "C")
            pdf.cell(35, 7, f"{area['porcentaje_actual']:.2f}%", 1, 0, "C")
            pdf.cell(35, 7, f"{area['siguiente_rango_pct']:.2f}%", 1, 0, "C")
            pdf.cell(45, 7, f"{area['area_adicional_m2']:,.0f}", 1, 0, "C")
            pdf.cell(45, 7, f"+{area['ganancia_puntaje_si']:.1f}", 1, 1, "C")
    else:
        pdf.set_font("Helvetica", "I", 10)
        pdf.cell(0, 10, "Todos los indicadores estan en el rango maximo.", 0, 1, "L")

    # ============ PÁGINA 8-9: CHECKLIST DETALLADO ============
    pdf.add_page()
    _seccion_titulo(pdf, "Estado del Checklist SI 5-8")

    # Tabla resumen
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(76, 175, 80)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(30, 8, "Indicador", 1, 0, "C", True)
    pdf.cell(30, 8, "Nivel", 1, 0, "C", True)
    pdf.cell(40, 8, "Puntaje", 1, 0, "C", True)
    pdf.cell(45, 8, "Items cumplidos", 1, 0, "C", True)
    pdf.cell(45, 8, "Progreso", 1, 1, "C", True)

    pdf.set_text_color(50, 50, 50)
    pdf.set_font("Helvetica", "", 9)

    for codigo in ["SI5", "SI6", "SI7", "SI8"]:
        info = checklist_resumen.get(codigo, {})
        nivel = info.get("nivel", 1)
        puntaje = info.get("puntaje", 0)
        cumplidos = info.get("items_cumplidos", 0)
        total = info.get("items_totales", 0)

        pdf.cell(30, 8, codigo, 1, 0, "C")
        pdf.cell(30, 8, f"Nivel {nivel}/5", 1, 0, "C")
        pdf.cell(40, 8, f"{puntaje:.0f} / 100 pts", 1, 0, "C")
        pdf.cell(45, 8, f"{cumplidos} / {total}", 1, 0, "C")
        pdf.cell(45, 8, f"{(cumplidos/total*100) if total > 0 else 0:.0f}%", 1, 1, "C")

    pdf.ln(8)

    # Detalle por indicador
    descripciones = {
        "SI5": "Instalaciones para discapacidad, necesidades especiales y maternidad",
        "SI6": "Instalaciones de seguridad y proteccion",
        "SI7": "Infraestructura de salud para el bienestar",
        "SI8": "Conservacion de flora, fauna y recursos geneticos",
    }

    for codigo in ["SI5", "SI6", "SI7", "SI8"]:
        info = checklist_resumen.get(codigo, {})
        if not info:
            continue

        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(27, 94, 32)
        pdf.cell(0, 8, f"{codigo} - {descripciones[codigo]}", 0, 1, "L")

        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(50, 50, 50)
        pdf.set_x(15)
        pdf.cell(0, 6, f"Puntaje actual: {info['puntaje']:.0f} / 100 pts (Nivel {info['nivel']}/5)", 0, 1, "L")

        faltantes = info.get("items_faltantes", [])
        if faltantes:
            pdf.set_x(15)
            pdf.cell(0, 6, f"Items faltantes ({len(faltantes)}):", 0, 1, "L")

            pdf.set_font("Helvetica", "", 8)
            pdf.set_text_color(80, 80, 80)
            texto_items = ", ".join(faltantes[:8])
            if len(faltantes) > 8:
                texto_items += f" y {len(faltantes) - 8} mas"
            pdf.set_x(20)
            pdf.multi_cell(170, 5, texto_items)

        # Sugerencia
        if info["nivel"] < 5:
            from app.services.motor_reglas import calcular_items_necesarios_para_siguiente_nivel
            necesarios = calcular_items_necesarios_para_siguiente_nivel(codigo, info["nivel"])
            if necesarios > 0:
                pdf.set_font("Helvetica", "I", 9)
                pdf.set_text_color(76, 175, 80)
                pdf.set_x(15)
                pdf.cell(
                    0, 6,
                    f"-> Marca {necesarios} items mas para subir al Nivel {info['nivel'] + 1}",
                    0, 1, "L",
                )

        pdf.ln(3)

    # ============ GENERAR BYTES ============
    _limpiar_temporales(temporales)

    buf = io.BytesIO()
    pdf.output(buf)
    return buf.getvalue()