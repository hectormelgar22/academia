"""
Genera assets/images/og-nexo.png (1200 x 630), la imagen que se ve al
compartir la web en WhatsApp, redes o buscadores.

Uso:   python tools/generar-og.py
Requiere Pillow:  pip install Pillow

Si cambias el nombre de la academia o el titular, edita las constantes de
CONTENIDO y vuelve a ejecutarlo. No hace falta para que la web funcione:
es sólo la miniatura de compartición.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ─────────────────────────────  CONTENIDO  ─────────────────────────────
MARCA_1, MARCA_2 = "NEXO", " Academia"
TITULO = [
    [("Que una asignatura", "roman")],
    [("no ", "roman"), ("decida", "italic"), (" el curso.", "roman")],
]
SUBTITULO = "Refuerzo de Primaria, ESO y Bachillerato."
LUGAR = "Montecarmelo, Madrid"
NOTA = "Grupos de 6 · Valoración inicial gratuita"
NOTAS = [3.5, 4.0, 5.5, 6.5, 7.5]
MESES = ["Sep", "Oct", "Nov", "Dic", "Ene"]

# ──────────────────────────────  PALETA  ───────────────────────────────
PAPEL = (251, 248, 242)
PAPEL2 = (244, 236, 223)
TINTA = (23, 28, 38)
TINTA2 = (61, 69, 81)
TINTA3 = (99, 107, 120)
AZUL = (21, 80, 127)
AZUL_SUAVE = (227, 236, 245)
ROJO = (206, 75, 33)
FILETE = (221, 214, 203)

W, H = 1200, 630
MARGEN = 80
COL_IZQ = 660          # ancho útil de la columna de texto

FONTS = Path("C:/Windows/Fonts")
f_titulo = ImageFont.truetype(str(FONTS / "georgiab.ttf"), 64)
f_titulo_it = ImageFont.truetype(str(FONTS / "georgiaz.ttf"), 64)
f_marca = ImageFont.truetype(str(FONTS / "georgiab.ttf"), 32)
f_sub = ImageFont.truetype(str(FONTS / "segoeui.ttf"), 26)
f_nota = ImageFont.truetype(str(FONTS / "georgiai.ttf"), 22)
f_micro = ImageFont.truetype(str(FONTS / "segoeuib.ttf"), 15)
f_dato = ImageFont.truetype(str(FONTS / "segoeuib.ttf"), 16)
f_mes = ImageFont.truetype(str(FONTS / "segoeui.ttf"), 15)

img = Image.new("RGB", (W, H), PAPEL)
d = ImageDraw.Draw(img)

# Pauta de cuaderno, sólo bajo el titular y muy tenue
for y in range(196, 492, 40):
    d.line([(0, y), (W, y)], fill=FILETE, width=1)

# ──────────────────────────────  MARCA  ────────────────────────────────
d.text((MARGEN, 58), MARCA_1, font=f_marca, fill=AZUL)
d.text((MARGEN + d.textlength(MARCA_1, font=f_marca), 58), MARCA_2, font=f_marca, fill=TINTA)
d.line([(MARGEN, 114), (W - MARGEN, 114)], fill=FILETE, width=2)

# ─────────────────────────────  TITULAR  ───────────────────────────────
y = 186
for linea in TITULO:
    x = MARGEN
    for texto, estilo in linea:
        fuente = f_titulo_it if estilo == "italic" else f_titulo
        color = AZUL if estilo == "italic" else TINTA
        d.text((x, y), texto, font=fuente, fill=color)
        x += d.textlength(texto, font=fuente)
    y += 80

# ────────────────────────────  SUBTITULAR  ─────────────────────────────
d.line([(MARGEN, 372), (MARGEN + 108, 372)], fill=TINTA, width=3)
d.text((MARGEN, 398), SUBTITULO, font=f_sub, fill=TINTA2)
d.text((MARGEN, 434), LUGAR, font=f_sub, fill=TINTA2)
d.text((MARGEN, 484), NOTA, font=f_nota, fill=ROJO)

# ───────────────────  FICHA DE SEGUIMIENTO (derecha)  ──────────────────
cx0, cy0, cx1, cy1 = 772, 168, W - MARGEN, 512
d.rectangle([cx0, cy0, cx1, cy1], fill=PAPEL2, outline=FILETE, width=2)
d.text((cx0 + 24, cy0 + 22), "INFORME DE SEGUIMIENTO", font=f_micro, fill=TINTA2)
d.line([(cx0, cy0 + 56), (cx1, cy0 + 56)], fill=FILETE, width=2)

base_y = cy1 - 54
alto_max = 218
zona_x0, zona_x1 = cx0 + 28, cx1 - 28
barra_w = 34
hueco = (zona_x1 - zona_x0 - len(NOTAS) * barra_w) / (len(NOTAS) - 1)

for i, nota in enumerate(NOTAS):
    alto = int(alto_max * nota / 10)
    x0 = int(zona_x0 + i * (barra_w + hueco))
    y0 = base_y - alto
    relleno = AZUL if i == len(NOTAS) - 1 else AZUL_SUAVE
    d.rectangle([x0, y0, x0 + barra_w, base_y], fill=relleno, outline=AZUL)

    etiqueta = f"{nota:.1f}".replace(".", ",")
    ancho = d.textlength(etiqueta, font=f_dato)
    d.text((x0 + (barra_w - ancho) / 2, y0 - 24), etiqueta, font=f_dato, fill=TINTA)

    ancho_mes = d.textlength(MESES[i], font=f_mes)
    d.text((x0 + (barra_w - ancho_mes) / 2, base_y + 12), MESES[i], font=f_mes, fill=TINTA3)

d.line([(zona_x0 - 10, base_y + 1), (zona_x1 + 10, base_y + 1)], fill=TINTA, width=2)

# Filete inferior de cierre
d.rectangle([0, H - 10, W, H], fill=AZUL)

salida = Path(__file__).resolve().parent.parent / "assets" / "images" / "og-nexo.png"
salida.parent.mkdir(parents=True, exist_ok=True)
img.save(salida, optimize=True)
print("Escrito:", salida, img.size)
