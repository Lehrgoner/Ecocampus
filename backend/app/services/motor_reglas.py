"""
Motor de reglas para cálculo de indicadores UI GreenMetric 2026
Categoría: Setting and Infrastructure (SI)

Basado en el Apéndice 1 de la guía oficial 2026.
La puntuación se asigna por RANGOS con multiplicadores fijos,
NO por fórmulas lineales continuas.
"""


def calcular_si1(area_espacio_abierto_m2: float, area_total_campus_m2: float) -> float:
    """
    SI 1 - Proporción de espacio abierto vs. área total del campus
    Puntaje máximo: 200 pts
    Rangos:
        ≤ 1%          → 0.05 × 200
        > 1 - 80%     → 0.25 × 200
        > 80 - 90%    → 0.50 × 200
        > 90 - 95%    → 0.75 × 200
        > 95%         → 1.00 × 200
    """
    if area_total_campus_m2 <= 0:
        return 0.0
    
    porcentaje = (area_espacio_abierto_m2 / area_total_campus_m2) * 100
    
    if porcentaje <= 1:
        return 0.05 * 200
    elif porcentaje <= 80:
        return 0.25 * 200
    elif porcentaje <= 90:
        return 0.50 * 200
    elif porcentaje <= 95:
        return 0.75 * 200
    else:
        return 1.00 * 200


def calcular_si2(area_bosque_academico_m2: float, area_total_campus_m2: float) -> float:
    """
    SI 2 - Área de vegetación forestal para investigación, docencia y/o vinculación
    Puntaje máximo: 100 pts
    Rangos:
        ≤ 2%          → 0.05 × 100
        > 2 - 10%     → 0.25 × 100
        > 10 - 25%    → 0.50 × 100
        > 25 - 35%    → 0.75 × 100
        > 35%         → 1.00 × 100
    """
    if area_total_campus_m2 <= 0:
        return 0.0
    
    porcentaje = (area_bosque_academico_m2 / area_total_campus_m2) * 100
    
    if porcentaje <= 2:
        return 0.05 * 100
    elif porcentaje <= 10:
        return 0.25 * 100
    elif porcentaje <= 25:
        return 0.50 * 100
    elif porcentaje <= 35:
        return 0.75 * 100
    else:
        return 1.00 * 100


def calcular_si3(area_vegetacion_plantada_m2: float, area_total_campus_m2: float) -> float:
    """
    SI 3 - Área de vegetación plantada (excluyendo bosques)
    Puntaje máximo: 200 pts
    Rangos:
        ≤ 10%         → 0.05 × 200
        > 10 - 20%    → 0.25 × 200
        > 20 - 30%    → 0.50 × 200
        > 30 - 50%    → 0.75 × 200
        > 50%         → 1.00 × 200
    """
    if area_total_campus_m2 <= 0:
        return 0.0
    
    porcentaje = (area_vegetacion_plantada_m2 / area_total_campus_m2) * 100
    
    if porcentaje <= 10:
        return 0.05 * 200
    elif porcentaje <= 20:
        return 0.25 * 200
    elif porcentaje <= 30:
        return 0.50 * 200
    elif porcentaje <= 50:
        return 0.75 * 200
    else:
        return 1.00 * 200


def calcular_si4(area_espacio_abierto_m2: float, poblacion_total: int) -> float:
    """
    SI 4 - Espacio abierto por persona
    Puntaje máximo: 200 pts
    Rangos:
        ≤ 10 m²/person        → 0.05 × 200
        > 10 - 20 m²/person   → 0.25 × 200
        > 20 - 40 m²/person   → 0.50 × 200
        > 40 - 70 m²/person   → 0.75 × 200
        > 70 m²/person        → 1.00 × 200
    """
    if poblacion_total <= 0:
        return 0.0
    
    per_capita = area_espacio_abierto_m2 / poblacion_total
    
    if per_capita <= 10:
        return 0.05 * 200
    elif per_capita <= 20:
        return 0.25 * 200
    elif per_capita <= 40:
        return 0.50 * 200
    elif per_capita <= 70:
        return 0.75 * 200
    else:
        return 1.00 * 200


def calcular_si5(nivel: int) -> float:
    """
    SI 5 - Instalaciones para discapacidad, necesidades especiales y maternidad
    Puntaje máximo: 100 pts
    Niveles:
        1 = Ninguna → 0
        2 = Existe una política → 0.25 × 100
        3 = En fase de planificación → 0.50 × 100
        4 = Parcialmente disponibles y operativas → 0.75 × 100
        5 = Existen en todos los edificios y operativas → 1.00 × 100
    """
    rangos = {
        0: 0.0,
        1: 0.0,       # Ninguna
        2: 0.25,      # Existe una política
        3: 0.50,      # En planificación
        4: 0.75,      # Parcialmente disponibles
        5: 1.00,      # Completamente operativas
    }
    multiplicador = rangos.get(nivel, 0.0)
    return multiplicador * 100


