"use client";

import {
  Gamepad2,
  Info,
  Download,
  Monitor,
  Keyboard,
  Shapes,
  Boxes,
  Image as ImageIcon,
  Volume2,
  ListChecks,
} from "lucide-react";
import { LibraryDoc, Code, Mock } from "@/components/librerias/LibraryDoc";

export default function PygamePage() {
  return (
    <LibraryDoc
      icon={<Gamepad2 className="h-5 w-5" />}
      title="Pygame"
      subtitle={
        <>
          Una librería para hacer <strong>videojuegos 2D</strong> (y multimedia) con
          Python: te da una <strong>ventana</strong>, dibujo de figuras e imágenes,{" "}
          <strong>sonido</strong> y manejo de <strong>teclado y mouse</strong>.
        </>
      }
      tabs={[
        { id: "que-es", label: "Qué es", icon: <Info className="h-3.5 w-3.5" />, content: <QueEs /> },
        { id: "instalacion", label: "Instalación", icon: <Download className="h-3.5 w-3.5" />, content: <Instalacion /> },
        { id: "estructura", label: "Estructura del juego", icon: <Monitor className="h-3.5 w-3.5" />, content: <Estructura /> },
        { id: "eventos", label: "Teclado y mouse", icon: <Keyboard className="h-3.5 w-3.5" />, content: <Eventos /> },
        { id: "figuras", label: "Figuras y movimiento", icon: <Shapes className="h-3.5 w-3.5" />, content: <Figuras /> },
        { id: "colisiones", label: "Colisiones", icon: <Boxes className="h-3.5 w-3.5" />, content: <Colisiones /> },
        { id: "imagenes", label: "Imágenes y sprites", icon: <ImageIcon className="h-3.5 w-3.5" />, content: <Imagenes /> },
        { id: "audio", label: "Audio", icon: <Volume2 className="h-3.5 w-3.5" />, content: <Audio /> },
        { id: "metodos", label: "Métodos clave", icon: <ListChecks className="h-3.5 w-3.5" />, content: <Metodos /> },
      ]}
    />
  );
}

function QueEs() {
  return (
    <>
      <p>
        <strong>Pygame</strong> es una librería de Python para crear{" "}
        <strong>videojuegos 2D</strong> y programas multimedia. Por debajo usa{" "}
        <strong>SDL</strong> (la misma base de muchos juegos comerciales), y te da
        herramientas simples para lo que todo juego necesita: abrir una ventana,
        dibujar, leer el teclado y el mouse, reproducir sonidos y controlar el
        tiempo.
      </p>
      <h2>La idea central: el bucle del juego</h2>
      <p>
        A diferencia de un programa normal que corre de arriba a abajo y termina, un
        juego vive dentro de un <strong>bucle infinito</strong> que se repite muchas
        veces por segundo (los <em>frames</em>). En cada vuelta el juego hace siempre
        lo mismo:
      </p>
      <ul className="ml-5 list-disc space-y-1">
        <li><strong>Escuchar eventos</strong> (¿se apretó una tecla? ¿se cerró la ventana?).</li>
        <li><strong>Actualizar el estado</strong> (mover personajes, detectar choques).</li>
        <li><strong>Dibujar</strong> todo de nuevo en la pantalla.</li>
      </ul>
      <p>
        Entender ese ciclo es entender el 90% de Pygame. Todo lo demás son piezas que
        se enchufan adentro.
      </p>
    </>
  );
}

function Instalacion() {
  return (
    <>
      <h2>Instalar</h2>
      <p>Necesitás Python 3. Desde la terminal:</p>
      <Code>{`pip install pygame`}</Code>
      <p>
        Para comprobar que quedó bien instalado, Pygame trae un ejemplo jugable
        incorporado:
      </p>
      <Code>{`python -m pygame.examples.aliens`}</Code>
      <h2>Importar y arrancar</h2>
      <p>
        En tu programa siempre empezás importando la librería e inicializándola. El{" "}
        <code>pygame.init()</code> prende todos los módulos internos (video, sonido,
        fuentes, etc.):
      </p>
      <Code>{`import pygame

pygame.init()
# ... acá va tu juego ...
pygame.quit()   # cerrar todo al terminar`}</Code>
    </>
  );
}

