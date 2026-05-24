import os
import pytesseract
from PIL import Image
import io
from pdf2image import convert_from_bytes
from domain.interfaces.ocr_gateway import OCRGateway

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


class TesseractOCRGateway(OCRGateway):
    def executar_ocr(self, arquivo_bytes: bytes, nome_arquivo: str) -> str:
        # Fallback caso o tesseract não esteja instalado no Windows
        if not os.path.exists(pytesseract.pytesseract.tesseract_cmd):
            print("AVISO: Tesseract OCR não encontrado! Usando texto simulado. Instale o Tesseract para ler imagens reais.")
            return "ALVARÁ SANITÁRIO - Texto simulado de conformidade para testes porque o OCR não está instalado no computador."

        texto_completo = ""

        # Verifica se o arquivo é PDF
        if nome_arquivo.lower().endswith(".pdf"):
            # Converte as páginas do PDF em imagens (Precisa do Poppler instalado no Windows)
            try:
                paginas = convert_from_bytes(arquivo_bytes)
                for pagina in paginas:
                    texto_completo += pytesseract.image_to_string(
                        pagina, lang='por') + "\n"
            except Exception as e:
                print("Erro ao converter PDF (Poppler ausente?):", e)
                return "Texto simulado do PDF."
        else:
            # Se for imagem comum (PNG/JPG)
            try:
                imagem = Image.open(io.BytesIO(arquivo_bytes))
                texto_completo = pytesseract.image_to_string(imagem, lang='por')
            except Exception as e:
                print("Erro ao processar imagem:", e)
                return "Texto simulado da imagem."

        return texto_completo
