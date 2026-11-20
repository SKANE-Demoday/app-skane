
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from calculos import calcular_autonomia
from diagnosticos import interpretar_codigo

app = FastAPI(title="SKANE API")

# Permitir comunicação com o aplicativo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Somente desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"mensagem": "API Skane funcionando!"}


@app.post("/combustivel")
def combustivel(dados: dict):

    resultado = calcular_autonomia(
        dados["litros"],
        dados["consumo"]
    )

    return resultado


@app.get("/diagnostico/{codigo}")
def diagnostico(codigo: str):

    resultado = interpretar_codigo(codigo)

    return resultado
