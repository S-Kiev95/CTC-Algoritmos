"use client";

import {
  Database,
  Info,
  Download,
  HardDrive,
  ListChecks,
  Link2,
  Server,
} from "lucide-react";
import { LibraryDoc, Code, Mock } from "@/components/librerias/LibraryDoc";

export default function SqlModelPage() {
  return (
    <LibraryDoc
      icon={<Database className="h-5 w-5" />}
      title="SQLModel"
      subtitle={
        <>
          Trabajá con <strong>bases de datos SQL</strong> usando clases de Python.
          Combina <strong>Pydantic</strong> (validación) y{" "}
          <strong>SQLAlchemy</strong> (ORM), y es del mismo autor que FastAPI.
        </>
      }
      tabs={[
        { id: "que-es", label: "Qué es", icon: <Info className="h-3.5 w-3.5" />, content: <QueEs /> },
        { id: "modelo", label: "Instalación y modelo", icon: <Download className="h-3.5 w-3.5" />, content: <Modelo /> },
        { id: "engine", label: "Engine y tablas", icon: <HardDrive className="h-3.5 w-3.5" />, content: <Engine /> },
        { id: "crud", label: "CRUD con Session", icon: <ListChecks className="h-3.5 w-3.5" />, content: <Crud /> },
        { id: "relaciones", label: "Relaciones", icon: <Link2 className="h-3.5 w-3.5" />, content: <Relaciones /> },
        { id: "fastapi", label: "Con FastAPI", icon: <Server className="h-3.5 w-3.5" />, content: <ConFastApi /> },
      ]}
    />
  );
}

function QueEs() {
  return (
    <>
      <p>
        <strong>SQLModel</strong> te deja guardar y consultar datos en una base de
        datos SQL (SQLite, PostgreSQL, MySQL…) escribiendo <strong>clases de
        Python</strong>, sin escribir SQL a mano. Es un <em>ORM</em> (Object-Relational
        Mapping): cada fila de una tabla es un objeto Python.
      </p>
      <h2>Lo mejor de dos mundos</h2>
      <p>
        Está construido sobre <strong>SQLAlchemy</strong> (el ORM más usado de
        Python) y <strong>Pydantic</strong> (validación de datos). Por eso un mismo
        modelo te sirve para <strong>la tabla en la base</strong> y para{" "}
        <strong>validar datos</strong> — y encaja perfecto con FastAPI (mismo
        autor), evitando duplicar código.
      </p>
      <Mock>
        <p className="mb-2 font-mono text-xs text-zinc-500">tabla: hero</p>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="border-b border-zinc-300 py-1 pr-3 dark:border-zinc-700">id</th>
              <th className="border-b border-zinc-300 py-1 pr-3 dark:border-zinc-700">name</th>
              <th className="border-b border-zinc-300 py-1 dark:border-zinc-700">age</th>
            </tr>
          </thead>
          <tbody className="font-mono text-zinc-700 dark:text-zinc-300">
            <tr><td className="py-1 pr-3">1</td><td className="py-1 pr-3">Deadpond</td><td className="py-1">—</td></tr>
            <tr><td className="py-1 pr-3">2</td><td className="py-1 pr-3">Spider-Boy</td><td className="py-1">16</td></tr>
          </tbody>
        </table>
      </Mock>
    </>
  );
}

function Modelo() {
  return (
    <>
      <h2>Instalar</h2>
      <Code>{`pip install sqlmodel`}</Code>
      <h2>Definir un modelo (= una tabla)</h2>
      <p>
        Una clase que hereda de <code>SQLModel</code> con <code>table=True</code>{" "}
        es una tabla. Cada atributo es una columna; el tipo define la columna.{" "}
        <code>Field</code> agrega detalles como la clave primaria:
      </p>
      <Code>{`from sqlmodel import Field, SQLModel

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: int | None = None`}</Code>
      <p>
        <code>id</code> es la <strong>clave primaria</strong> y autoincremental
        (arranca en <code>None</code> y la base le asigna el número). Los campos
        con <code>| None = None</code> son opcionales.
      </p>
    </>
  );
}

