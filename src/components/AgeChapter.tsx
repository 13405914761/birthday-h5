import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Gift, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import type { IChapter } from '@/data/chapters';
import PuppyPose from '@/components/PuppyPose';

interface AgeChapterProps {
  chapter: IChapter;
  unlocked: boolean;
  completed: boolean;
  onOpen: () => void;
  onBridgeComplete: () => void;
}

export default function AgeChapter({ chapter, unlocked, completed, onOpen, onBridgeComplete }: AgeChapterProps) {
  const reduced = useReducedMotion();
  const base = (import.meta.env.MIAODA_CLIENT_BASE_PATH || '').replace(/\/$/, '') + '/';
  return (
    <section id={`age-${chapter.age}`} className={`age-section ${!unlocked ? 'is-locked' : ''}`} aria-label={`${chapter.age}岁章节`}>
      <motion.div
        className="paper-noise"
        initial={reduced ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: .58, once: false }}
        transition={{ duration: .52 }}
      >
        <div className="chapter-topline">
          <span>Chapter {String(chapter.id).padStart(2, '0')}</span><span>{chapter.year}</span>
        </div>
        <div className="washi washi-a" /><div className="washi washi-b" />
        <motion.div className="floating-mark mark-a" animate={reduced ? undefined : { y: [0, -10, 0], rotate: [-2, 2, -2] }} transition={{ duration: 3.2, repeat: Infinity }}>♡</motion.div>
        <motion.div className="floating-mark mark-b" animate={reduced ? undefined : { scale: [1, 1.15, 1], opacity: [.55, 1, .55] }} transition={{ duration: 2.8, repeat: Infinity }}>✦</motion.div>
        <div className="chapter-copy">
          <div className="age-number">{chapter.age}<small>岁</small></div>
          <h2>{chapter.title}</h2>
          <p>{chapter.body}</p>
        </div>
        <motion.div
          className="chapter-image-card"
          animate={reduced ? undefined : { y: [0, -5, 0], rotate: [-.45, .45, -.45] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src={`${base}proto/${chapter.image}`} alt={`${chapter.age}岁：${chapter.gift}`} />
          <span className="photo-caption">{chapter.gift}</span>
        </motion.div>
        <PuppyPose age={chapter.age} />
        <p className="motion-caption">{chapter.motion}</p>
        <div className="chapter-action">
          {unlocked ? (
            completed ? (
              <div className="completed-pill"><Gift />这一岁已收好</div>
            ) : chapter.bridge ? (
              <Button type="button" onClick={onBridgeComplete} className="paper-button">{chapter.action}</Button>
            ) : (
              <Button type="button" onClick={onOpen} className="paper-button">{chapter.action}</Button>
            )
          ) : (
            <div className="locked-pill"><LockKeyhole />先完成上一岁</div>
          )}
          {completed && <motion.div animate={reduced ? undefined : { y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="continue-hint">继续往下 <ChevronDown /></motion.div>}
        </div>
      </motion.div>
    </section>
  );
}
