"use client";

import {
  LayoutDashboard,
  Info,
  Download,
  Component,
  Columns3,
  Files,
  Rocket,
} from "lucide-react";
import { LibraryDoc, Code, Mock } from "@/components/librerias/LibraryDoc";

export default function StreamlitPage() {
  return (
    <LibraryDoc
      icon={<LayoutDashboard className="h-5 w-5" />}
      title="Streamlit"
      subtitle={
        <>
          Construí <strong>interfaces gráficas y dashboards</strong> con{" "}
          <strong>solo Python</strong>, sin escribir HTML, CSS ni JavaScript.
        </>
      }
      tabs={[
        { id: "que-es", label: "Qué es", icon: <Info className="h-3.5 w-3.5" />, content: <QueEs /> },
        { id: "instalacion", label: "Instalación", icon: <Download className="h-3.5 w-3.5" />, content: <Instalacion /> },
        { id: "componentes", label: "Componentes", icon: <Component className="h-3.5 w-3.5" />, content: <Componentes /> },
        { id: "layout", label: "Layout y estado", icon: <Columns3 className="h-3.5 w-3.5" />, content: <Layout /> },
        { id: "multipagina", label: "Multipágina", icon: <Files className="h-3.5 w-3.5" />, content: <Multipagina /> },
        { id: "mas", label: "Más / deploy", icon: <Rocket className="h-3.5 w-3.5" />, content: <Mas /> },
      ]}
    />
  );
}

function QueEs() {
  return (
    <>
      <p>
        <strong>Streamlit</strong> es una librería de Python para crear{" "}
        <strong>aplicaciones web interactivas</strong> (dashboards, herramientas
        de datos, demos de modelos) escribiendo únicamente Python. No necesitás
        saber HTML, CSS ni JavaScript: cada widget es una función de Python.
      </p>
      <h2>El modelo mental: el script se re-ejecuta</h2>
      <p>
        La clave para entender Streamlit: <strong>cada vez que el usuario
        interactúa</strong> con un widget (mueve un slider, aprieta un botón…),
        Streamlit <strong>vuelve a ejecutar tu script de arriba a abajo</strong>.
        Los widgets <em>devuelven su valor actual</em>, y vos usás ese valor para
        decidir qué mostrar.
      </p>
      <Code>{`import streamlit as st

nombre = st.text_input("¿Cómo te llamás?")
if nombre:
    st.write(f"¡Hola, {nombre}!")`}</Code>
      <p>
        No hay &quot;callbacks&quot; ni manejo de eventos como en otros frameworks:
        escribís el código como un script normal y Streamlit se encarga del resto.
      </p>
      <h2>¿Para qué sirve en el curso?</h2>
      <p>
        Es ideal para que armes <strong>visualizaciones interactivas</strong> de
        los algoritmos, calculadoras, o para que los estudiantes presenten un
        proyecto con interfaz sin pelearse con la web.
      </p>
    </>
  );
}

function Instalacion() {
  return (
    <>
      <h2>Instalar</h2>
      <p>Con pip, dentro de tu entorno virtual:</p>
      <Code>{`pip install streamlit`}</Code>
      <p>Para ver una demo con todo lo que puede hacer:</p>
      <Code>{`streamlit hello`}</Code>
      <h2>Tu primer app</h2>
      <p>
        Creá un archivo <code>app.py</code>:
      </p>
      <Code>{`import streamlit as st

st.title("Mi primera app")
st.write("¡Funciona! 🎈")

edad = st.slider("Tu edad", 0, 100, 25)
st.write("Tenés", edad, "años")`}</Code>
      <p>Y corré:</p>
      <Code>{`streamlit run app.py`}</Code>
      <p>
        Se abre en el navegador en <code>http://localhost:8501</code>. Cada vez
        que guardás el archivo, Streamlit ofrece recargar — desarrollo en vivo.
      </p>
    </>
  );
}

function Componentes() {
  return (
    <>
      <h2>Texto</h2>
      <Code>{`st.title("Título grande")
st.header("Encabezado")
st.subheader("Subencabezado")
st.write("write() muestra casi cualquier cosa: texto, números, DataFrames…")
st.markdown("**Markdown** con *formato* y \`código\`")
st.code("print('hola')", language="python")`}</Code>

      <h2>Entradas (widgets)</h2>
      <p>Cada widget devuelve su valor actual:</p>
      <Code>{`texto   = st.text_input("Nombre")
numero  = st.number_input("Cantidad", min_value=0)
edad    = st.slider("Edad", 0, 100, 25)
opcion  = st.selectbox("Elegí", ["A", "B", "C"])
varios  = st.multiselect("Varias", ["rojo", "verde", "azul"])
acepta  = st.checkbox("Acepto")
if st.button("Enviar"):
    st.success("¡Enviado!")
archivo = st.file_uploader("Subí un CSV", type="csv")`}</Code>
      <Mock>
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-xs text-zinc-500">Nombre</p>
            <div className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950">
              escribí acá…
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-zinc-500">Edad — 25</p>
            <div className="relative h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div className="absolute left-0 top-0 h-1.5 w-1/4 rounded-full bg-rose-500" />
              <div className="absolute left-1/4 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose-500 bg-white" />
            </div>
          </div>
          <button className="w-fit rounded-md border border-zinc-300 bg-white px-4 py-1.5 text-sm font-medium text-zinc-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100">
            Enviar
          </button>
        </div>
      </Mock>

      <h2>Datos y gráficos</h2>
      <Code>{`import pandas as pd
df = pd.DataFrame({"x": [1,2,3], "y": [10,5,20]})

st.dataframe(df)            # tabla interactiva
st.metric("Ventas", "1.2K", "+12%")
st.line_chart(df, x="x", y="y")
st.bar_chart(df, x="x", y="y")`}</Code>
      <Mock>
        <div className="flex flex-wrap gap-4">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs text-zinc-500">Ventas</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">1.2K</p>
            <p className="text-xs font-medium text-emerald-600">▲ +12%</p>
          </div>
          <div className="flex items-end gap-1.5 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            {[10, 5, 20, 14, 8].map((h, i) => (
              <div key={i} className="w-4 rounded-t bg-rose-400" style={{ height: h * 3 }} />
            ))}
          </div>
        </div>
      </Mock>
    </>
  );
}

