import { useState, type CSSProperties } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, LampFloor, Rotate3D, Tv, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BirthdayRoomProps {
  onEnter: () => void;
}

type FocusTarget = 'tv' | 'photos' | 'calendar' | null;
const PHOTOS = ['m1.jpg', 'm3.jpg', 'm11.jpg'];

export default function BirthdayRoom({ onEnter }: BirthdayRoomProps) {
  const [rotation, setRotation] = useState(-7);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const [focus, setFocus] = useState<FocusTarget>(null);
  const base = (import.meta.env.MIAODA_CLIENT_BASE_PATH || '').replace(/\/$/, '') + '/';

  const move = (x: number) => {
    if (dragStart === null) return;
    setRotation((value) => value + (x - dragStart) * .28);
    setDragStart(x);
  };

  const roomStyle = { '--ry': `${rotation}deg` } as CSSProperties;

  return (
    <section className={`birthday-room room-realistic ${lampOn ? 'lamp-on' : 'lamp-off'}`}>
      <header className="room-hud"><strong>生日不打烊</strong><span>10 · 15</span></header>
      <div
        className="room-world room-diorama"
        style={roomStyle}
        onPointerDown={(event) => setDragStart(event.clientX)}
        onPointerMove={(event) => move(event.clientX)}
        onPointerUp={() => setDragStart(null)}
        onPointerCancel={() => setDragStart(null)}
      >
        <div className="room-shell"><div className="ceiling" /><div className="back-wall"><span className="wall-panel p1" /><span className="wall-panel p2" /></div><div className="side-wall left-wall" /><div className="side-wall right-wall" /><div className="wood-floor" /></div>
        <div className="window-night"><span className="city c1" /><span className="city c2" /><span className="city c3" /><span className="city c4" /></div>
        <button type="button" className="wall-gallery room-hotspot" onClick={() => setFocus('photos')}>
          {PHOTOS.map((photo) => <span className="photo-frame" key={photo}><img src={`${base}photos/${photo}`} alt="墙上照片" /></span>)}
        </button>
        <button type="button" className="room-calendar room-hotspot" onClick={() => setFocus('calendar')}><span>OCT</span><strong>15</strong><small>Birthday</small></button>
        <div className="bookcase"><i /><i /><i /><i /><i /><span className="book-row r1" /><span className="book-row r2" /></div>
        <div className="room-sofa"><span className="sofa-back" /><span className="sofa-seat" /><span className="sofa-arm left" /><span className="sofa-arm right" /><span className="sofa-pillow one" /><span className="sofa-pillow two" /><span className="sofa-pillow three" /></div>
        <div className="coffee-table"><span className="table-top" /><span className="table-leg left" /><span className="table-leg right" /><div className="birthday-cake"><span className="cake-base" /><span className="cake-cream" /><i className="candle c1" /><i className="candle c2" /><i className="flame f1" /><i className="flame f2" /></div><span className="open-book" /></div>
        <button type="button" className="room-tv room-hotspot" onClick={() => setFocus('tv')}><span className="tv-screen"><Tv /><b>生日频道</b><small>点击打开消息</small></span><i className="tv-leg l" /><i className="tv-leg r" /></button>
        <button type="button" className="floor-lamp room-hotspot" onClick={() => setLampOn((v) => !v)}><span className="lamp-shade"><LampFloor /></span><span className="lamp-pole" /><span className="lamp-base" /></button>
        <div className="green-chair"><span /><i /></div>
        <div className="rug"><span /></div>
      </div>
      <div className="room-orbit-bar"><Button size="icon" variant="outline" onClick={() => setRotation(v=>v-45)}><ChevronLeft /></Button><span><Rotate3D />360°环绕 · {lampOn?'灯光开启':'灯光关闭'}</span><Button size="icon" variant="outline" onClick={() => setRotation(v=>v+45)}><ChevronRight /></Button></div>

      {focus && <div className="room-focus-overlay" role="dialog" aria-modal="true">
        <button className="room-focus-close" type="button" onClick={()=>setFocus(null)}><X /></button>
        {focus==='photos' && <div className="focus-photo-wall"><h2>墙上的回忆</h2><div>{PHOTOS.map(p=><img key={p} src={`${base}photos/${p}`} alt="回忆照片" />)}</div></div>}
        {focus==='calendar' && <div className="focus-calendar"><CalendarDays /><p>10月15日</p><strong>今天是缤缤的生日</strong></div>}
        {focus==='tv' && <div className="focus-tv"><div className="focus-tv-screen"><span className="tv-static" /><Tv /><h2>是否查看生日礼物？</h2><div className="tv-choice"><Button type="button" onClick={onEnter}>是</Button><Button type="button" variant="outline" onClick={()=>setFocus(null)}>否</Button></div></div></div>}
      </div>}
    </section>
  );
}
