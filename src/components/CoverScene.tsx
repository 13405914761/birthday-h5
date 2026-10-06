import { motion, useReducedMotion } from 'framer-motion';

export default function CoverScene() {
  const reduced = useReducedMotion();
  const base = (import.meta.env.MIAODA_CLIENT_BASE_PATH || '').replace(/\/$/, '') + '/';
  return (
    <div className="cover-scene" aria-hidden="true">
      <motion.img
        className="cover-scene-image"
        src={`${base}cover/wheat-puppies.png`}
        alt=""
        animate={reduced ? undefined : { scale: [1.035, 1.065, 1.035], x: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="wind-wash wind-one" />
      <div className="wind-wash wind-two" />
      <div className="wheat-wave wheat-back" />
      <div className="wheat-wave wheat-front" />
      <motion.div className="puppy-fur fur-brown" animate={reduced ? undefined : { rotate: [-2, 3, -2], x: [0, 2, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="puppy-fur fur-white" animate={reduced ? undefined : { rotate: [2, -3, 2], x: [0, -2, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="puppy-ear ear-brown" animate={reduced ? undefined : { rotate: [0, 7, -2, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="puppy-ear ear-white" animate={reduced ? undefined : { rotate: [0, -6, 2, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="cover-scene-fade" />
    </div>
  );
}
