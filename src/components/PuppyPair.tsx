import { motion, useReducedMotion } from 'framer-motion';

interface PuppyPairProps {
  mood?: 'wave' | 'hug' | 'gift' | 'sleep';
}

export default function PuppyPair({ mood = 'wave' }: PuppyPairProps) {
  const reduced = useReducedMotion();
  return (
    <div className="puppy-stage" aria-label="小白和小鸡毛的线条动画">
      <motion.div
        className="puppy puppy-white"
        animate={reduced ? undefined : { y: [0, -7, 0], rotate: mood === 'wave' ? [0, -2, 0] : 0 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="ear left" /><span className="ear right" />
        <span className="eye left" /><span className="eye right" />
        <span className="nose" /><span className="mouth" /><span className="tail" />
        <motion.span className="paw" animate={reduced ? undefined : { rotate: [0, -16, 0] }} transition={{ duration: 2.8, repeat: Infinity }} />
      </motion.div>
      <motion.div
        className="puppy puppy-brown"
        animate={reduced ? undefined : { y: [0, -5, 0], x: mood === 'hug' ? [0, -5, 0] : 0 }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: .25 }}
      >
        <span className="ear left" /><span className="ear right" />
        <span className="eye left" /><span className="eye right" />
        <span className="nose" /><span className="mouth" /><span className="collar" /><span className="tail" />
      </motion.div>
      {mood === 'hug' && <motion.span className="puppy-heart" animate={reduced ? undefined : { y: [0, -12], opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>♡</motion.span>}
      {mood === 'gift' && <motion.span className="tiny-gift" animate={reduced ? undefined : { rotate: [-2, 2, -2] }} transition={{ duration: 2.8, repeat: Infinity }}>礼物</motion.span>}
      {mood === 'sleep' && <motion.span className="sleep-mark" animate={reduced ? undefined : { y: [0, -10], opacity: [0, 1, 0] }} transition={{ duration: 2.6, repeat: Infinity }}>z</motion.span>}
    </div>
  );
}
