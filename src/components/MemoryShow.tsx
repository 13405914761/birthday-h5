import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import PuppyPair from '@/components/PuppyPair';

const TOUR_DURATION = 38_000;
// 照片放到 public/photos/ 目录，文件名与下方 image 对应（m1.jpg ~ m11.jpg）。
// 某张照片缺失或加载失败时，会自动回退成“照片待上传”占位图，不影响播放。
const SLIDES = [
  { caption: '我们的回忆，从这张开始', image: 'photos/m1.jpg' },
  { caption: '第一次一起出门', image: 'photos/m2.jpg' },
  { caption: '你笑起来的样子', image: 'photos/m3.jpg' },
  { caption: '那顿很久很久的晚饭', image: 'photos/m4.jpg' },
  { caption: '一起去看花', image: 'photos/m5.jpg' },
  { caption: '一起过圣诞', image: 'photos/m6.jpg' },
  { caption: '在车上半夜偷偷吃东西', image: 'photos/m7.jpg' },
  { caption: '神农架的那个冬天', image: 'photos/m8.jpg' },
  { caption: '幸福的宝贝', image: 'photos/m9.jpg' },
  { caption: '一起看武汉大雪', image: 'photos/m10.jpg' },
  { caption: '还有好多照片要一起拍', image: 'photos/m11.jpg' },
];
const POSES: Array<'wave' | 'hug' | 'gift' | 'sleep'> = [
  'wave', 'gift', 'hug', 'wave', 'sleep', 'gift', 'hug', 'wave', 'gift', 'hug', 'wave',
];

interface MemoryShowProps {
  enabled: boolean;
  onDone: () => void;
}

export default function MemoryShow({ enabled, onDone }: MemoryShowProps) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const reduced = useReducedMotion();
  const base = (import.meta.env.MIAODA_CLIENT_BASE_PATH || '').replace(/\/$/, '') + '/';

  // 相邻照片的间距倍数：越大照片之间隔得越开，拖动时要走更久才到下一张
  const SLIDE_GAP = 1.6;
  const position = progress * (SLIDES.length - 1);
  const currentIndex = Math.min(SLIDES.length - 1, Math.floor(position + 0.45));

  useEffect(() => {
    if (!enabled || !playing) return;
    startedAtRef.current = performance.now() - progressRef.current * TOUR_DURATION;

    const tick = (now: number) => {
      const next = Math.min(1, (now - startedAtRef.current) / (reduced ? 1500 : TOUR_DURATION));
      progressRef.current = next;
      setProgress(next);
      if (next >= 1) {
        setPlaying(false);
        onDone();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, onDone, playing, reduced]);

  const restart = () => {
    progressRef.current = 0;
    setProgress(0);
    setPlaying(true);
  };

  const seek = (values: number[]) => {
    const next = Math.max(0, Math.min(1000, values[0] ?? 0)) / 1000;
    progressRef.current = next;
    setProgress(next);
  };

  return (
    <section id="memory-show" className={`memory-section ${!enabled ? 'is-locked' : ''}`} role="region" aria-label="回忆放映厅">
      <div className="memory-paper">
        <p className="section-eyebrow">25岁之后 · 回忆放映厅</p>
        <h2>沿着回忆，一直走到我们身边</h2>
        <p>这是一条连续前进的手账长廊：照片、纸星球和不同动作的小狗会从远处不断走近。</p>

        <div className="memory-tunnel" aria-live="polite">
          <div className="tunnel-cloud cloud-one" aria-hidden="true" />
          <div className="tunnel-cloud cloud-two" aria-hidden="true" />
          <div className="tunnel-stars" aria-hidden="true">✦ · ♡ · ✧</div>
          <div className="tunnel-road" aria-hidden="true" />

          {SLIDES.map((slide, slideIndex) => {
            const rawDistance = (slideIndex - position) * SLIDE_GAP;
            if (rawDistance < -1.5 || rawDistance > 7.5) return null;
            const depth = Math.max(-1, rawDistance);
            const scale = reduced ? (Math.abs(rawDistance) < .5 ? 1 : 0) : Math.min(1.34, Math.max(.08, 1.08 - depth * .21));
            const y = reduced ? 0 : -depth * 78 + 38;
            const lane = slideIndex % 2 === 0 ? -1 : 1;
            const x = reduced ? 0 : lane * Math.min(68, Math.max(0, depth * 16));
            const opacity = reduced ? (Math.abs(rawDistance) < .5 ? 1 : 0) : Math.min(1, Math.max(0, 1.05 - Math.abs(rawDistance) * .2));
            const blur = reduced ? 0 : Math.max(0, depth - .2) * .42;
            return (
              <div
                key={slideIndex}
                className={`tunnel-memory-card card-tone-${slideIndex % 4}`}
                style={{
                  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                  opacity,
                  zIndex: 50 - Math.round(depth * 5),
                  filter: `blur(${blur}px)`,
                }}
              >
                <div className="tunnel-photo">
                  {failedImages.has(slideIndex) ? (
                    <>
                      <span className="tunnel-sun" />
                      <span className="tunnel-hill hill-left" />
                      <span className="tunnel-hill hill-right" />
                      <b>照片待上传</b>
                    </>
                  ) : (
                    <img
                      src={`${base}${slide.image}`}
                      alt={slide.caption}
                      loading="lazy"
                      onError={() => setFailedImages((prev) => new Set(prev).add(slideIndex))}
                    />
                  )}
                </div>
                <p>{slide.caption}</p>
                <span>{slideIndex + 1} / {SLIDES.length}</span>
              </div>
            );
          })}

          <motion.div
            key={currentIndex}
            className={`tunnel-puppies puppy-path-${currentIndex % 3}`}
            initial={reduced ? false : { opacity: 0, scale: .72 }}
            animate={{ opacity: 1, scale: reduced ? .72 : [.72, .79, .72], y: reduced ? 0 : [0, -5, 0] }}
            transition={{ duration: 2.8, repeat: reduced ? 0 : Infinity, ease: 'easeInOut' }}
          >
            <PuppyPair mood={POSES[currentIndex] ?? 'wave'} />
          </motion.div>
          <div className="tunnel-paper-edge" aria-hidden="true" />
        </div>

        <div className="memory-seek" aria-label="连续回忆播放进度">
          <Slider value={[Math.round(progress * 1000)]} min={0} max={1000} step={1} onValueChange={seek} disabled={!enabled} />
          <span>{currentIndex + 1} / {SLIDES.length}</span>
        </div>
        <div className="memory-film-progress" aria-hidden="true"><span style={{ width: `${progress * 100}%` }} /></div>
        <div className="memory-controls">
          <Button type="button" variant="outline" onClick={() => setPlaying((current) => !current)} disabled={!enabled}>
            {playing ? <Pause /> : <Play />}{playing ? '暂停' : progress > 0 ? '继续' : '开始播放'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setMuted((current) => !current)} disabled={!enabled}>
            {muted ? <VolumeX /> : <Volume2 />}{muted ? '静音' : '已开声'}
          </Button>
          <Button type="button" variant="outline" onClick={restart} disabled={!enabled}><RotateCcw />回到第一张</Button>
        </div>
        {!enabled && <p className="memory-lock">完成25岁，放映厅才会亮灯。</p>}
      </div>
    </section>
  );
}
