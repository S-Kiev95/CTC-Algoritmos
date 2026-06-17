import type { Step } from "@/lib/types";
import type { ObjectState } from "@/components/python/ObjectView";

export const POO_CODE = `class Persona:
    def __init__(self, nombre, edad):   # constructor
        self.nombre = nombre
        self.edad = edad

    def saludar(self):
        print(f"Hola, soy {self.nombre}")

class Estudiante(Persona):              # hereda de Persona
    def __init__(self, nombre, edad, carrera):
        super().__init__(nombre, edad)  # reusa el constructor padre
        self.carrera = carrera

ana = Persona("Ana", 25)
ana.saludar()

juan = Estudiante("Juan", 20, "Ingenieria")
juan.saludar()                          # metodo heredado
`;

export function generatePooSteps(): Step<ObjectState>[] {
  const persona = { name: "Persona" };
  const estudiante = { name: "Estudiante", parent: "Persona" };

  const ana = {
    name: "ana",
    className: "Persona",
    attrs: [
      { k: "nombre", v: '"Ana"' },
      { k: "edad", v: "25" },
    ],
  };
  const juan = {
    name: "juan",
    className: "Estudiante",
    attrs: [
      { k: "nombre", v: '"Juan"' },
      { k: "edad", v: "20" },
      { k: "carrera", v: '"Ingenieria"' },
    ],
  };

  return [
    {
      state: { chain: [persona], output: [] },
      line: 1,
      note: "Se define la clase Persona, con su constructor __init__ y el método saludar.",
    },
    {
      state: { chain: [persona, estudiante], output: [] },
      line: 9,
      note: "Estudiante hereda de Persona: recibe sus métodos sin reescribirlos.",
    },
    {
      state: {
        chain: [persona, estudiante],
        instances: [{ ...ana, active: true }],
        output: [],
      },
      line: 14,
      note: "ana = Persona(...) crea una instancia; __init__ guarda nombre y edad en self.",
    },
    {
      state: {
        chain: [persona, estudiante],
        instances: [ana],
        output: ["Hola, soy Ana"],
      },
      line: 15,
      note: "ana.saludar() usa el método de su clase.",
    },
    {
      state: {
        chain: [persona, estudiante],
        instances: [ana, { ...juan, active: true }],
        output: ["Hola, soy Ana"],
      },
      line: 17,
      note: "juan es un Estudiante. super().__init__ setea nombre y edad (heredados) y agrega carrera.",
    },
    {
      state: {
        chain: [persona, estudiante],
        instances: [ana, juan],
        output: ["Hola, soy Ana", "Hola, soy Juan"],
      },
      line: 18,
      note: "Estudiante no define saludar: usa el heredado de Persona.",
    },
  ];
}
