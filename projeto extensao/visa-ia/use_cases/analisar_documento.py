from domain.entities.documento import Documento
from domain.interfaces.ocr_gateway import OCRGateway
from datetime import datetime


class AnalisarDocumentoUseCase:
    def __init__(self, ocr_gateway, ia_service):
        self.ocr_gateway = ocr_gateway
        self.ia_service = ia_service

    def executar(self, arquivo_bytes: bytes, nome_arquivo: str):  # Adicione o nome_arquivo aqui
        # Repasse o nome do arquivo para o gateway
        texto = self.ocr_gateway.executar_ocr(arquivo_bytes, nome_arquivo)

        # 2. Análise via IA (Hugging Face BERT-PT)
        # Aqui a IA verifica se o texto condiz com as normas da VISA
        resultado_ia = self.ia_service.analisar_conformidade(texto)

        return {
            "texto": texto,
            "status": "Conforme" if resultado_ia["score"] > 0.8 else "Divergente",
            "analise_detalhada": resultado_ia
        }
