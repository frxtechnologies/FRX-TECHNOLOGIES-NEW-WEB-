"""Raaef portrait: transparent-background version (numpy + Pillow only, nothing downloaded).

 1. AUTOMATIC: flood from the wall-coloured border pixels across smooth areas. It fills both wall regions
    and stops at the strong outlines (hair, suit, shirt, glasses, ear).
 2. FACE AND NECK: skin is as smooth as the wall, so the flood leaks into it. A hand-traced polygon (traced
    from zoomed, gridded crops of the original) re-claims the face and neck; its outline follows the real
    profile edge. Union with the automatic subject.
 3. CLEAN-UP: drop stray islands, fill pinholes, pull the edge in 1px (removes the light wall halo), soften.
The photograph's pixels are never altered: only the alpha channel is created.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
GRAD = 3.5

im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float32)
g = a.mean(axis=2)
H, W = g.shape

blur = np.asarray(Image.fromarray(g.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))).astype(np.float32)
gy, gx = np.gradient(blur)
smooth = np.hypot(gx, gy) < GRAD

bg = np.zeros((H, W), bool)
seed = np.zeros((H, W), bool)
seed[0, :] = seed[-1, :] = seed[:, 0] = seed[:, -1] = True
seed &= (g > 120) & (g < 240)
front = seed & smooth
bg |= front
while front.any():
    nxt = np.zeros_like(front)
    nxt[1:, :] |= front[:-1, :]
    nxt[:-1, :] |= front[1:, :]
    nxt[:, 1:] |= front[:, :-1]
    nxt[:, :-1] |= front[:, 1:]
    nxt &= smooth & ~bg
    bg |= nxt
    front = nxt

subject = ~bg

# face + neck, traced clockwise from the forehead (original-image coordinates)
FACE = [
    (700, 240), (780, 215), (842, 236), (857, 262), (864, 282), (869, 300), (872, 312),
    (886, 322), (898, 338), (902, 352), (900, 368), (898, 382), (896, 398), (892, 408), (884, 414),
    (876, 420), (873, 430), (876, 442), (877, 456), (874, 470), (868, 482), (861, 494), (858, 506),
    (860, 522), (862, 540), (863, 556), (859, 568), (850, 578), (835, 586), (815, 592), (795, 600),
    (780, 608), (768, 614),
    (745, 640), (730, 720), (600, 740), (520, 690), (503, 600), (503, 560), (505, 530), (540, 490), (566, 450), (588, 400), (610, 318),
]
poly = Image.new("L", (W, H), 0)
ImageDraw.Draw(poly).polygon(FACE, fill=255)
subject |= np.asarray(poly) > 127

# clean-up: keep the largest component, fill pinholes
def components(mask):
    lab = np.zeros(mask.shape, np.int32)
    n = 0
    sizes = [0]
    for y0 in range(0, mask.shape[0]):
        row = np.nonzero(mask[y0] & (lab[y0] == 0))[0]
        for x0 in row:
            if lab[y0, x0]:
                continue
            n += 1
            stack = [(y0, x0)]
            lab[y0, x0] = n
            cnt = 0
            while stack:
                y, x = stack.pop()
                cnt += 1
                for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= yy < mask.shape[0] and 0 <= xx < mask.shape[1] and mask[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n
                        stack.append((yy, xx))
            sizes.append(cnt)
    return lab, sizes

lab, sizes = components(subject)
big = int(np.argmax(sizes[1:])) + 1
subject = lab == big
print("components:", len(sizes) - 1, "largest share of subject pixels:", round(sizes[big] / sum(sizes[1:]), 4))
# pinholes: background-labelled islands fully enclosed by the subject
inv = ~subject
lab2, sizes2 = components(inv)
edge_labels = set(np.unique(np.concatenate([lab2[0], lab2[-1], lab2[:, 0], lab2[:, -1]])))
for k in range(1, len(sizes2)):
    if k not in edge_labels and sizes2[k] < 3000:
        subject[lab2 == k] = True

m = Image.fromarray((subject * 255).astype(np.uint8))
m = m.filter(ImageFilter.MinFilter(3))  # pull the edge in 1px
core = np.asarray(m) > 127

# defringe: where the subject is dark (hair, suit), an edge pixel much lighter than the dark body right behind
# it is the light wall bleeding through, not the subject. Drop those, never touch anything else.
deep = np.asarray(Image.fromarray((core * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(9))) > 127
luma = g
num = np.asarray(Image.fromarray((luma * deep).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7))).astype(np.float32)
den = np.asarray(Image.fromarray((deep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7))).astype(np.float32) / 255.0
ref = np.where(den > 0.02, num / np.maximum(den, 0.02), 255.0)
band = core & ~deep
fringe = band & (ref < 100) & (luma - ref > 38)
print("defringed pixels:", int(fringe.sum()))
core &= ~fringe
m = Image.fromarray((core * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
alpha = np.array(m)
alpha[-4:, :] = 0  # the last rows of the original are a black scan edge, not part of the photograph

out = np.dstack([np.asarray(im), alpha])
Image.fromarray(out, "RGBA").save(dst)
print("saved", dst, "opaque share:", round(float((alpha > 127).mean()), 3))