function Estructura() {
  return (
    <>
      <h2>El esqueleto de todo juego</h2>
      <p>
        Este es el programa mínimo que abre una ventana y se queda corriendo hasta
        que la cerrás. Casi cualquier juego que hagas es una versión más grande de
        esto:
      </p>
      <Code>{`import pygame

pygame.init()

# 1) La ventana (pantalla) de 800x600 pixeles
pantalla = pygame.display.set_mode((800, 600))
pygame.display.set_caption("Mi primer juego")

# 2) El reloj, para controlar los FPS
reloj = pygame.time.Clock()

corriendo = True
while corriendo:                          # 3) el bucle del juego
    # 3a) EVENTOS
    for evento in pygame.event.get():
        if evento.type == pygame.QUIT:    # click en la X de la ventana
            corriendo = False

    # 3b) ACTUALIZAR (logica del juego)
    # ... mover cosas, detectar colisiones ...

    # 3c) DIBUJAR
    pantalla.fill((30, 30, 40))           # pintar el fondo (borra el frame anterior)
    # ... dibujar figuras, imagenes ...
    pygame.display.flip()                 # mostrar lo dibujado

    # 3d) esperar para ir a 60 cuadros por segundo
    reloj.tick(60)

pygame.quit()`}</Code>

      <h2>Pieza por pieza</h2>
      <ul className="ml-5 list-disc space-y-2">
        <li>
          <code>set_mode((ancho, alto))</code> crea la ventana y devuelve la{" "}
          <strong>superficie de la pantalla</strong>: sobre ella dibujás todo.
        </li>
        <li>
          <code>set_caption(...)</code> pone el título de la ventana.
        </li>
        <li>
          <code>Clock()</code> + <code>reloj.tick(60)</code> hacen que el bucle no
          corra a mil por hora: limita a <strong>60 FPS</strong> para que el juego
          vaya parejo en cualquier computadora.
        </li>
        <li>
          <code>pygame.event.get()</code> devuelve la lista de cosas que pasaron
          desde el frame anterior. Siempre hay que atender <code>QUIT</code> o la
          ventana no se puede cerrar.
        </li>
        <li>
          <code>pantalla.fill(color)</code> repinta todo el fondo. Es lo que{" "}
          <strong>borra el cuadro anterior</strong>; sin esto, todo deja estela.
        </li>
        <li>
          <code>pygame.display.flip()</code> muestra en la ventana todo lo que
          dibujaste ese frame. (<code>display.update()</code> hace lo mismo y además
          permite actualizar solo una parte.)
        </li>
      </ul>

      <h2>Sobre las coordenadas y los colores</h2>
      <p>
        El origen <code>(0, 0)</code> está <strong>arriba a la izquierda</strong>. La{" "}
        <code>x</code> crece hacia la derecha y la <code>y</code> hacia{" "}
        <strong>abajo</strong>. Los colores son tuplas <code>(R, G, B)</code> de 0 a
        255 — por ejemplo <code>(255, 0, 0)</code> es rojo. (También se aceptan
        nombres como <code>&quot;red&quot;</code>.)
      </p>
    </>
  );
}

function Eventos() {
  return (
    <>
      <h2>Dos formas de leer el teclado</h2>
      <p>
        <strong>1) Eventos</strong> (algo que pasó <em>una vez</em>): ideal para
        &ldquo;saltar&rdquo;, &ldquo;disparar&rdquo;, abrir un menú. Se leen en el{" "}
        <code>for</code> de eventos:
      </p>
      <Code>{`for evento in pygame.event.get():
    if evento.type == pygame.QUIT:
        corriendo = False
    elif evento.type == pygame.KEYDOWN:      # se apreto una tecla
        if evento.key == pygame.K_SPACE:
            print("saltar!")
        elif evento.key == pygame.K_ESCAPE:
            corriendo = False
    elif evento.type == pygame.KEYUP:        # se solto una tecla
        print("solto", evento.key)`}</Code>

      <p>
        <strong>2) Estado de las teclas</strong> (¿está apretada <em>ahora</em>?):
        ideal para movimiento continuo. Se consulta cada frame, fuera del{" "}
        <code>for</code>:
      </p>
      <Code>{`teclas = pygame.key.get_pressed()
if teclas[pygame.K_LEFT]:
    x -= 5
if teclas[pygame.K_RIGHT]:
    x += 5
if teclas[pygame.K_UP]:
    y -= 5
if teclas[pygame.K_DOWN]:
    y += 5`}</Code>
      <p>
        Regla práctica: <strong>acciones puntuales → KEYDOWN</strong>;{" "}
        <strong>movimiento sostenido → get_pressed()</strong>.
      </p>

      <h2>El mouse</h2>
      <p>Posición y botones, como evento o como estado:</p>
      <Code>{`# Como evento
for evento in pygame.event.get():
    if evento.type == pygame.MOUSEBUTTONDOWN:
        print("click en", evento.pos)   # (x, y) del click
        if evento.button == 1:          # 1 izq, 2 medio, 3 der
            disparar(evento.pos)
    elif evento.type == pygame.MOUSEMOTION:
        print("mouse en", evento.pos)

# Como estado, cada frame
mx, my = pygame.mouse.get_pos()
izq, medio, der = pygame.mouse.get_pressed()`}</Code>
      <p>
        Las teclas se nombran con constantes <code>pygame.K_...</code>:{" "}
        <code>K_a</code> … <code>K_z</code>, <code>K_0</code> … <code>K_9</code>,{" "}
        <code>K_SPACE</code>, <code>K_RETURN</code>, <code>K_LSHIFT</code>,{" "}
        <code>K_LEFT/RIGHT/UP/DOWN</code>, etc.
      </p>
    </>
  );
}