function Layout() {
  return (
    <>
      <h2>Barra lateral</h2>
      <Code>{`st.sidebar.title("Opciones")
filtro = st.sidebar.selectbox("Filtro", ["Todos", "Activos"])
# o con bloque:
with st.sidebar:
    st.write("Acá van los controles")`}</Code>

      <h2>Columnas, tabs y expander</h2>
      <Code>{`col1, col2 = st.columns(2)
col1.metric("Hoy", "120")
col2.metric("Ayer", "98")

tab1, tab2 = st.tabs(["Gráfico", "Datos"])
with tab1:
    st.line_chart(df)
with tab2:
    st.dataframe(df)

with st.expander("Ver detalles"):
    st.write("Contenido oculto hasta que lo abrís")`}</Code>

      <h2>Formularios</h2>
      <p>
        Un <code>st.form</code> agrupa widgets y solo se envía al apretar el botón
        (no re-ejecuta en cada tecla):
      </p>
      <Code>{`with st.form("mi_form"):
    nombre = st.text_input("Nombre")
    enviar = st.form_submit_button("Guardar")
if enviar:
    st.write("Guardado:", nombre)`}</Code>

      <h2>Estado entre re-ejecuciones: session_state</h2>
      <p>
        Como el script se re-ejecuta entero, las variables normales se pierden.
        Para <strong>recordar</strong> cosas entre interacciones se usa{" "}
        <code>st.session_state</code>:
      </p>
      <Code>{`if "contador" not in st.session_state:
    st.session_state.contador = 0

if st.button("Sumar"):
    st.session_state.contador += 1

st.write("Contador:", st.session_state.contador)`}</Code>

      <h2>Caché (no recalcular de más)</h2>
      <p>
        Para que una función pesada no se ejecute en cada re-run, se cachea su
        resultado:
      </p>
      <Code>{`@st.cache_data
def cargar_datos(ruta):
    return pd.read_csv(ruta)   # se ejecuta una sola vez por argumento`}</Code>
    </>
  );
}

function Multipagina() {
  return (
    <>
      <h2>Opción 1: carpeta pages/</h2>
      <p>
        La forma más simple. El archivo principal es la página de inicio, y cada{" "}
        <code>.py</code> dentro de una carpeta <code>pages/</code> aparece
        automáticamente en el menú lateral. El prefijo numérico ordena.
      </p>
      <Code>{`mi_app/
├── inicio.py          # página principal
└── pages/
    ├── 1_Datos.py
    ├── 2_Graficos.py
    └── 3_Acerca.py`}</Code>
      <p>
        Corrés <code>streamlit run inicio.py</code> y Streamlit arma la
        navegación solo.
      </p>

      <h2>Opción 2: st.navigation (más control)</h2>
      <p>
        La API nueva permite definir las páginas y la navegación a mano, con
        títulos e iconos:
      </p>
      <Code>{`inicio = st.Page("inicio.py", title="Inicio", icon="🏠")
datos  = st.Page("paginas/datos.py", title="Datos", icon="📊")

nav = st.navigation([inicio, datos])
nav.run()`}</Code>

      <h2>Links entre páginas</h2>
      <Code>{`st.page_link("pages/2_Graficos.py", label="Ir a gráficos", icon="📈")
# o saltar por código:
st.switch_page("pages/2_Graficos.py")`}</Code>
    </>
  );
}

function Mas() {
  return (
    <>
      <h2>Feedback al usuario</h2>
      <Code>{`st.success("¡Listo!")
st.warning("Cuidado")
st.error("Algo falló")
st.info("Dato útil")
st.toast("Guardado ✅")

with st.spinner("Procesando…"):
    resultado = tarea_lenta()

barra = st.progress(0)
for i in range(100):
    barra.progress(i + 1)`}</Code>

      <h2>Chatbots (bonus)</h2>
      <p>
        Streamlit trae componentes para armar interfaces de chat en pocas líneas
        — útil para demos con modelos de lenguaje:
      </p>
      <Code>{`mensaje = st.chat_input("Escribí algo…")
if mensaje:
    with st.chat_message("user"):
        st.write(mensaje)
    with st.chat_message("assistant"):
        st.write("Respuesta del bot")`}</Code>

      <h2>Control de flujo</h2>
      <Code>{`st.rerun()   # re-ejecuta el script ya
st.stop()    # corta la ejecución acá`}</Code>

      <h2>Publicar gratis</h2>
      <p>
        Subís tu código a un repo de GitHub (con un <code>requirements.txt</code>)
        y lo deployás gratis en <strong>Streamlit Community Cloud</strong>{" "}
        (share.streamlit.io): conectás el repo, elegís el archivo principal, y te
        queda una URL pública. Cada push actualiza la app.
      </p>
    </>
  );
}
