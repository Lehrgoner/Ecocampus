from app.schemas.campus import CampusBase, CampusCreate, CampusUpdate, CampusResponse
from app.schemas.zona_verde import ZonaVerdeBase, ZonaVerdeCreate, ZonaVerdeUpdate, ZonaVerdeResponse, ZonaVerdeListResponse
from app.schemas.checklist import ChecklistBase, ChecklistCreate, ChecklistUpdate, ChecklistResponse
from app.schemas.simulacion import SimulacionRequest, SimulacionResponse
from app.schemas.indicadores import IndicadorSI, IndicadoresResponse
from app.schemas.perfil_sostenibilidad import PerfilSostenibilidadBase, PerfilSostenibilidadUpdate, PerfilSostenibilidadResponse
from app.schemas.auth import (
    RegistroRequest,
    LoginRequest,
    TokenResponse,
    UsuarioActualResponse,
)