# Row-by-row silhouette widths of a jacket image on a flat background,
# normalised to the jacket's height. Usage: python3 scripts/profile.py img [bg_sample_xy]
import sys
from PIL import Image
import numpy as np
im=np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int)
H,W,_=im.shape
bg=im[8,8]
m=np.abs(im-bg).sum(2)>24
ys=np.where(m.sum(1)>3)[0]; top,bot=ys[0],ys[-1]; h=bot-top
cols=np.where(m.any(0))[0]
print(f'height {h}px  width {cols[-1]-cols[0]}px  w/h {(cols[-1]-cols[0])/h:.3f}')
for f in [0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.5,0.6,0.7,0.8,0.85,0.9,0.95]:
    y=int(top+f*h); r=m[y]
    runs=[];s=None
    for x in range(W):
        if r[x] and s is None: s=x
        if (not r[x] or x==W-1) and s is not None:
            if x-s>4: runs.append((s,x))
            s=None
    tot=(runs[-1][1]-runs[0][0])/h if runs else 0
    print(f'{f:.2f} total {tot:.3f} runs {[round((b-a)/h,3) for a,b in runs]}')