function Engine() {
  return (
    <>
      <h2>El engine: la conexión a la base</h2>
      <p>
        El <code>engine</code> es el objeto que maneja la conexión. Se crea una vez
        para toda la app. La URL define el motor (acá, un archivo SQLite):
      </p>
      <Code>{`from sqlmodel import create_engine

engine = create_engine("sqlite:///database.db")
# Postgres seria: "postgresql://usuario:clave@host/basedatos"`}</Code>
      <h2>Crear las tablas</h2>
      <p>
        Una sola línea crea en la base todas las tablas de los modelos definidos:
      </p>
      <Code>{`SQLModel.metadata.create_all(engine)`}</Code>
    </>
  );
}

function Crud() {
  return (
    <>
      <p>
        Todo se hace dentro de una <strong>Session</strong> (una conversación con
        la base). El <code>engine</code> es uno solo; la <code>Session</code> es de
        usar y tirar por operación.
      </p>
      <h2>Crear (INSERT)</h2>
      <Code>{`from sqlmodel import Session

hero = Hero(name="Deadpond", secret_name="Dive Wilson")

with Session(engine) as session:
    session.add(hero)
    session.commit()       # guarda en la base
    session.refresh(hero)  # trae el id asignado
    print(hero.id)`}</Code>

      <h2>Leer (SELECT)</h2>
      <p>
        Se arma la consulta con <code>select()</code> y se ejecuta con{" "}
        <code>session.exec()</code>. <code>.all()</code> trae una lista;{" "}
        <code>.first()</code> el primero (o <code>None</code>):
      </p>
      <Code>{`from sqlmodel import select

with Session(engine) as session:
    todos = session.exec(select(Hero)).all()

    mayores = session.exec(
        select(Hero).where(Hero.age > 30)
    ).all()

    uno = session.exec(
        select(Hero).where(Hero.name == "Deadpond")
    ).first()`}</Code>

      <h2>Actualizar y borrar</h2>
      <Code>{`with Session(engine) as session:
    hero = session.exec(
        select(Hero).where(Hero.name == "Spider-Boy")
    ).first()

    hero.age = 17          # modificar
    session.add(hero)
    session.commit()

    session.delete(hero)   # borrar
    session.commit()`}</Code>
    </>
  );
}

function Relaciones() {
  return (
    <>
      <h2>Relacionar tablas</h2>
      <p>
        Para conectar dos tablas se usa una <strong>clave foránea</strong>{" "}
        (<code>foreign_key</code>) y, para navegar la relación cómodamente desde
        Python, <code>Relationship</code>:
      </p>
      <Code>{`from sqlmodel import Field, SQLModel, Relationship

class Team(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    heroes: list["Hero"] = Relationship(back_populates="team")

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    team_id: int | None = Field(default=None, foreign_key="team.id")
    team: Team | None = Relationship(back_populates="heroes")`}</Code>
      <p>
        Con eso, <code>hero.team</code> te da el equipo del héroe, y{" "}
        <code>team.heroes</code> la lista de héroes del equipo — sin escribir el
        JOIN a mano.
      </p>
    </>
  );
}

function ConFastApi() {
  return (
    <>
      <p>
        Como los dos son del mismo autor, encajan naturalmente: el modelo de
        SQLModel sirve de <strong>tabla</strong> y de <strong>modelo de
        request/response</strong> de FastAPI.
      </p>
      <h2>La session como dependencia</h2>
      <p>
        Lo habitual es proveer la <code>Session</code> con <code>Depends</code>, así
        cada request tiene la suya y se cierra sola:
      </p>
      <Code>{`from fastapi import FastAPI, Depends
from sqlmodel import Session, select

app = FastAPI()

def get_session():
    with Session(engine) as session:
        yield session

@app.post("/heroes")
def crear(hero: Hero, session: Session = Depends(get_session)):
    session.add(hero)
    session.commit()
    session.refresh(hero)
    return hero

@app.get("/heroes")
def listar(session: Session = Depends(get_session)):
    return session.exec(select(Hero)).all()`}</Code>
      <p>
        <strong>Tip:</strong> en proyectos serios se separan modelos para crear
        (<code>HeroCreate</code>), leer (<code>HeroRead</code>) y la tabla
        (<code>Hero</code>), para controlar qué campos entran y salen. La doc oficial
        lo explica paso a paso.
      </p>
    </>
  );
}
