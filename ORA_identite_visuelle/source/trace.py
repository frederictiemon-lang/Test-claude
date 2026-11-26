import sys, numpy as np, potrace
from PIL import Image
def trace(src, out_svg, scale, pad, thresh=128, bbox_thresh=110, blur=0, alphamax=1.0, opttol=0.2):
    g=Image.open(src).convert('L')
    a=np.array(g)
    ys,xs=np.where(a<bbox_thresh)
    x0,x1,y0,y1=xs.min()-pad, xs.max()+pad, ys.min()-pad, ys.max()+pad
    g=g.crop((x0,y0,x1+1,y1+1))
    W,H=g.size
    big=g.resize((W*scale,H*scale), Image.LANCZOS)
    if blur:
        from PIL import ImageFilter
        big=big.filter(ImageFilter.GaussianBlur(blur))
    bm=np.array(big)<thresh
    bmp=potrace.Bitmap(~bm)
    path=bmp.trace(turdsize=50, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=alphamax, opticurve=True, opttolerance=opttol)
    d=[]
    for curve in path:
        sp=curve.start_point; d.append(f"M{sp.x:.2f},{sp.y:.2f}")
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x:.2f},{seg.c.y:.2f}L{seg.end_point.x:.2f},{seg.end_point.y:.2f}")
            else:
                d.append(f"C{seg.c1.x:.2f},{seg.c1.y:.2f} {seg.c2.x:.2f},{seg.c2.y:.2f} {seg.end_point.x:.2f},{seg.end_point.y:.2f}")
        d.append("Z")
    Wb,Hb=W*scale,H*scale
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {Wb} {Hb}" width="{Wb}" height="{Hb}"><path fill="#000000" fill-rule="evenodd" d="{"".join(d)}"/></svg>'
    open(out_svg,'w').write(svg)
    print(out_svg, 'crop',(x0,y0,x1,y1),'size',Wb,Hb,'curves',len(path))
    return bm
U='/root/.claude/uploads/4d122909-3031-5c27-b394-00b9a80cd2ea/'
trace(U+'03e9dc40-image.jpg','symbol.svg',scale=10,pad=6,blur=6,alphamax=1.15,opttol=0.3)
trace(U+'f528c96b-image.png','wordmark.svg',scale=4,pad=6,blur=3,alphamax=1.15,opttol=0.3)
