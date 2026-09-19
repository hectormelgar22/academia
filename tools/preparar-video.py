"""
Prepara el vídeo de fondo de la portada a partir del original en 4K.

Uso:   python tools/preparar-video.py [ruta-al-original.mp4]
Requiere:  pip install imageio-ffmpeg Pillow

Qué hace:
  · Baja la resolución a 1600 px de ancho (suficiente detrás del texto).
  · Aplica una gradación: baja la luz, quita saturación y lo lleva hacia el
    azul de la marca, para que el texto blanco se lea y el vídeo no pelee
    con la paleta.
  · Quita la pista de audio: un fondo que suena es un fondo que molesta.
  · Exporta también una versión ligera para conexiones lentas y un póster
    en WebP, que es lo que se ve mientras el vídeo carga o cuando el
    visitante ha pedido menos movimiento.

El original NO se publica: pesa 16 MB y está en .gitignore. Si lo pierdes,
basta con volver a colocar cualquier vídeo de aula y ejecutar el script.
"""

import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
DESTINO_VIDEO = RAIZ / "assets" / "video"
DESTINO_IMG = RAIZ / "assets" / "images"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

ORIGINAL_POR_DEFECTO = RAIZ / "assets" / "video" / "original" / "aula-4k.mp4"

# Gradación común para todas las salidas.
GRADACION = (
    "eq=brightness=-0.09:contrast=1.10:saturation=0.52,"
    "colorbalance=rs=-0.04:bs=0.09:rm=-0.05:bm=0.11:rh=-0.03:bh=0.06,"
    "vignette=PI/4.6"
)

SALIDAS = [
    {"nombre": "hero.mp4",     "ancho": 1600, "crf": 30},
    {"nombre": "hero-960.mp4", "ancho": 960,  "crf": 31},
]


def correr(args: list[str]) -> None:
    resultado = subprocess.run(args, capture_output=True, text=True)
    if resultado.returncode != 0:
        print(resultado.stderr[-1500:])
        raise SystemExit(f"ffmpeg falló con código {resultado.returncode}")


def main() -> None:
    origen = Path(sys.argv[1]) if len(sys.argv) > 1 else ORIGINAL_POR_DEFECTO
    if not origen.exists():
        raise SystemExit(f"No encuentro el vídeo original en {origen}")

    DESTINO_VIDEO.mkdir(parents=True, exist_ok=True)
    DESTINO_IMG.mkdir(parents=True, exist_ok=True)

    for salida in SALIDAS:
        destino = DESTINO_VIDEO / salida["nombre"]
        print(f"· {salida['nombre']} … ", end="", flush=True)
        correr([
            FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(origen),
            "-an",                                   # sin audio
            "-vf", f"scale={salida['ancho']}:-2,{GRADACION}",
            "-c:v", "libx264", "-preset", "slow",
            "-crf", str(salida["crf"]),
            "-profile:v", "main", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(destino),
        ])
        print(f"{destino.stat().st_size // 1024} KB")

    # Póster: el primer fotograma ya graduado, para que no haya salto al arrancar.
    temporal = DESTINO_IMG / "_poster.png"
    print("· póster … ", end="", flush=True)
    correr([
        FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(DESTINO_VIDEO / "hero.mp4"),
        "-frames:v", "1", "-vf", "scale=1600:-2", str(temporal),
    ])
    Image.open(temporal).convert("RGB").save(
        DESTINO_IMG / "hero-poster.webp", "WEBP", quality=78, method=6
    )
    temporal.unlink()
    poster = DESTINO_IMG / "hero-poster.webp"
    print(f"{poster.stat().st_size // 1024} KB")

    total = sum(f.stat().st_size for f in DESTINO_VIDEO.glob("*.mp4"))
    print(f"\nTotal de vídeo publicado: {total // 1024} KB")


if __name__ == "__main__":
    main()
