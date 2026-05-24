from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Documento:
    id: Optional[int]
    tipo: str  # Ex: "Contrato Social", "Alvará"
    conteudo_extraido: str
    status_validacao: str  # "Pendente", "Conforme", "Divergente"
    data_upload: datetime