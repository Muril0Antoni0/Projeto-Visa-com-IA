from transformers import pipeline

class BertIAService:
    def __init__(self):
        # Carrega o modelo BERT em Português
        # Aviso: Na primeira execução, ele vai baixar cerca de 400MB de modelo
        print("Carregando modelo de IA (BERT-PT)... aguarde.")
        self.pipeline = pipeline("text-classification", model="neuralmind/bert-base-portuguese-cased")

    def analisar_conformidade(self, texto: str):
        # Limitamos o texto para 512 caracteres (limite do BERT)
        resultado = self.pipeline(texto[:512])
        return {
            "score": resultado[0]['score'],
            "label": resultado[0]['label']
        }