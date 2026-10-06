import { useRef, useState } from 'react';
import { ArrowDown, Bug, ChevronLeft, Music2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgeChapter from '@/components/AgeChapter';
import BirthdayRoom from '@/components/BirthdayRoom';
import CoverScene from '@/components/CoverScene';
import MemoryShow from '@/components/MemoryShow';
import PuppyPair from '@/components/PuppyPair';
import UnlockSheet from '@/components/UnlockSheet';
import { CHAPTERS, type IChapter } from '@/data/chapters';
import { store } from '@/lib/storage';

export default function HomePage() {
  const [roomEntered, setRoomEntered] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState<number[]>(() => store.get<number[]>('completed', []));
  const [activeChapter, setActiveChapter] = useState<IChapter | null>(null);
  const [memoryDone, setMemoryDone] = useState(() => store.get('memoryDone', false));
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const appRef = useRef<HTMLElement | null>(null);
  const [debugSkipPasswords, setDebugSkipPasswords] = useState(() => store.get('debugSkipPasswords', false));

  const maxUnlocked = debugSkipPasswords ? 25 : completed.length === 0 ? 1 : Math.min(25, Math.max(...completed) + 1);
  const completeChapter = (chapter: IChapter) => {
    const next = completed.includes(chapter.id) ? completed : [...completed, chapter.id];
    setCompleted(next);
    store.set('completed', next);
    setActiveChapter(null);
    window.setTimeout(() => document.getElementById(`age-${Math.min(25, chapter.age + 1)}`)?.scrollIntoView({ behavior: 'auto' }), 200);
  };

  const toggleMusic = () => {
    const base = (import.meta.env.MIAODA_CLIENT_BASE_PATH || '').replace(/\/$/, '') + '/';
    const audio = audioRef.current ?? new Audio(`${base}audio/he-ni-yu-jiayun.m4a`);
    audioRef.current = audio;
    audio.loop = true;
    audio.volume = 0.45;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
      return;
    }
    void audio.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false));
  };

  const backToRoom = () => {
    setRoomEntered(false);
    setStarted(false);
    window.setTimeout(() => appRef.current?.scrollTo({ top: 0, behavior: 'auto' }), 0);
  };

  const replayFromStart = () => {
    setStarted(true);
    document.getElementById('age-1')?.scrollIntoView({ behavior: 'auto' });
  };
  const toggleDebugPasswords = () => {
    const next = !debugSkipPasswords;
    setDebugSkipPasswords(next);
    store.set('debugSkipPasswords', next);
  };

  return (
    <main className="birthday-app" ref={appRef}>
      {!roomEntered && <BirthdayRoom onEnter={() => setRoomEntered(true)} />}
      <div className={!roomEntered ? 'birthday-content room-hidden' : 'birthday-content'}>
        <button type="button" className="back-room-button" onClick={backToRoom} aria-label="返回生日房间"><ChevronLeft /></button>
        <button type="button" className={`global-music-fab is-visible ${musicOn ? 'is-on' : ''}`} onClick={toggleMusic} aria-label={musicOn ? '暂停音乐' : '播放音乐'}>
          <Music2 />
        </button>
      <section id="cover" className="cover-section">
        <CoverScene />
        <div className="cover-paper">
          <div className="cover-meta"><span>给缤的</span><span>2001—2026</span></div>
          <div className="cover-copy-panel">
            <div>
              <p className="cover-kicker">每岁生日祝福</p>
              <h1>没能陪伴你长大<br />这次都补给你！</h1>
              <p className="cover-copy">从一岁开始，每拆开一份礼物，就解锁下一页。</p>
            </div>
          </div>
          <PuppyPair mood="hug" />
          <div className="cover-actions cover-actions-compact">
            <Button type="button" className="paper-button" onClick={() => { setStarted(true); document.getElementById('age-1')?.scrollIntoView({ behavior: 'smooth' }); }}>开始重新长大 <ArrowDown /></Button>
            <Button type="button" variant="outline" className="debug-toggle" onClick={toggleDebugPasswords} aria-pressed={debugSkipPasswords}>
              <Bug />调试：{debugSkipPasswords ? '密码已关闭' : '密码已开启'}
            </Button>
          </div>
          {completed.length > 0 && <button type="button" className="continue-link" onClick={() => document.getElementById(`age-${Math.min(25, maxUnlocked)}`)?.scrollIntoView({ behavior: 'smooth' })}>继续上次看到的地方</button>}
        </div>
      </section>

      <div className={!started && completed.length === 0 ? 'chapters muted-before-start' : 'chapters'}>
        {CHAPTERS.map((chapter) => (
          <AgeChapter key={chapter.id} chapter={chapter} unlocked={debugSkipPasswords || chapter.id <= maxUnlocked || completed.includes(chapter.id)} completed={debugSkipPasswords || completed.includes(chapter.id)} onOpen={() => debugSkipPasswords ? completeChapter(chapter) : setActiveChapter(chapter)} onBridgeComplete={() => completeChapter(chapter)} />
        ))}
      </div>

      <MemoryShow enabled={debugSkipPasswords || completed.includes(25)} onDone={() => { setMemoryDone(true); store.set('memoryDone', true); }} />

      <section id="finale" className={`finale-section ${!memoryDone ? 'is-locked' : ''}`}>
        <div className="finale-card">
          <p>FINAL CHAPTER</p>
          <h2>宝宝！25岁生日快乐</h2>
          <PuppyPair mood="gift" />
          <blockquote>前面的生日，是我想象着陪你走过。<br />从现在开始，未来的每一岁我都在你身边</blockquote>
          <div className="finale-dots" aria-label={`${completed.length}个章节已完成`}>{CHAPTERS.map((chapter) => <span key={chapter.id} className={completed.includes(chapter.id) ? 'done' : ''} />)}</div>
          <Button type="button" variant="outline" onClick={replayFromStart}><RotateCcw />从头再看一次</Button>
          {!memoryDone && <p className="finale-lock">看完回忆放映厅后，终章才会打开。</p>}
        </div>
      </section>

      <UnlockSheet key={activeChapter?.id ?? 'closed'} chapter={activeChapter} open={Boolean(activeChapter)} onClose={() => setActiveChapter(null)} onSuccess={() => activeChapter && completeChapter(activeChapter)} />
      </div>
    </main>
  );
}
