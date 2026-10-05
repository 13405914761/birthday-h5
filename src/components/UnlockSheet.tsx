import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LockKeyhole, Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { IChapter } from '@/data/chapters';

interface UnlockSheetProps {
  chapter: IChapter | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UnlockSheet({ chapter, open, onClose, onSuccess }: UnlockSheetProps) {
  const [value, setValue] = useState('');
  const [tries, setTries] = useState(0);
  const [success, setSuccess] = useState(false);
  const reduced = useReducedMotion();

  if (!chapter) return null;

  const closeSheet = () => {
    setValue('');
    setTries(0);
    setSuccess(false);
    onClose();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (value.trim() === chapter.password) {
      setSuccess(true);
      window.setTimeout(onSuccess, reduced ? 250 : 1100);
    } else {
      setTries((current) => current + 1);
      setValue('');
    }
  };

  const hint = tries >= 3
    ? `最终提示：密码就在${chapter.age}岁礼物包装卡上，是三位数字。`
    : tries >= 2
      ? `再看看“${chapter.gift}”包装上的小卡片。`
      : '密码不对，再靠近礼物看看。';

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="presentation">
          <motion.section
            className="unlock-sheet"
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={success && !reduced ? { scale: [1, 1.025, 1] } : { y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unlock-title"
          >
            <button type="button" className="sheet-close" aria-label="关闭密码卡片" onClick={closeSheet}><X /></button>
            <div className="ticket-dash" />
            {success ? (
              <div className="success-state" aria-live="polite">
                <motion.div className="stamp" initial={{ scale: 2, rotate: -18, opacity: 0 }} animate={{ scale: 1, rotate: -8, opacity: 1 }}>已解锁</motion.div>
                <h2 id="unlock-title">这一岁，收好啦</h2>
                <p>小白和小鸡毛正在为你打开下一页。</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <LockKeyhole className="sheet-icon" aria-hidden="true" />
                <p className="sheet-kicker">{chapter.age}岁 · {chapter.gift}</p>
                <h2 id="unlock-title">包装上的密码是什么？</h2>
                <p>输入三位数字，才能继续往下长大。</p>
                <Input
                  value={value}
                  onChange={(event) => setValue(event.target.value.replace(/\D/g, '').slice(0, 3))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="三位数字密码"
                  className={tries > 0 ? 'password-input error' : 'password-input'}
                  placeholder="· · ·"
                />
                {tries > 0 && <motion.p className="hint" initial={{ x: -8 }} animate={{ x: [0, 6, -5, 0] }}><Lightbulb />{hint}</motion.p>}
                <Button type="submit" className="unlock-submit">打开下一岁</Button>
              </form>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
