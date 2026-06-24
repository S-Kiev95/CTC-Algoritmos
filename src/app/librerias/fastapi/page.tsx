"use client";

import {
  Server,
  Info,
  Download,
  Route,
  Braces,
  Layers,
  BookOpenCheck,
} from "lucide-react";
import { LibraryDoc, Code, Mock } from "@/components/librerias/LibraryDoc";

export default function FastApiPage() {
  return (
    <LibraryDoc
      icon={<Server className="h-5 w-5" />}
      title="FastAPI"
      subtitle={
        <>
          Un framework moderno para construir <strong>APIs web</strong> con Python,
          rapidísimo, con validación por <strong>type hints</strong> y{" "}
          <strong>documentación interactiva automática</strong>.
        </>
      }
      tabs={[
        { id: "que-es", label: "Qué es", icon: <Info className="h-3.5 w-3.5" />, content: <QueEs /> },
        { id: "instalacion", label: "Instalación", icon: <Download className="h-3.5 w-3.5" />, content: <Instalacion /> },
        { id: "rutas", label: "Rutas y parámetros", icon: <Route className="h-3.5 w-3.5" />, content: <Rutas /> },
        { id: "modelos", label: "Modelos (Pydantic)", icon: <Braces className="h-3.5 w-3.5" />, content: <Modelos /> },
        { id: "mas", label: "Errores, deps y routers", icon: <Layers className="h-3.5 w-3.5" />, content: <Mas /> },
        { id: "docs", label: "Docs y deploy", icon: <BookOpenCheck className="h-3.5 w-3.5" />, content: <Docs /> },
      ]}
    />
  );
}

function QueEs() {
  return (
    <>
      <p>
        <strong>FastAPI</strong> es un framework de Python para construir{" "}
        <strong>APIs</strong> (servicios web que devuelven datos, normalmente
        JSON). Su gran idea: usás los <strong>type hints</strong> de Python y, a
        partir de ellos, FastAPI <strong>valida los datos</strong>, los convierte,
        y <strong>genera la documentación</strong> solo.
      </p>
      <h2>Sobre qué está construido</h2>
      <p>
        Se apoya en dos librerías muy sólidas: <strong>Starlette</strong> (toda la
        parte web/async) y <strong>Pydantic</strong> (la validación y
        serialización de datos). Por eso es de los frameworks más rápidos de
        Python, comparable a Node.js o Go.
      </p>
      <h2>Lo que lo hace especial</h2>
      <ul className="ml-5 list-disc space-y-1">
        <li>
          <strong>Validación automática</strong>: si un campo tiene que ser{" "}
          <code>int</code> y llega un texto, FastAPI responde un error claro (422)
          sin que escribas una línea.
        </li>
        <li>
          <strong>Docs interactivas</strong>: genera una página en <code>/docs</code>{" "}
          donde podés probar tu API desde el navegador.
        </li>
        <li>
          <strong>async</strong>: soporta <code>async def</code> para manejar
          muchas conexiones a la vez.
        </li>
      </ul>
    </>
  );
}

function Instalacion() {
  return (
    <>
      <h2>Instalar</h2>
      <p>
        Con <code>[standard]</code> trae todo lo recomendado (incluido el servidor
        y la CLI). Las comillas son importantes:
      </p>
      <Code>{`pip install "fastapi[standard]"`}</Code>
      <h2>Tu primera API</h2>
      <p>
        Creá <code>main.py</code>:
      </p>
      <Code>{`from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def inicio():
    return {"mensaje": "Hola, mundo"}`}</Code>
      <h2>Correr el servidor</h2>
      <Code>{`fastapi dev main.py`}</Code>
      <p>
        Arranca en <code>http://127.0.0.1:8000</code> con recarga automática.
        Abrís esa URL y ves el JSON; y en{" "}
        <code>http://127.0.0.1:8000/docs</code> tenés la documentación
        interactiva ya funcionando.
      </p>
    </>
  );
}

function Rutas() {
  return (
    <>
      <h2>Operaciones de ruta</h2>
      <p>
        Cada función decorada es un <em>endpoint</em>. El decorador dice el método
        HTTP y la ruta:
      </p>
      <Code>{`@app.get("/items")       # leer
@app.post("/items")      # crear
@app.put("/items/{id}")  # actualizar
@app.delete("/items/{id}") # borrar`}</Code>

      <h2>Parámetros de ruta (path)</h2>
      <p>
        Van entre llaves en la URL y se reciben como argumento. El{" "}
        <strong>type hint valida y convierte</strong>:
      </p>
      <Code>{`@app.get("/items/{item_id}")
def leer_item(item_id: int):
    return {"item_id": item_id}
# GET /items/5  -> item_id es el entero 5
# GET /items/abc -> error 422 automatico`}</Code>

      <h2>Parámetros de query</h2>
      <p>
        Los argumentos de la función que <em>no</em> están en la ruta se toman de
        la query string (<code>?clave=valor</code>). Con valor por defecto son
        opcionales:
      </p>
      <Code>{`@app.get("/items")
def listar(q: str | None = None, limite: int = 10):
    return {"q": q, "limite": limite}
# GET /items?q=lapiz&limite=5`}</Code>
    </>
  );
}

