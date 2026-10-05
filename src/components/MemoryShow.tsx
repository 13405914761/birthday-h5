import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import PuppyPair from '@/components/PuppyPair';

const SLIDES = [
  '我们的回忆，从这张开始','第一次一起出门','你笑起来的样子','那顿很久很久的晚饭','下雨天共用一把伞',
  '随手拍的日落','躺在一起什么也没做','2023 的那个秋天','2024 毕业那天','一起去过的海','还有好多照片要一起拍'
];

interface MemoryShowProps {
  enabled: boolean;
  onDone: () => void;
}

export default function MemoryShow({ enabled, onDone }: MemoryShowProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const timerRef = useRef<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!enabled || !playing) return;
    timerRef.current = window.setTimeout(() => {
      if (index >= SLIDES.length - 1) {
        setPlaying(false);
        onDone();
      } else {
        setIndex((current) => current + 1);
      }
    }, reduced ? 600 : 3200);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [enabled, index, onDone, playing, reduced]);

  const restart = () => {
    setIndex(0);
    setPlaying(true);
  };

  const seek = (values: number[]) => {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, values[0] ?? 0)));
  };

  return (
    <section id="memory-show" className={`memory-section ${!enabled ? 'is-locked' : ''}`} role="region" aria-label="回忆放映厅">
      <div className="memory-paper">
        <p className="section-eyebrow">25岁之后 · 回忆放映厅</p>
        <h2>把照片一张张翻给你看</h2>
        <p>照片之后再放进来。现在先留下一本会动的空相册。</p>
        <div className="projector-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="polaroid-placeholder"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 70, rotate: 6 }}
              animate={{ opacity: 1, x: 0, rotate: index % 2 === 0 ? -2 : 2 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -70, rotate: -5 }}
              transition={{ duration: reduced ? .2 : .55 }}
            >
              <div className="photo-empty">照片待上传</div>
              <p>{SLIDES[index]}</p>
              <span>{index + 1} / {SLIDES.length}</span>
            </motion.div>
          </AnimatePresence>
          <PuppyPair mood={index === SLIDES.length - 1 ? 'hug' : 'wave'} />
        </div>
        <div className="memory-seek" aria-label="照片播放进度">
          <Slider
            value={[index]}
            min={0}
            max={SLIDES.length - 1}
            step={1}
            onValueChange={seek}
            disabled={!enabled}
          />
          <span>{index + 1} / {SLIDES.length}</span>
        </div>
        <div className="memory-controls">
          <Button type="button" variant="outline" onClick={() => setPlaying((current) => !current)} disabled={!enabled}>
            {playing ? <Pause /> : <Play />}{playing ? '暂停' : index > 0 ? '继续' : '开始播放'}
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