def calcular_si6(nivel: int) -> float:
    """
    SI 6 - Instalaciones de seguridad y protección
    Puntaje máximo: 100 pts
    Niveles:
        1 = Sistema pasivo → 0
        2 = CCTV y botón de emergencia → 0.25 × 100
        3 = CCTV, botón, personal certificado, extintor, hidrante → 0.50 × 100
        4 = Todo lo anterior + respuesta > 5 min → 0.75 × 100
        5 = Todo lo anterior + respuesta < 5 min → 1.00 × 100
    """
    rangos = {
        0: 0.0,
        1: 0.0,       # Sistema pasivo
        2: 0.25,      # CCTV + emergencia
        3: 0.50,      # + personal certificado, extintor, hidrante
        4: 0.75,      # + respuesta > 5 min
        5: 1.00,      # + respuesta < 5 min
    }
    multiplicador = rangos.get(nivel, 0.0)
    return multiplicador * 100


def calcular_si7(nivel: int) -> float:
    """
    SI 7 - Infraestructura de salud para el bienestar
    Puntaje máximo: 100 pts
    Niveles:
        1 = Primeros auxilios no disponible → 0
        2 = Primeros auxilios, emergencias, clínica y personal → 0.25 × 100
        3 = + personal certificado → 0.50 × 100
        4 = + hospital → 0.75 × 100
        5 = + sistematizada y accesible al público → 1.00 × 100
    """
    rangos = {
        0: 0.0,
        1: 0.0,       # No disponible
        2: 0.25,      # Primeros auxilios + emergencias + clínica + personal
        3: 0.50,      # + personal certificado
        4: 0.75,      # + hospital
        5: 1.00,      # + sistematizada y accesible al público
    }
    multiplicador = rangos.get(nivel, 0.0)
    return multiplicador * 100


def calcular_si8(nivel: int) -> float:
    """
    SI 8 - Conservación: flora, fauna, vida silvestre, recursos genéticos
    Puntaje máximo: 100 pts
    Niveles:
        1 = En preparación → 0.05 × 100
        2 = Implementado 1-25% → 0.25 × 100
        3 = Implementado 25-50% → 0.50 × 100
        4 = Implementado 50-75% → 0.75 × 100
        5 = Implementado >75% → 1.00 × 100
    """
    rangos = {
        0: 0.0,
        1: 0.05,      # En preparación
        2: 0.25,      # Implementado 1-25%
        3: 0.50,      # Implementado 25-50%
        4: 0.75,      # Implementado 50-75%
        5: 1.00,      # Implementado >75%
    }
    multiplicador = rangos.get(nivel, 0.0)
    return multiplicador * 100


def calcular_todos_indicadores(
    area_espacio_abierto_m2: float,
    area_bosque_academico_m2: float,
    area_vegetacion_plantada_m2: float,
    area_total_campus_m2: float,
    poblacion_total: int,
    checklist=None,
) -> dict:
    """
    Calcula todos los indicadores SI 1-8.
    
    Si se proporciona un checklist, calcula los niveles SI5-SI8
    automáticamente a partir de los booleanos.
    """
    si1 = calcular_si1(area_espacio_abierto_m2, area_total_campus_m2)
    si2 = calcular_si2(area_bosque_academico_m2, area_total_campus_m2)
    si3 = calcular_si3(area_vegetacion_plantada_m2, area_total_campus_m2)
    si4 = calcular_si4(area_espacio_abierto_m2, poblacion_total)

    if checklist:
        si5 = calcular_si5(calcular_nivel_si5_desde_checklist(checklist))
        si6 = calcular_si6(calcular_nivel_si6_desde_checklist(checklist))
        si7 = calcular_si7(calcular_nivel_si7_desde_checklist(checklist))
        si8 = calcular_si8(calcular_nivel_si8_desde_checklist(checklist))
    else:
        si5 = si6 = si7 = si8 = 0.0

    total = si1 + si2 + si3 + si4 + si5 + si6 + si7 + si8

    return {
        "SI1": si1,
        "SI2": si2,
        "SI3": si3,
        "SI4": si4,
        "SI5": si5,
        "SI6": si6,
        "SI7": si7,
        "SI8": si8,
        "total": total,
    }

