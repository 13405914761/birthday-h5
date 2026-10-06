import { motion, useReducedMotion } from 'framer-motion';
import { Image } from '@/components/ui/image';

interface PuppyPoseProps {
  age: number;
}

export default function PuppyPose({ age }: PuppyPoseProps) {
  const reduced = useReducedMotion();
  const base = (import.meta.env.MIAODA_CLIENT_BASE_PATH || '').replace(/\/$/, '') + '/';
  const poseIndex = ((age - 1) % 9) + 1;

  return (
    <motion.div
      className="chapter-puppy-pose"
      aria-label={`线条小狗动作 ${poseIndex}`}
      animate={reduced ? undefined : { y: [0, -5, 0], rotate: [-.8, .8, -.8] }}
      transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Image
        className="chapter-puppy-image"
        src={`${base}puppy-poses/pose-${String(poseIndex).padStart(2, '0')}-cutout.png`}
        alt={`线条小狗动作 ${poseIndex}`}
      />
    </motion.div>
  );
}
