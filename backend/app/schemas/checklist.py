from pydantic import BaseModel
from typing import Optional

class ChecklistBase(BaseModel):
    """Todos los ítems del checklist SI 5-8"""
    # SI 5 - Discapacidad y maternidad (10 ítems)
    si5_rampas: bool = False
    si5_banos_accesibles: bool = False
    si5_pasamanos: bool = False
    si5_ascensores: bool = False
    si5_senializacion: bool = False
    si5_rutas_accesibles: bool = False
    si5_estacionamiento: bool = False
    si5_sala_lactancia: bool = False
    si5_cambiadores: bool = False
    si5_apoyos_visuales: bool = False

    # SI 6 - Seguridad (13 ítems)
    si6_extintores: bool = False
    si6_alarmas: bool = False
    si6_cctv: bool = False
    si6_personal_seguridad: bool = False
    si6_botones_panico: bool = False
    si6_app_emergencia: bool = False
    si6_salidas_emergencia: bool = False
    si6_sistema_contra_incendios: bool = False
    si6_refugios: bool = False
    si6_primeros_auxilios: bool = False
    si6_iluminacion_emergencia: bool = False
    si6_simulacros: bool = False
    si6_control_acceso: bool = False

    # SI 7 - Salud (10 ítems)
    si7_servicio_medico: bool = False
    si7_ambulancia: bool = False
    si7_consultorio_dental: bool = False
    si7_apoyo_psicologico: bool = False
    si7_gimnasio: bool = False
    si7_cancha_deportiva: bool = False
    si7_agua_potable: bool = False
    si7_comedor: bool = False
    si7_lactario: bool = False
    si7_guarderia: bool = False

    # SI 8 - Conservación (14 ítems)
    si8_jardin_botanico: bool = False
    si8_banco_semillas: bool = False
    si8_invernadero: bool = False
    si8_area_conservacion: bool = False
    si8_programa_reforestacion: bool = False
    si8_inventario_flora: bool = False
    si8_inventario_fauna: bool = False
    si8_especies_amenazadas: bool = False
    si8_programa_reintroduccion: bool = False
    si8_corredor_biologico: bool = False
    si8_compostaje: bool = False
    si8_agricultura_organica: bool = False
    si8_investigacion_biodiversidad: bool = False
    si8_educacion_ambiental: bool = False

class ChecklistCreate(ChecklistBase):
    """Schema para crear un registro de checklist"""
    pass

class ChecklistUpdate(BaseModel):
    """Schema para actualizar ítems específicos"""
    pass  # Todos los campos son opcionales, heredamos los defaults

class ChecklistResponse(ChecklistBase):
    """Schema para la respuesta del checklist"""
    id: int

    class Config:
        from_attributes = True