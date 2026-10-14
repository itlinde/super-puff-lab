# Side-by-side strip of tightly cropped jacket images at equal height.
# Usage: python3 scripts/compare.py out.png img1 img2 ...
import sys
from PIL import Image
import numpy as np
def crop(path,h=700):
    im=Image.open(path).convert('RGB'); a=np.asarray(im).astype(int); bg=a[8,8]
    m=np.abs(a-bg).sum(2)>24; ys=np.where(m.sum(1)>3)[0]; xs=np.where(m.sum(0)>3)[0]
    pad=16; c=im.crop((xs[0]-pad,ys[0]-pad,xs[-1]+pad,ys[-1]+pad))
    return c.resize((int(c.width*h/c.height),h))
ims=[crop(p) for p in sys.argv[2:]]
W=Image.new('RGB',(sum(i.width for i in ims)+10*len(ims),700),'white'); x=0
for im in ims: W.paste(im,(x,0)); x+=im.width+10
W.save(sys.argv[1])
