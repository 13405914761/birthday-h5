from PIL import Image
from pathlib import Path
src=Path(r"C:\Users\ZQF\AppData\Local\Doubao\User Data\ClipboardTemp\6c29de31-80a6-4c25-a888-713a3e899730.png")
out=Path(r"D:\birth\public\puppy-poses")
im=Image.open(src).convert('RGBA')
boxes=[
 (90,420,350,680),(400,420,685,680),(700,420,1010,680),
 (75,700,355,950),(395,700,685,950),(700,700,1010,950),
 (70,980,355,1260),(395,980,685,1260),(700,980,1010,1260),
]
for i,box in enumerate(boxes,1):
    crop=im.crop(box)
    pixels=[]
    for r,g,b,a in crop.getdata():
        pixels.append((255,255,255,0) if r>240 and g>240 and b>240 else (r,g,b,a))
    crop.putdata(pixels)
    bb=crop.getchannel('A').getbbox()
    if bb: crop=crop.crop(bb)
    crop.thumbnail((360,220),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(360,220),(255,255,255,0))
    canvas.alpha_composite(crop,((360-crop.width)//2,(220-crop.height)//2))
    canvas.save(out/f'pose-{i:02d}.png',optimize=True)
print('grid recrop complete')
