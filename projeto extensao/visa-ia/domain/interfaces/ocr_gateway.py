from abc import ABC, abstractmethod

class OCRGateway(ABC):
    @abstractmethod
    def executar_ocr(self, arquivo_bytes: bytes) -> str:
        pass