function Figuras() {
  return (
    <>
      <h2>Dibujar figuras</h2>
      <p>
        Todo se dibuja <strong>sobre una superficie</strong> (normalmente{" "}
        <code>pantalla</code>) con el módulo <code>pygame.draw</code>:
      </p>
      <Code>{`ROJO = (220, 60, 60)
AZUL = (60, 120, 220)

# Rectangulo: (superficie, color, (x, y, ancho, alto))
pygame.draw.rect(pantalla, ROJO, (100, 80, 120, 60))

# Circulo: (superficie, color, (centro_x, centro_y), radio)
pygame.draw.circle(pantalla, AZUL, (400, 300), 40)

# Linea: (superficie, color, inicio, fin, grosor)
pygame.draw.line(pantalla, (255, 255, 255), (0, 0), (800, 600), 3)

# Contorno: un 5to parametro grosor dibuja solo el borde
pygame.draw.rect(pantalla, AZUL, (100, 80, 120, 60), 2)`}</Code>

      <Mock>
        <div className="relative h-32 w-full overflow-hidden rounded-md bg-zinc-800">
          <div className="absolute left-6 top-5 h-12 w-20 rounded-sm bg-rose-500" />
          <div className="absolute right-10 top-8 h-16 w-16 rounded-full bg-sky-500" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, transparent 49.6%, rgba(255,255,255,.35) 49.6%, rgba(255,255,255,.35) 50.4%, transparent 50.4%)" }} />
        </div>
      </Mock>

      <h2>Rect: la caja de todo objeto</h2>
      <p>
        Un <code>pygame.Rect(x, y, ancho, alto)</code> guarda la posición y el tamaño
        de algo. Es la pieza clave para <strong>mover</strong> y para{" "}
        <strong>detectar choques</strong>. Tiene atributos muy cómodos:
      </p>
      <Code>{`jugador = pygame.Rect(100, 100, 40, 40)

jugador.x += 5                 # mover a mano
jugador.move_ip(5, 0)          # mover "in place" (dx, dy)
jugador.center = (400, 300)    # centrar
jugador.topleft, jugador.right, jugador.bottom  # esquinas/bordes

pygame.draw.rect(pantalla, ROJO, jugador)   # se puede dibujar directo`}</Code>

      <h2>Mover y no salirse de la pantalla</h2>
      <p>
        Movés cambiando la posición cada frame según una <strong>velocidad</strong>.
        Para que no se escape, <code>clamp_ip</code> lo mantiene adentro de la
        ventana:
      </p>
      <Code>{`velocidad = 5
teclas = pygame.key.get_pressed()
if teclas[pygame.K_LEFT]:  jugador.x -= velocidad
if teclas[pygame.K_RIGHT]: jugador.x += velocidad
if teclas[pygame.K_UP]:    jugador.y -= velocidad
if teclas[pygame.K_DOWN]:  jugador.y += velocidad

jugador.clamp_ip(pantalla.get_rect())   # que no salga de la ventana`}</Code>

      <h2>Movimiento parejo con delta time (opcional)</h2>
      <p>
        Si querés que la velocidad sea igual aunque los FPS varíen, multiplicá por el{" "}
        <strong>tiempo entre frames</strong>. <code>reloj.tick(60)</code> devuelve los
        milisegundos que pasaron:
      </p>
      <Code>{`dt = reloj.tick(60) / 1000        # segundos desde el frame anterior
x += 200 * dt                     # 200 pixeles por segundo, siempre`}</Code>
    </>
  );
}