function Modelos() {
  return (
    <>
      <h2>Modelos con Pydantic</h2>
      <p>
        Para recibir datos en el <strong>cuerpo</strong> (body) de un POST/PUT,
        definís un modelo heredando de <code>BaseModel</code>. FastAPI lo usa para
        validar el JSON entrante:
      </p>
      <Code>{`from pydantic import BaseModel

class Producto(BaseModel):
    nombre: str
    precio: float
    stock: int = 0          # opcional, default 0

@app.post("/productos")
def crear(producto: Producto):
    return {"creado": producto.nombre, "precio": producto.precio}`}</Code>
      <p>
        Si el JSON no cumple (falta <code>nombre</code>, o <code>precio</code> no
        es número), FastAPI responde un 422 con el detalle del error. Y en{" "}
        <code>/docs</code> aparece el formulario con los campos correctos.
      </p>

      <h2>response_model: validar y filtrar la salida</h2>
      <p>
        Podés declarar qué forma tiene la respuesta. Sirve para documentar y para{" "}
        <strong>no filtrar campos de más</strong> (ej. una contraseña):
      </p>
      <Code>{`@app.get("/productos", response_model=list[Producto])
def listar():
    return obtener_productos()   # se valida/serializa segun Producto`}</Code>
    </>
  );
}

function Mas() {
  return (
    <>
      <h2>Errores con códigos HTTP</h2>
      <Code>{`from fastapi import HTTPException

@app.get("/productos/{id}")
def obtener(id: int):
    p = buscar(id)
    if p is None:
        raise HTTPException(status_code=404, detail="No encontrado")
    return p`}</Code>

      <h2>Dependencias (Depends)</h2>
      <p>
        La <em>inyección de dependencias</em> permite reusar lógica (autenticación,
        conexión a la base, parámetros comunes) sin repetirla:
      </p>
      <Code>{`from fastapi import Depends

def paginacion(pagina: int = 1, tam: int = 20):
    return {"pagina": pagina, "tam": tam}

@app.get("/items")
def listar(p: dict = Depends(paginacion)):
    return p   # FastAPI ejecuta paginacion() y te pasa el resultado`}</Code>

      <h2>Organizar con routers</h2>
      <p>
        En apps grandes se separan los endpoints en módulos con{" "}
        <code>APIRouter</code> y se incluyen en la app principal:
      </p>
      <Code>{`# usuarios.py
from fastapi import APIRouter
router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.get("/")
def listar(): ...

# main.py
app.include_router(router)`}</Code>

      <h2>CORS (para que un frontend lo consuma)</h2>
      <Code>{`from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)`}</Code>
    </>
  );
}

function Docs() {
  return (
    <>
      <h2>Documentación automática</h2>
      <p>
        Sin escribir nada extra, FastAPI te da dos páginas de documentación
        generadas desde tu código (y el esquema OpenAPI):
      </p>
      <ul className="ml-5 list-disc space-y-1">
        <li>
          <code>/docs</code> — <strong>Swagger UI</strong>: interactiva, podés{" "}
          <em>probar</em> cada endpoint desde el navegador.
        </li>
        <li>
          <code>/redoc</code> — <strong>ReDoc</strong>: una versión más de lectura.
        </li>
        <li>
          <code>/openapi.json</code> — el esquema <strong>OpenAPI</strong> crudo
          (sirve para generar clientes, tests, etc.).
        </li>
      </ul>
      <Mock>
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center gap-2 rounded border border-sky-300 bg-sky-50 px-2 py-1.5 dark:border-sky-800 dark:bg-sky-950/40">
            <span className="rounded bg-sky-600 px-1.5 py-0.5 font-semibold text-white">GET</span>
            <span className="text-zinc-700 dark:text-zinc-300">/productos</span>
            <span className="ml-auto text-zinc-400">Listar</span>
          </div>
          <div className="flex items-center gap-2 rounded border border-emerald-300 bg-emerald-50 px-2 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/40">
            <span className="rounded bg-emerald-600 px-1.5 py-0.5 font-semibold text-white">POST</span>
            <span className="text-zinc-700 dark:text-zinc-300">/productos</span>
            <span className="ml-auto text-zinc-400">Crear</span>
          </div>
          <div className="flex items-center gap-2 rounded border border-rose-300 bg-rose-50 px-2 py-1.5 dark:border-rose-800 dark:bg-rose-950/40">
            <span className="rounded bg-rose-600 px-1.5 py-0.5 font-semibold text-white">DEL</span>
            <span className="text-zinc-700 dark:text-zinc-300">/productos/{`{id}`}</span>
            <span className="ml-auto text-zinc-400">Borrar</span>
          </div>
        </div>
      </Mock>

      <h2>Publicar (deploy)</h2>
      <p>
        Para producción se usa <code>fastapi run</code> (sin recarga, optimizado),
        o el servidor <code>uvicorn</code> directamente. Lo más común es
        empaquetarlo en un <strong>contenedor Docker</strong> y subirlo a un
        servicio (Railway, Render, Fly.io, un VPS, etc.).
      </p>
      <Code>{`fastapi run main.py   # produccion`}</Code>
    </>
  );
}
