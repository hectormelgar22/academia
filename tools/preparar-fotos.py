"""
Descarga las fotografías de Unsplash, las recorta a las proporciones que usa la
web y las exporta en WebP con una gradación común, para que parezcan tomadas en
la misma sesión y no una mezcla de bancos de imágenes.

Uso:   python tools/preparar-fotos.py
Requiere Pillow:  pip install Pillow

Para cambiar una foto, sustituye su identificador de Unsplash en FOTOS y vuelve
a ejecutarlo. Para usar fotografías propias de la academia, coloca los archivos
en assets/images/ con el mismo nombre y salta este script.
"""

import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageEnhance

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "assets" / "images"
SALIDA.mkdir(parents=True, exist_ok=True)

# nombre: (id de Unsplash, proporción, anchos, enfoque vertical, enfoque horizontal)
# Los enfoques van de 0 a 1 y deciden qué parte se conserva al recortar.
FOTOS = {
    "aula":       ("photo-1758270704925-fa59d93119c1", (16, 10), [1600, 900], 0.42),
    "apuntes":    ("photo-1434030216411-0b793f4b4173", (4, 3),   [1200, 640], 0.50),
    "estudio":    ("photo-1598981457915-aea220950616", (4, 3),   [1200, 640], 0.40),
    "pizarra":    ("photo-1511629091441-ee46146481b6", (4, 3),   [1200, 640], 0.45),
    "biblioteca": ("photo-1741699428220-65f37f3fbbcb", (4, 3),   [1200, 640], 0.45),
    "grupo":      ("photo-1561089489-f13d5e730d72",    (4, 3),   [1200, 640], 0.45),

    "apoyo":      ("photo-1589206946274-929e4da3996b", (4, 3),   [1200, 640], 0.45),

    # Cabeceras de los artículos de la sección de recursos
    "art-suspende": ("photo-1560543685-824b3c5e82ad", (16, 9), [1200, 640], 0.4),
    "art-examen":   ("photo-1606295834251-36d654991797", (16, 9), [1200, 640], 0.42),
    "art-pau":      ("photo-1541829070764-84a7d30dd3f3", (16, 9), [1200, 640], 0.45),
    "art-precio":   ("photo-1435527173128-983b87201f4d", (16, 9), [1200, 640], 0.45),

    # Retratos del profesorado: personas trabajando, no fotos de estudio.
    # Mismo orden que ACADEMY.teachers.
    "profe-marta":  ("photo-1581065178047-8ee15951ede6", (4, 5), [800, 420], 0.18),
    "profe-carlos": ("photo-1568602471122-7832951cc4c5", (4, 5), [800, 420], 0.18),
    "profe-elena":  ("photo-1629540266304-fff9c67b7660", (4, 5), [800, 420], 0.18),
    "profe-david":  ("photo-1566753323558-f4e0952af115", (4, 5), [800, 420], 0.22),
    "profe-nuria":  ("photo-1607990283143-e81e7a2c9349", (4, 5), [800, 420], 0.18),
    "profe-javier": ("photo-1583264277168-58ceba4b84e7", (4, 5), [800, 420], 0.20),
}

CABECERAS = {"User-Agent": "Mozilla/5.0 (compatible; NexoAcademiaBuild/1.0)"}


def descargar(photo_id: str, ancho: int = 2000) -> Image.Image:
    url = f"https://images.unsplash.com/{photo_id}?auto=format&fit=max&w={ancho}&q=85"
    peticion = urllib.request.Request(url, headers=CABECERAS)
    with urllib.request.urlopen(peticion, timeout=60) as respuesta:
        datos = respuesta.read()
    return Image.open(io.BytesIO(datos)).convert("RGB")


def recortar(img: Image.Image, proporcion: tuple[int, int], foco: float,
             foco_x: float = 0.5) -> Image.Image:
    """Recorta conservando el punto de interés indicado en cada eje."""
    objetivo = proporcion[0] / proporcion[1]
    ancho, alto = img.size
    actual = ancho / alto

    if actual > objetivo:                     # sobra por los lados
        nuevo_ancho = int(alto * objetivo)
        izquierda = int((ancho - nuevo_ancho) * foco_x)
        izquierda = max(0, min(izquierda, ancho - nuevo_ancho))
        caja = (izquierda, 0, izquierda + nuevo_ancho, alto)
    else:                                     # sobra por arriba y abajo
        nuevo_alto = int(ancho / objetivo)
        arriba = int((alto - nuevo_alto) * foco)
        arriba = max(0, min(arriba, alto - nuevo_alto))
        caja = (0, arriba, ancho, arriba + nuevo_alto)

    return img.crop(caja)


def graduar(img: Image.Image) -> Image.Image:
    """
    Gradación común: un punto de calidez, algo de contraste y una pizca menos de
    saturación, para que ninguna foto desentone con el papel crema de la web.
    """
    img = ImageEnhance.Color(img).enhance(0.92)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Brightness(img).enhance(1.02)

    rojo, verde, azul = img.split()
    rojo = rojo.point(lambda v: min(255, int(v * 1.035 + 3)))
    verde = verde.point(lambda v: min(255, int(v * 1.005 + 1)))
    azul = azul.point(lambda v: max(0, int(v * 0.962)))
    return Image.merge("RGB", (rojo, verde, azul))


def main() -> None:
    filtro = sys.argv[1] if len(sys.argv) > 1 else ""

    for nombre, ajustes in FOTOS.items():
        if filtro and filtro not in nombre:
            continue
        photo_id, proporcion, anchos, foco = ajustes[:4]
        foco_x = ajustes[4] if len(ajustes) > 4 else 0.5
        print(f"· {nombre} … ", end="", flush=True)
        try:
            original = descargar(photo_id)
        except Exception as error:                      # red caída, id retirado…
            print(f"ERROR: {error}")
            continue

        base = graduar(recortar(original, proporcion, foco, foco_x))

        for ancho in anchos:
            alto = round(ancho * proporcion[1] / proporcion[0])
            copia = base.resize((ancho, alto), Image.LANCZOS)
            sufijo = "" if ancho == anchos[0] else f"-{ancho}"
            destino = SALIDA / f"{nombre}{sufijo}.webp"
            copia.save(destino, "WEBP", quality=82, method=6)
            print(f"{destino.name} ({destino.stat().st_size // 1024} KB) ", end="")
        print()

    total = sum(f.stat().st_size for f in SALIDA.glob("*.webp"))
    print(f"\nTotal en WebP: {total // 1024} KB")


if __name__ == "__main__":
    main()