function Colisiones() {
  return (
    <>
      <h2>Choques entre dos cajas</h2>
      <p>
        La forma más común de detectar colisiones es con los <code>Rect</code>. El
        método <code>colliderect</code> devuelve <code>True</code> si dos rectángulos
        se superponen:
      </p>
      <Code>{`jugador = pygame.Rect(100, 100, 40, 40)
moneda  = pygame.Rect(300, 120, 20, 20)

if jugador.colliderect(moneda):
    print("agarraste la moneda!")
    puntos += 1`}</Code>

      <h2>Un punto contra una caja</h2>
      <p>
        <code>collidepoint</code> sirve, por ejemplo, para saber si el mouse está
        sobre un botón:
      </p>
      <Code>{`boton = pygame.Rect(350, 500, 100, 40)
if boton.collidepoint(pygame.mouse.get_pos()):
    # el mouse esta encima del boton
    ...`}</Code>

      <h2>Contra una lista de objetos</h2>
      <Code>{`# indice del primer rect de la lista que choca (-1 si ninguno)
i = jugador.collidelist(enemigos)
if i != -1:
    print("choque con enemigo", i)

# todos los que chocan
tocados = jugador.collidelistall(enemigos)`}</Code>
      <p>
        Cuando manejás muchos objetos conviene usar <strong>sprites y grupos</strong>{" "}
        (ver la pestaña de imágenes), que traen colisiones ya hechas con{" "}
        <code>pygame.sprite.spritecollide(...)</code>.
      </p>
    </>
  );
}

function Imagenes() {
  return (
    <>
      <h2>Cargar y dibujar una imagen</h2>
      <p>
        Se carga con <code>pygame.image.load(...)</code> y se dibuja con{" "}
        <code>blit</code> (&ldquo;pegar&rdquo; una superficie sobre otra). Muy
        importante: llamá <code>convert()</code> /{" "}
        <code>convert_alpha()</code> después de crear la pantalla — hace que se dibuje
        mucho más rápido. Usá <code>convert_alpha()</code> para PNG con
        transparencia:
      </p>
      <Code>{`nave = pygame.image.load("nave.png").convert_alpha()

# dibujar en (x, y) = esquina superior izquierda de la imagen
pantalla.blit(nave, (400, 300))

# tamano de la imagen como Rect (util para posicionar y colisionar)
rect = nave.get_rect(center=(400, 300))
pantalla.blit(nave, rect)`}</Code>

      <h2>Fondo</h2>
      <p>
        Un fondo es una imagen del tamaño de la ventana que dibujás{" "}
        <strong>primero</strong>, antes que todo lo demás. Reemplaza al{" "}
        <code>fill</code>:
      </p>
      <Code>{`fondo = pygame.image.load("fondo.png").convert()

# dentro del bucle, al empezar a dibujar:
pantalla.blit(fondo, (0, 0))
# ... despues el jugador, enemigos, etc ...`}</Code>

      <h2>Escalar y rotar</h2>
      <Code>{`nave = pygame.transform.scale(nave, (64, 64))    # redimensionar
nave2 = pygame.transform.rotate(nave, 90)         # girar 90 grados
espejo = pygame.transform.flip(nave, True, False) # espejar horizontal`}</Code>

      <h2>Sprites: objetos que se dibujan y actualizan solos</h2>
      <p>
        Un <strong>sprite</strong> junta una imagen (<code>self.image</code>) con su
        caja (<code>self.rect</code>). Heredás de{" "}
        <code>pygame.sprite.Sprite</code> y ponés su lógica en{" "}
        <code>update()</code>. Después los agrupás y el <strong>grupo</strong> los
        actualiza y dibuja a todos:
      </p>
      <Code>{`class Jugador(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.image.load("nave.png").convert_alpha()
        self.rect = self.image.get_rect(center=(x, y))

    def update(self):
        teclas = pygame.key.get_pressed()
        if teclas[pygame.K_LEFT]:  self.rect.x -= 5
        if teclas[pygame.K_RIGHT]: self.rect.x += 5

jugador = Jugador(400, 500)
todos = pygame.sprite.Group(jugador)

# en el bucle:
todos.update()          # llama update() de cada sprite
todos.draw(pantalla)    # dibuja cada image en su rect`}</Code>
      <p>
        Con grupos, las colisiones salen redondas:{" "}
        <code>pygame.sprite.spritecollide(jugador, enemigos, True)</code> devuelve los
        enemigos tocados y (con <code>True</code>) los elimina del grupo.
      </p>
    </>
  );
}

