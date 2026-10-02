from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field

from app.services.predictor_ranking import predecir_ranking
from app.models.usuario import Usuario
from app.api.deps import get_current_user

router = APIRouter(prefix="/ranking", tags=["Ranking"])


class RankingRequest(BaseModel):
    SI: float = Field(..., ge=0, le=1100)
    EC: float = Field(..., ge=0, le=2000)
    WS: float = Field(..., ge=0, le=1700)
    WR: float = Field(..., ge=0, le=1100)
    TR: float = Field(..., ge=0, le=1700)
    ED: float = Field(..., ge=0, le=1300)


class RankingResponse(BaseModel):
    ranking_estimado: int
    puntaje_total: float
    mensaje: str


@router.post("/predecir", response_model=RankingResponse)
def predecir_ranking_endpoint(
    ranking_data: RankingRequest,
    usuario: Usuario = Depends(get_current_user),
):
    """
    Predice la posición en el ranking global.
    Requiere autenticación (cualquier rol).
    """
    try:
        puntajes = ranking_data.model_dump()
        ranking_estimado = predecir_ranking(puntajes)
        puntaje_total = sum(puntajes.values())
        
        return RankingResponse(
            ranking_estimado=ranking_estimado,
            puntaje_total=puntaje_total,
            mensaje=f"Con un puntaje total de {puntaje_total:.0f} puntos, "
                    f"la universidad estaría aproximadamente en la posición #{ranking_estimado}.",
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")