def calcular_nivel_si5_desde_checklist(checklist) -> int:
    """
    Calcula el nivel SI 5 (1-5) a partir de los booleanos del checklist.
    Basado en la guía GreenMetric 2026:
      1 = Ninguna instalación
      2 = Existe una política
      3 = En fase de planificación
      4 = Parcialmente disponibles y operativas
      5 = Existen en todos los edificios y operativas
    """
    items = [
        checklist.si5_rampas,
        checklist.si5_banos_accesibles,
        checklist.si5_pasamanos,
        checklist.si5_ascensores,
        checklist.si5_senializacion,
        checklist.si5_rutas_accesibles,
        checklist.si5_estacionamiento,
        checklist.si5_sala_lactancia,
        checklist.si5_cambiadores,
        checklist.si5_apoyos_visuales,
    ]
    total = sum(1 for item in items if item)
    
    if total == 0:
        return 1  # Ninguna
    elif total <= 2:
        return 2  # Existe política
    elif total <= 5:
        return 3  # En planificación
    elif total <= 8:
        return 4  # Parcialmente disponibles
    else:
        return 5  # Todas operativas


def calcular_nivel_si6_desde_checklist(checklist) -> int:
    """Calcula el nivel SI 6 a partir de los booleanos (13 ítems)."""
    items = [
        checklist.si6_extintores,
        checklist.si6_alarmas,
        checklist.si6_cctv,
        checklist.si6_personal_seguridad,
        checklist.si6_botones_panico,
        checklist.si6_app_emergencia,
        checklist.si6_salidas_emergencia,
        checklist.si6_sistema_contra_incendios,
        checklist.si6_refugios,
        checklist.si6_primeros_auxilios,
        checklist.si6_iluminacion_emergencia,
        checklist.si6_simulacros,
        checklist.si6_control_acceso,
    ]
    total = sum(1 for item in items if item)
    
    if total == 0:
        return 1
    elif total <= 3:
        return 2
    elif total <= 7:
        return 3
    elif total <= 10:
        return 4
    else:
        return 5


def calcular_nivel_si7_desde_checklist(checklist) -> int:
    """Calcula el nivel SI 7 a partir de los booleanos (10 ítems)."""
    items = [
        checklist.si7_servicio_medico,
        checklist.si7_ambulancia,
        checklist.si7_consultorio_dental,
        checklist.si7_apoyo_psicologico,
        checklist.si7_gimnasio,
        checklist.si7_cancha_deportiva,
        checklist.si7_agua_potable,
        checklist.si7_comedor,
        checklist.si7_lactario,
        checklist.si7_guarderia,
    ]
    total = sum(1 for item in items if item)
    
    if total == 0:
        return 1
    elif total <= 2:
        return 2
    elif total <= 5:
        return 3
    elif total <= 8:
        return 4
    else:
        return 5


def calcular_nivel_si8_desde_checklist(checklist) -> int:
    """Calcula el nivel SI 8 a partir de los booleanos (14 ítems)."""
    items = [
        checklist.si8_jardin_botanico,
        checklist.si8_banco_semillas,
        checklist.si8_invernadero,
        checklist.si8_area_conservacion,
        checklist.si8_programa_reforestacion,
        checklist.si8_inventario_flora,
        checklist.si8_inventario_fauna,
        checklist.si8_especies_amenazadas,
        checklist.si8_programa_reintroduccion,
        checklist.si8_corredor_biologico,
        checklist.si8_compostaje,
        checklist.si8_agricultura_organica,
        checklist.si8_investigacion_biodiversidad,
        checklist.si8_educacion_ambiental,
    ]
    total = sum(1 for item in items if item)
    
    if total == 0:
        return 1
    elif total <= 3:
        return 2
    elif total <= 7:
        return 3
    elif total <= 11:
        return 4
    else:
        return 5

def obtener_items_si5(checklist) -> dict:
    """Devuelve un dict con los ítems de SI5 y su estado."""
    return {
        "Rampas": checklist.si5_rampas,
        "Baños accesibles": checklist.si5_banos_accesibles,
        "Pasamanos": checklist.si5_pasamanos,
        "Ascensores": checklist.si5_ascensores,
        "Señalización": checklist.si5_senializacion,
        "Rutas accesibles": checklist.si5_rutas_accesibles,
        "Estacionamiento accesible": checklist.si5_estacionamiento,
        "Sala de lactancia": checklist.si5_sala_lactancia,
        "Cambiadores": checklist.si5_cambiadores,
        "Apoyos visuales": checklist.si5_apoyos_visuales,
    }


