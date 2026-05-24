import sys
from pathlib import Path

# Adiciona o diretório raiz (visa-ia) ao sys.path para os imports funcionarem
ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR))

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from adapters.gateways.tesseract_ocr_gateway import TesseractOCRGateway
from use_cases.analisar_documento import AnalisarDocumentoUseCase
from frameworks.ia.bert_ia_service import BertIAService

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"

app = FastAPI(title="VISA Digital")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# Inicializa a IA uma vez só (fora da rota) para não lentificar o upload
ia_service = BertIAService()


@app.get("/")
async def pagina_empresa():
    return FileResponse(FRONTEND_DIR / "portal_static.html")


@app.get("/servidor")
async def pagina_servidor_redirect():
    return RedirectResponse(url="/", status_code=302)


@app.get("/servidor.html")
async def pagina_servidor():
    return FileResponse(FRONTEND_DIR / "dashboard_static.html", media_type="text/html")


def _arquivo_frontend(nome: str, tipo: str):
    return FileResponse(FRONTEND_DIR / nome, media_type=tipo)


@app.get("/style.css")
async def css_principal():
    return _arquivo_frontend("style.css", "text/css")


@app.get("/main.js")
async def js_empresa():
    return _arquivo_frontend("main.js", "application/javascript")


@app.post("/documentos/analisar")
async def analisar_doc(file: UploadFile = File(...)):
    ocr_gtw = TesseractOCRGateway()

    # Agora passamos o serviço de IA real!
    use_case = AnalisarDocumentoUseCase(ocr_gtw, ia_service=ia_service)

    conteudo_arquivo = await file.read()
    resultado = use_case.executar(conteudo_arquivo, file.filename)

    return resultado