function Audio() {
  return (
    <>
      <h2>Dos tipos de audio</h2>
      <p>
        Pygame separa los <strong>efectos cortos</strong> (un láser, un salto) de la{" "}
        <strong>música de fondo</strong> (larga, en streaming). El mezclador se
        prende con <code>pygame.init()</code>, pero podés inicializarlo aparte con{" "}
        <code>pygame.mixer.init()</code>.
      </p>

      <h2>Efectos: pygame.mixer.Sound</h2>
      <p>
        Se cargan enteros en memoria. Formatos recomendados:{" "}
        <code>.wav</code> y <code>.ogg</code>:
      </p>
      <Code>{`laser = pygame.mixer.Sound("laser.wav")
laser.set_volume(0.4)     # 0.0 a 1.0

# reproducir (por ejemplo, al disparar)
laser.play()`}</Code>

      <h2>Música de fondo: pygame.mixer.music</h2>
      <p>
        Se reproduce en streaming (no se carga entera). Ideal para la música del
        nivel. <code>play(-1)</code> la repite en loop:
      </p>
      <Code>{`pygame.mixer.music.load("musica.ogg")
pygame.mixer.music.set_volume(0.3)
pygame.mixer.music.play(-1)     # -1 = repetir para siempre

# mas adelante:
pygame.mixer.music.pause()
pygame.mixer.music.unpause()
pygame.mixer.music.stop()`}</Code>
      <p>
        Consejo: usá <code>.ogg</code> para la música (pesa menos que{" "}
        <code>.wav</code>) y <code>.wav</code> para los efectos cortos (arrancan sin
        demora).
      </p>
    </>
  );
}

function Metodos() {
  return (
    <>
      <h2>Chuleta de métodos más usados</h2>
      <p>Los que vas a escribir una y otra vez, agrupados por tema:</p>

      <h3 className="mt-4 font-semibold">Arranque y ventana</h3>
      <ul className="ml-5 list-disc space-y-1">
        <li><code>pygame.init()</code> — inicializa todo.</li>
        <li><code>pygame.display.set_mode((a, h))</code> — crea la ventana y devuelve la pantalla.</li>
        <li><code>pygame.display.set_caption(txt)</code> — título de la ventana.</li>
        <li><code>pygame.display.flip()</code> — muestra lo dibujado este frame.</li>
        <li><code>pygame.quit()</code> — cierra todo al terminar.</li>
      </ul>

      <h3 className="mt-4 font-semibold">Tiempo</h3>
      <ul className="ml-5 list-disc space-y-1">
        <li><code>reloj = pygame.time.Clock()</code> — crea el reloj.</li>
        <li><code>reloj.tick(60)</code> — limita a 60 FPS; devuelve los ms del frame.</li>
        <li><code>pygame.time.get_ticks()</code> — ms desde que arrancó (para timers).</li>
      </ul>

      <h3 className="mt-4 font-semibold">Entrada</h3>
      <ul className="ml-5 list-disc space-y-1">
        <li><code>pygame.event.get()</code> — lista de eventos (QUIT, KEYDOWN, MOUSEBUTTONDOWN…).</li>
        <li><code>pygame.key.get_pressed()</code> — qué teclas están apretadas ahora.</li>
        <li><code>pygame.mouse.get_pos()</code> / <code>get_pressed()</code> — posición y botones del mouse.</li>
      </ul>

      <h3 className="mt-4 font-semibold">Dibujo</h3>
      <ul className="ml-5 list-disc space-y-1">
        <li><code>pantalla.fill(color)</code> — pinta el fondo (borra el frame).</li>
        <li><code>pygame.draw.rect / circle / line / polygon(...)</code> — figuras.</li>
        <li><code>pantalla.blit(imagen, (x, y))</code> — dibuja una imagen/superficie.</li>
        <li><code>pygame.image.load(ruta).convert_alpha()</code> — carga una imagen.</li>
        <li><code>pygame.font.SysFont(None, 36).render(txt, True, color)</code> — texto en pantalla.</li>
      </ul>

      <h3 className="mt-4 font-semibold">Rect y colisiones</h3>
      <ul className="ml-5 list-disc space-y-1">
        <li><code>pygame.Rect(x, y, a, h)</code> — caja de posición/tamaño.</li>
        <li><code>rect.colliderect(otro)</code> — ¿se tocan dos cajas?</li>
        <li><code>rect.collidepoint(punto)</code> — ¿un punto cae adentro?</li>
      </ul>

      <h3 className="mt-4 font-semibold">Audio</h3>
      <ul className="ml-5 list-disc space-y-1">
        <li><code>pygame.mixer.Sound(ruta).play()</code> — efecto corto.</li>
        <li><code>pygame.mixer.music.load(ruta)</code> + <code>music.play(-1)</code> — música en loop.</li>
      </ul>

      <h2>Mostrar texto (puntaje, vidas)</h2>
      <Code>{`fuente = pygame.font.SysFont(None, 36)
texto = fuente.render(f"Puntos: {puntos}", True, (255, 255, 255))
pantalla.blit(texto, (10, 10))`}</Code>
    </>
  );
}