def obtener_items_si6(checklist) -> dict:
    """Devuelve un dict con los ítems de SI6 y su estado."""
    return {
        "Extintores": checklist.si6_extintores,
        "Alarmas": checklist.si6_alarmas,
        "CCTV": checklist.si6_cctv,
        "Personal de seguridad": checklist.si6_personal_seguridad,
        "Botones de pánico": checklist.si6_botones_panico,
        "App de emergencia": checklist.si6_app_emergencia,
        "Salidas de emergencia": checklist.si6_salidas_emergencia,
        "Sistema contra incendios": checklist.si6_sistema_contra_incendios,
        "Refugios": checklist.si6_refugios,
        "Primeros auxilios": checklist.si6_primeros_auxilios,
        "Iluminación de emergencia": checklist.si6_iluminacion_emergencia,
        "Simulacros": checklist.si6_simulacros,
        "Control de acceso": checklist.si6_control_acceso,
    }


def obtener_items_si7(checklist) -> dict:
    """Devuelve un dict con los ítems de SI7 y su estado."""
    return {
        "Servicio médico": checklist.si7_servicio_medico,
        "Ambulancia": checklist.si7_ambulancia,
        "Consultorio dental": checklist.si7_consultorio_dental,
        "Apoyo psicológico": checklist.si7_apoyo_psicologico,
        "Gimnasio": checklist.si7_gimnasio,
        "Cancha deportiva": checklist.si7_cancha_deportiva,
        "Agua potable": checklist.si7_agua_potable,
        "Comedor": checklist.si7_comedor,
        "Lactario": checklist.si7_lactario,
        "Guardería": checklist.si7_guarderia,
    }


def obtener_items_si8(checklist) -> dict:
    """Devuelve un dict con los ítems de SI8 y su estado."""
    return {
        "Jardín botánico": checklist.si8_jardin_botanico,
        "Banco de semillas": checklist.si8_banco_semillas,
        "Invernadero": checklist.si8_invernadero,
        "Área de conservación": checklist.si8_area_conservacion,
        "Programa de reforestación": checklist.si8_programa_reforestacion,
        "Inventario de flora": checklist.si8_inventario_flora,
        "Inventario de fauna": checklist.si8_inventario_fauna,
        "Especies amenazadas": checklist.si8_especies_amenazadas,
        "Programa de reintroducción": checklist.si8_programa_reintroduccion,
        "Corredor biológico": checklist.si8_corredor_biologico,
        "Compostaje": checklist.si8_compostaje,
        "Agricultura orgánica": checklist.si8_agricultura_organica,
        "Investigación en biodiversidad": checklist.si8_investigacion_biodiversidad,
        "Educación ambiental": checklist.si8_educacion_ambiental,
    }


def obtener_resumen_checklist(checklist) -> dict:
    """
    Devuelve un resumen completo del checklist con:
    - nivel actual (1-5)
    - puntaje actual
    - items cumplidos / total
    - items faltantes
    """
    if not checklist:
        return {}

    def _resumen(items: dict, nivel: int, puntaje: float):
        cumplidos = [k for k, v in items.items() if v]
        faltantes = [k for k, v in items.items() if not v]
        return {
            "nivel": nivel,
            "puntaje": puntaje,
            "items_cumplidos": len(cumplidos),
            "items_totales": len(items),
            "items_faltantes": faltantes,
        }

    return {
        "SI5": _resumen(
            obtener_items_si5(checklist),
            calcular_nivel_si5_desde_checklist(checklist),
            calcular_si5(calcular_nivel_si5_desde_checklist(checklist)),
        ),
        "SI6": _resumen(
            obtener_items_si6(checklist),
            calcular_nivel_si6_desde_checklist(checklist),
            calcular_si6(calcular_nivel_si6_desde_checklist(checklist)),
        ),
        "SI7": _resumen(
            obtener_items_si7(checklist),
            calcular_nivel_si7_desde_checklist(checklist),
            calcular_si7(calcular_nivel_si7_desde_checklist(checklist)),
        ),
        "SI8": _resumen(
            obtener_items_si8(checklist),
            calcular_nivel_si8_desde_checklist(checklist),
            calcular_si8(calcular_nivel_si8_desde_checklist(checklist)),
        ),
    }


def calcular_items_necesarios_para_siguiente_nivel(indicador: str, nivel_actual: int) -> int:
    """
    Devuelve cuántos ítems más necesita para avanzar al siguiente nivel.
    """
    umbrales = {
        "SI5": [0, 1, 3, 6, 9],   # ítems necesarios para niveles 2,3,4,5
        "SI6": [0, 1, 4, 8, 11],
        "SI7": [0, 1, 3, 6, 9],
        "SI8": [0, 1, 4, 8, 12],
    }

    if indicador not in umbrales or nivel_actual >= 5:
        return 0

    siguiente_nivel = nivel_actual + 1
    idx = siguiente_nivel - 2  # niveles 2-5 → índices 0-3

    if idx < 0 or idx >= len(umbrales[indicador]):
        return 0

    return umbrales[indicador][idx]