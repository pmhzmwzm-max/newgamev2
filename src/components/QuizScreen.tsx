import React, { useState, useEffect } from 'react';
import { ChevronLeft, Delete, Check, Flame, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { allLevelsData } from '../data/questions';

const TOTAL_BATTLE_BLOCKS = 35;

type ShotTier = 'idle' | 'normal' | 'boost' | 'super' | 'final' | 'break';

const getShotTier = (combo: number): ShotTier => {
  if (combo >= 10) return 'final';
  if (combo >= 6) return 'super';
  if (combo >= 3) return 'boost';
  if (combo >= 1) return 'normal';
  return 'idle';
};

const getRemovalCount = (combo: number, remainingBlocks: number) => {
  if (remainingBlocks <= 0) return 0;
  if (combo >= 10) return remainingBlocks;
  if (combo >= 6) return Math.min(4, remainingBlocks);
  if (combo >= 3) return Math.min(3, remainingBlocks);
  return Math.min(1, remainingBlocks);
};

const ParticleBurst = ({ tier = 1 }: { tier?: number }) => {
  const outerCount = tier === 3 ? 48 : tier === 2 ? 36 : 24;
  const innerCount = tier === 3 ? 24 : tier === 2 ? 18 : 12;
  const colors = tier === 3
    ? ['#FBBF24', '#F87171', '#60A5FA', '#34D399', '#A78BFA', '#F472B6']
    : tier === 2
    ? ['#F472B6', '#A78BFA', '#C084FC', '#E879F9', '#FBCFE8']
    : ['#FBBF24', '#F87171', '#FCA5A5', '#FDE047', '#FEF08A'];

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
      {/* Outer burst */}
      {[...Array(outerCount)].map((_, i) => {
        const angle = (i / outerCount) * Math.PI * 2;
        const radius = (tier === 3 ? 160 : tier === 2 ? 140 : 120) + Math.random() * 40;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <motion.div
            key={`outer-${i}`}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x, y, scale: Math.random() * (tier === 3 ? 2 : 1.5) + 0.5, opacity: 0 }}
            transition={{ duration: tier === 3 ? 1 : 0.8, ease: "easeOut" }}
            className="absolute w-5 h-5 rounded-full"
            style={{
              backgroundColor: colors[i % colors.length],
              boxShadow: '0 0 10px currentColor'
            }}
          />
        );
      })}
      {/* Inner burst */}
      {[...Array(innerCount)].map((_, i) => {
        const angle = (i / innerCount) * Math.PI * 2;
        const radius = (tier === 3 ? 80 : tier === 2 ? 70 : 60) + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <motion.div
            key={`inner-${i}`}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x, y, scale: Math.random() * 1 + 0.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#FFFBEB', '#FEF2F2', '#EFF6FF', '#ECFDF5'][i % 4]
            }}
          />
        );
      })}
    </div>
  );
};

const BattleStage = ({
  selectedPet,
  combo,
  shotTier,
  clearedBlocks,
  lastRemoval,
  bannerText,
  feedback,
}: {
  selectedPet: any;
  combo: number;
  shotTier: ShotTier;
  clearedBlocks: number;
  lastRemoval: number;
  bannerText: string | null;
  feedback: 'correct' | 'wrong' | null;
}) => {
  const comboLabel = bannerText ?? (combo >= 10 ? `${combo} 连击!` : combo >= 3 ? `${combo} 连击` : '');
  const beamWidthClass = shotTier === 'final'
    ? 'w-36 h-4'
    : shotTier === 'super'
    ? 'w-28 h-3.5'
    : shotTier === 'boost'
    ? 'w-22 h-3'
    : shotTier === 'normal'
    ? 'w-14 h-2.5'
    : 'w-0 h-2.5';

  const beamGlowClass = shotTier === 'final'
    ? 'from-yellow-200 via-pink-400 to-purple-500 shadow-[0_0_50px_rgba(236,72,153,0.75)]'
    : shotTier === 'super'
    ? 'from-yellow-100 via-orange-400 to-pink-500 shadow-[0_0_40px_rgba(249,115,22,0.75)]'
    : shotTier === 'boost'
    ? 'from-yellow-100 via-yellow-300 to-orange-400 shadow-[0_0_28px_rgba(251,191,36,0.65)]'
    : 'from-white/0 via-yellow-200 to-orange-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]';

  const recentClearStart = Math.max(0, clearedBlocks - lastRemoval);

  return (
    <div className={`relative w-full h-full overflow-hidden transition-all ${
      feedback === 'wrong'
        ? 'border border-red-300/70'
        : ''
    }`}>
      <div className="relative z-10 grid h-full grid-cols-[minmax(0,7fr)_minmax(178px,3fr)] gap-3 px-3 pb-2 pt-2">
        <div className="relative flex min-w-0 items-center justify-start rounded-[1.8rem] px-3 py-2">
          <motion.div
            animate={
              shotTier === 'idle' || shotTier === 'break'
                ? { width: 0, opacity: 0 }
                : shotTier === 'normal'
                ? { width: 56, opacity: 0.9 }
                : shotTier === 'boost'
                ? { width: 88, opacity: 1 }
                : shotTier === 'super'
                ? { width: 112, opacity: 1 }
                : { width: 148, opacity: 1 }
            }
            transition={{ duration: 0.25 }}
            className={`absolute right-[8%] top-1/2 z-0 -translate-y-1/2 rounded-full bg-gradient-to-r ${beamWidthClass} ${beamGlowClass} pointer-events-none`}
          />

          <motion.div
            animate={
              shotTier === 'idle' || shotTier === 'break'
                ? { opacity: 0, scale: 0.7 }
                : shotTier === 'final'
                ? { opacity: [0.4, 1, 0.75], scale: [0.8, 1.2, 1] }
                : { opacity: [0.3, 0.8, 0.55], scale: [0.8, 1.05, 1] }
            }
            transition={{ duration: 0.35 }}
            className="absolute right-[6%] top-1/2 z-0 h-16 w-16 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,236,153,0.95),rgba(251,146,60,0.22)_42%,transparent_72%)] pointer-events-none"
          />

          <div className="relative z-10 flex h-full w-full items-center justify-start">
            <div className="h-full w-full max-w-[468px]">
              <div className="grid h-full w-full grid-cols-5 grid-rows-7 gap-2">
              {Array.from({ length: TOTAL_BATTLE_BLOCKS }).map((_, index) => {
                const cleared = index < clearedBlocks;
                const justCleared = cleared && index >= recentClearStart;
                return (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={
                      cleared
                        ? justCleared
                          ? { scale: [1, 1.12, 0.15], opacity: [1, 1, 0], rotate: [0, -8, 10] }
                          : { scale: 0.15, opacity: 0 }
                        : { scale: 1, opacity: 1, rotate: 0 }
                    }
                    transition={{
                      duration: justCleared ? 0.42 : 0.2,
                      delay: justCleared ? (index - recentClearStart) * 0.05 : 0,
                      ease: 'easeOut',
                    }}
                    className={`rounded-[1rem] ${
                      cleared
                        ? 'bg-transparent shadow-none'
                        : 'bg-gradient-to-b from-yellow-100 via-yellow-300 to-orange-300 shadow-[inset_0_-4px_0_rgba(234,88,12,0.28),0_6px_12px_rgba(133,96,32,0.16)]'
                    }`}
                  />
                );
              })}
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="grid h-full grid-rows-[0.38fr_0.62fr] gap-3">
            <div className="flex items-stretch">
              <div className="flex h-full w-full items-center justify-center rounded-[1.8rem] px-2 py-2">
                <AnimatePresence mode="wait">
                  {comboLabel ? (
                    <motion.div
                      key={`${combo}-${comboLabel}`}
                      initial={{ opacity: 0, y: -10, scale: 0.86, rotate: -8 }}
                      animate={
                        combo >= 10
                          ? { opacity: 1, y: 0, scale: 1.06, rotate: 0 }
                          : combo >= 5
                          ? { opacity: 1, y: 0, scale: 1.02, rotate: 0 }
                          : { opacity: 1, y: 0, scale: 1, rotate: 0 }
                      }
                      exit={{ opacity: 0, y: -10, scale: 0.86 }}
                      transition={{ duration: 0.32, type: 'spring', bounce: 0.45 }}
                      className={`relative flex min-h-[112px] w-full items-center justify-center gap-2 rounded-[1.6rem] px-3 py-3 text-center shadow-xl border-4 ${
                        bannerText && combo < 3
                          ? 'bg-red-500 border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.28)]'
                          : combo >= 10
                          ? 'bg-white/96 border-purple-400 shadow-[0_0_28px_rgba(168,85,247,0.35)]'
                          : combo >= 5
                          ? 'bg-white/96 border-pink-400 shadow-[0_0_22px_rgba(236,72,153,0.28)]'
                          : 'bg-white/96 border-orange-300 shadow-[0_0_18px_rgba(251,146,60,0.25)]'
                      }`}
                    >
                      {!(bannerText && combo < 3) && <ParticleBurst tier={combo >= 10 ? 3 : combo >= 5 ? 2 : 1} />}
                      <div className="relative z-10 flex items-center gap-2">
                        {bannerText && combo < 3 ? null : combo >= 10 ? (
                          <Crown className="h-9 w-9 text-purple-500 animate-bounce" fill="currentColor" />
                        ) : combo >= 5 ? (
                          <Zap className="h-8 w-8 text-pink-500 animate-bounce" fill="currentColor" />
                        ) : (
                          <Flame className="h-7 w-7 text-orange-500 animate-bounce" fill="currentColor" />
                        )}
                        <span
                          className={`font-black italic drop-shadow-sm ${
                            bannerText && combo < 3
                              ? 'text-[1.45rem] text-white'
                              : combo >= 10
                              ? 'text-[1.65rem] text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'
                              : combo >= 5
                              ? 'text-[1.35rem] text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500'
                              : 'text-[1.1rem] text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600'
                          }`}
                        >
                          {comboLabel}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full w-full rounded-[1.6rem]" />
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-end justify-end rounded-[1.8rem] px-2 pb-3">
              <motion.div
                animate={
                  shotTier === 'final'
                    ? { scale: [1, 1.16, 1.04], y: [0, -10, 0] }
                    : shotTier === 'super'
                    ? { scale: [1, 1.1, 1.02], y: [0, -7, 0] }
                    : shotTier === 'boost'
                    ? { scale: [1, 1.06, 1.02], y: [0, -4, 0] }
                    : shotTier === 'normal'
                    ? { scale: [1, 1.03, 1], y: [0, -2, 0] }
                    : shotTier === 'break'
                    ? { x: [-3, 3, -3, 0], scale: [1, 0.98, 1] }
                    : { scale: 1, y: 0, x: 0 }
                }
                transition={{ duration: 0.45 }}
                className={`relative flex h-36 w-36 items-center justify-center rounded-[2.6rem] border-4 border-white/75 text-7xl shadow-2xl ${selectedPet?.color ?? 'bg-yellow-300'} ${selectedPet?.shadow ?? 'shadow-yellow-300/50'}`}
              >
                <div className="absolute -top-3 left-7 h-12 w-10 rotate-[-12deg] rounded-t-full rounded-b-lg bg-white/25" />
                <div className="absolute -top-3 right-7 h-12 w-10 rotate-[12deg] rounded-t-full rounded-b-lg bg-white/25" />
                <span className="relative z-10">{selectedPet?.emoji ?? '🍮'}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function QuizScreen({
  gradeId = '1',
  levelId,
  selectedPet,
  onFinish,
  onBack
}: {
  gradeId?: string;
  levelId: number;
  selectedPet: any;
  onFinish: (stats: any) => void;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [combo, setCombo] = useState(0);
  const [showPetCombo, setShowPetCombo] = useState(false);
  const [petComboTimeout, setPetComboTimeout] = useState<NodeJS.Timeout | null>(null);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [multiVerticalStep, setMultiVerticalStep] = useState(1); // 多重竖式当前步骤
  const [clearedBlocks, setClearedBlocks] = useState(0);
  const [lastRemoval, setLastRemoval] = useState(0);
  const [shotTier, setShotTier] = useState<ShotTier>('idle');
  const [battleBanner, setBattleBanner] = useState<string | null>(null);

  // 从新的数据源获取关卡数据
  const gradeLevels = allLevelsData[gradeId as keyof typeof allLevelsData];
  const levelInfo = gradeLevels?.[levelId];
  const questions = levelInfo?.questions || [];
  const question = questions[currentIndex];

  // 添加日志
  console.log('Current question:', currentIndex, question);

  useEffect(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setFeedback(null);
    setCombo(0);
    setShowPetCombo(false);
    setMaxCombo(0);
    setCorrectCount(0);
    setSelectedChoice(null);
    setMultiVerticalStep(1);
    setClearedBlocks(0);
    setLastRemoval(0);
    setShotTier('idle');
    setBattleBanner(null);
  }, [gradeId, levelId]);

  useEffect(() => {
    if (question && question.answerLength) {
      // 对于竖式计算类型，使用多个输入框
      const isVertical = question.type === 'vertical_addition' || question.type === 'multi_vertical';
      const newAnswers = isVertical
        ? Array(question.answerLength).fill('')
        : [''];
      console.log('Initializing answers:', newAnswers);
      setAnswers(newAnswers);
      setFeedback(null);
      setSelectedChoice(null);
      setMultiVerticalStep(1); // 重置多重竖式步骤
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!battleBanner) return;
    const timeout = setTimeout(() => setBattleBanner(null), 1200);
    return () => clearTimeout(timeout);
  }, [battleBanner]);

  const triggerPetComboMessage = (newCombo: number) => {
    if (newCombo > 0 && newCombo % 3 === 0) {
      setShowPetCombo(true);
      if (petComboTimeout) clearTimeout(petComboTimeout);
      const timeout = setTimeout(() => setShowPetCombo(false), 2000);
      setPetComboTimeout(timeout);
    }
  };

  const finishLevel = (newCorrectCount: number, newCombo: number) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    onFinish({
      accuracy: Math.round((newCorrectCount / questions.length) * 100),
      time: timeTaken,
      maxCombo: Math.max(maxCombo, newCombo),
      expGained: Math.max(1, Math.ceil(newCorrectCount / 4)),
    });
  };

  const scheduleAdvance = (newCorrectCount: number, newCombo: number) => {
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i: number) => i + 1);
      } else {
        finishLevel(newCorrectCount, newCombo);
      }
    }, 1000);
  };

  const registerCorrectAnswer = (newCombo: number) => {
    const tier = getShotTier(newCombo);
    const remainingBlocks = Math.max(0, TOTAL_BATTLE_BLOCKS - clearedBlocks);
    const removal = getRemovalCount(newCombo, remainingBlocks);
    const newCorrectCount = correctCount + 1;

    setFeedback('correct');
    setCombo(newCombo);
    setMaxCombo((m: number) => Math.max(m, newCombo));
    setCorrectCount(newCorrectCount);
    setShotTier(tier);
    setLastRemoval(removal);
    setClearedBlocks((prev) => Math.min(TOTAL_BATTLE_BLOCKS, prev + removal));

    if (newCombo === 3) setBattleBanner('强化发射开启');
    if (newCombo === 6) setBattleBanner('超级发射开启');
    if (newCombo === 10) setBattleBanner('终极清屏');

    triggerPetComboMessage(newCombo);
    scheduleAdvance(newCorrectCount, newCombo);
  };

  const registerWrongAnswer = (resetAnswers: () => void) => {
    setFeedback('wrong');
    setCombo(0);
    setShotTier('break');
    setLastRemoval(0);
    setBattleBanner('连击中断');

    setTimeout(() => {
      resetAnswers();
      setSelectedChoice(null);
      setFeedback(null);
      setShotTier('idle');
    }, 500);
  };

  // 选择题答案处理
  const handleChoiceSelect = (option: string) => {
    if (feedback === 'correct' || feedback === 'wrong') return;

    setSelectedChoice(option);

    if (option === question.answer) {
      const newCombo = combo + 1;
      registerCorrectAnswer(newCombo);
    } else {
      registerWrongAnswer(() => {});
    }
  };

  const handleKeyPress = (key: string) => {
    if (feedback === 'correct' || feedback === 'wrong') return;

    if (key === 'delete') {
      setAnswers(prev => {
        const next = [...prev];
        if (question.type === 'multi_vertical') {
          // 多重竖式：按填写顺序的逆序删除
          if (multiVerticalStep === 1) {
            if (next[1] !== '') { next[1] = ''; }
            else if (next[0] !== '') { next[0] = ''; }
          } else {
            if (next[3] !== '') { next[3] = ''; }
            else if (next[2] !== '') { next[2] = ''; }
          }
        } else if (question.type === 'vertical_addition') {
          // 竖式计算：从右到左删除
          const filledIdx = next.findIndex(val => val !== '');
          if (filledIdx !== -1) {
            next[filledIdx] = '';
          }
        } else {
          // 其他类型：删除最后一个字符
          if (next[0] && next[0].length > 0) {
            next[0] = next[0].slice(0, -1);
          }
        }
        return next;
      });
      setFeedback(null);
    } else {
      setAnswers(prev => {
        const next = [...prev];
        if (question.type === 'multi_vertical') {
          // 多重竖式：从右到左，每个格子一个数字
          if (multiVerticalStep === 1) {
            if (next[0] === '') { next[0] = key; }
            else if (next[1] === '') { next[1] = key; }
          } else {
            if (next[2] === '') { next[2] = key; }
            else if (next[3] === '') { next[3] = key; }
          }
        } else if (question.type === 'vertical_addition') {
          // 竖式计算：从右到左填写，每个格子一个数字
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i] === '') {
              next[i] = key;
              break;
            }
          }
        } else {
          // 其他类型：支持多位数输入
          const currentAnswer = next[0] || '';
          // 限制最大长度为答案长度
          if (currentAnswer.length < question.answer.length) {
            next[0] = currentAnswer + key;
          }
        }
        return next;
      });
      setFeedback(null);
    }
  };

  const checkAnswer = () => {
    const userAnswerStr = answers.join('');

    // 多重竖式计算：两步验证
    if (question.type === 'multi_vertical') {
      const firstResult = (question.num1! + question.num2!).toString();
      const finalResult = question.answer;

      if (multiVerticalStep === 1) {
        // 检查第一层：answers[1]是十位，answers[0]是个位
        const step1Answer = (answers[1] || '') + (answers[0] || '');
        if (answers[0] === '' || answers[1] === '') return; // 未填完

        if (step1Answer === firstResult) {
          setFeedback('correct');
          setTimeout(() => {
            setMultiVerticalStep(2);
            setFeedback(null);
            // 清空第二层答案位置
            setAnswers(['', '', '', '']);
          }, 600);
        } else {
          registerWrongAnswer(() => {
            setAnswers(['', '', '', '']);
          });
        }
        return;
      } else {
        // 检查第二层：answers[3]是十位，answers[2]是个位
        const step2Answer = (answers[3] || '') + (answers[2] || '');
        if (answers[2] === '' || answers[3] === '') return; // 未填完

        if (step2Answer === finalResult) {
          const newCombo = combo + 1;
          registerCorrectAnswer(newCombo);
        } else {
          registerWrongAnswer(() => {
            setAnswers((prev: string[]) => {
              const next = [...prev];
              next[2] = '';
              next[3] = '';
              return next;
            });
          });
        }
        return;
      }
    }

    // 对于非竖式计算：输入位数必须等于答案位数才判断
    // 对于竖式计算：需要填满所有格子才判断
    if (question.type === 'vertical_addition') {
      if (answers.some(a => a === '')) return;
    } else {
      // 非竖式：输入位数必须等于答案位数
      if (userAnswerStr.length !== question.answer.length) return;
    }

    if (userAnswerStr === question.answer) {
      const newCombo = combo + 1;
      registerCorrectAnswer(newCombo);
    } else {
      registerWrongAnswer(() => {
        setAnswers(Array(question.answerLength).fill(''));
      });
    }
  };

  useEffect(() => {
    // 当输入内容长度等于答案长度时自动验证
    const userAnswerStr = answers.join('');
    if (userAnswerStr.length === question.answer.length && feedback === null) {
      checkAnswer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, feedback]);

  const getActiveIndex = () => {
    if (feedback !== null) return -1;
    if (question.type === 'multi_vertical') {
      // 多重竖式：从右到左填写
      // 第一步：B(0) -> A(1)，第二步：D(2) -> C(3)
      if (multiVerticalStep === 1) {
        if (answers[0] === '') return 0; // B (个位)
        if (answers[1] === '') return 1; // A (十位)
      } else {
        if (answers[2] === '') return 2; // D (个位)
        if (answers[3] === '') return 3; // C (十位)
      }
      return -1;
    }
    if (question.type === 'vertical_addition') {
      // 竖式计算：从右到左找空位
      for (let i = answers.length - 1; i >= 0; i--) {
        if (answers[i] === '') return i;
      }
    } else {
      // 其他类型：只有一个输入框，始终返回0
      return 0;
    }
    return -1;
  };

  const activeIndex = getActiveIndex();

  const renderNumberComparison = () => {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div className="text-2xl font-bold text-gray-500 mb-6 tracking-wider">比大小</div>
        <div className="flex items-center justify-center gap-6 w-full px-4">
          <div className="flex-1 text-right text-5xl font-bold text-gray-700">{question.num1}</div>
          <motion.div
            animate={
              feedback === 'wrong' && answers[0] !== question.answer
                ? { x: [-5, 5, -5, 5, 0] }
                : { x: 0 }
            }
            transition={
              feedback === 'wrong' && answers[0] !== question.answer
                ? { duration: 0.4 }
                : { duration: 0.2 }
            }
            className={`w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center text-5xl font-bold transition-colors
              ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
              ${feedback === 'wrong' && answers[0] !== question.answer && answers[0] !== '' ? 'bg-red-100 text-red-500' : ''}
              ${0 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-lg'}
            `}
            style={{
              animation: 0 === activeIndex && feedback !== 'wrong' ? 'pulse-glow 1.2s ease-in-out infinite' : 'none'
            }}
          >
            {answers[0] || '?'}
          </motion.div>
          <div className="flex-1 text-left text-5xl font-bold text-gray-700">{question.num2}</div>
        </div>
      </div>
    );
  };

  const renderVerticalMath = () => {
    if (!question || !question.num1 || !question.num2) {
      console.error('Invalid question data:', question);
      return <div className="text-white text-2xl">题目数据错误</div>;
    }
    const maxLen = Math.max(question.num1.toString().length, question.num2.toString().length);
    const str1 = question.num1.toString().padStart(maxLen, ' ');
    const str2 = question.num2.toString().padStart(maxLen, ' ');

    // 确保 answers 数组正确初始化
    if (!answers || answers.length === 0) {
      return <div className="text-white text-2xl">加载中...</div>;
    }

    return (
      <div className="text-center flex flex-col items-end">
        <div className="flex justify-end gap-4 text-5xl font-bold text-gray-700 tracking-widest font-mono">
          {str1.split('').map((char, i) => <span key={i} className="w-8 text-center">{char}</span>)}
        </div>
        <div className="flex justify-end gap-4 text-5xl font-bold text-gray-700 mt-4 relative tracking-widest font-mono">
          <span className="absolute -left-12">{question.operator || '+'}</span>
          {str2.split('').map((char, i) => <span key={i} className="w-8 text-center">{char}</span>)}
        </div>
        <div className="w-full h-1 bg-gray-300 my-6"></div>
        <div className="flex gap-2 justify-end">
          {answers.map((ans, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.div
                key={i}
                animate={
                  feedback === 'wrong' && ans !== question.answer[i]
                    ? { x: [-5, 5, -5, 5, 0] }
                    : { x: 0 }
                }
                transition={
                  feedback === 'wrong' && ans !== question.answer[i]
                    ? { duration: 0.4 }
                    : { duration: 0.2 }
                }
                className={`w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-all
                  ${ans ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${feedback === 'wrong' && ans !== question.answer[i] && ans !== '' ? 'bg-red-100 text-red-500' : ''}
                  ${isActive ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
                style={{
                  animation: isActive && feedback !== 'wrong' ? 'pulse-glow 1.2s ease-in-out infinite' : 'none'
                }}
              >
                {ans || '?'}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // 多重竖式计算渲染（三数连加，如 23+45+12）
  const renderMultiVertical = () => {
    if (!question || !question.num1 || !question.num2 || !question.num3) {
      console.error('Invalid multi_vertical question data:', question);
      return <div className="text-white text-2xl">题目数据错误</div>;
    }

    const step = multiVerticalStep;
    const firstResult = question.num1 + question.num2;
    const finalResult = parseInt(question.answer);
    const maxLen = 2; // 两位数

    return (
      <div className="text-center flex flex-col items-end">
        {/* 第一行：num1 */}
        <div className="flex justify-end gap-3 text-4xl font-bold text-gray-700 tracking-widest font-mono">
          {question.num1.toString().padStart(maxLen, ' ').split('').map((char, i) => (
            <span key={i} className="w-7 text-center">{char === ' ' ? '' : char}</span>
          ))}
        </div>
        {/* 第二行：+ num2 */}
        <div className="flex justify-end gap-3 text-4xl font-bold text-gray-700 mt-2 relative tracking-widest font-mono">
          <span className="absolute -left-10 text-blue-500">+</span>
          {question.num2.toString().padStart(maxLen, ' ').split('').map((char, i) => (
            <span key={i} className="w-7 text-center">{char === ' ' ? '' : char}</span>
          ))}
        </div>
        {/* 第一条横线 */}
        <div className="w-full h-1 bg-gray-300 my-4"></div>
        {/* 第三行：第一层结果 AB */}
        <div className="flex gap-2 justify-end">
          {step === 1 ? (
            // 第一步：填写第一层结果
            <>
              <motion.div
                animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                  ${answers[1] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${1 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
              >
                {answers[1] || '?'}
              </motion.div>
              <motion.div
                animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                  ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${0 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
              >
                {answers[0] || '?'}
              </motion.div>
            </>
          ) : (
            // 第二步：显示已完成的第层结果
            <>
              <div className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold bg-green-100 text-green-500 shadow-inner">
                {firstResult.toString()[0]}
              </div>
              <div className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold bg-green-100 text-green-500 shadow-inner">
                {firstResult.toString()[1]}
              </div>
            </>
          )}
        </div>
        {/* 第四行：+ num3 */}
        <div className="flex justify-end gap-3 text-4xl font-bold text-gray-700 mt-3 relative tracking-widest font-mono">
          <span className="absolute -left-10 text-blue-500">+</span>
          {question.num3.toString().padStart(maxLen, ' ').split('').map((char, i) => (
            <span key={i} className="w-7 text-center">{char === ' ' ? '' : char}</span>
          ))}
        </div>
        {/* 第二条横线 */}
        <div className="w-full h-1 bg-gray-300 my-4"></div>
        {/* 第五行：第二层结果 CD */}
        <div className="flex gap-2 justify-end">
          {step === 2 ? (
            <>
              <motion.div
                animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                  ${answers[3] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${3 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
              >
                {answers[3] || '?'}
              </motion.div>
              <motion.div
                animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                  ${answers[2] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${2 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
              >
                {answers[2] || '?'}
              </motion.div>
            </>
          ) : (
            // 第一步时，第二层显示为禁用状态
            <>
              <div className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold bg-gray-50 text-gray-300 opacity-40 shadow-inner">
                ?
              </div>
              <div className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold bg-gray-50 text-gray-300 opacity-40 shadow-inner">
                ?
              </div>
            </>
          )}
        </div>
        {/* 提示文字 */}
        <div className="mt-4 text-center text-sm text-gray-400 w-full">
          {step === 1 ? `先计算 ${question.num1} + ${question.num2}` : `再计算 ${firstResult} + ${question.num3}`}
        </div>
      </div>
    );
  };

  // 输入题渲染（算式 + 答案框）
  const renderInput = () => {
    return (
      <div className="flex items-center justify-center gap-4">
        <span className="text-5xl font-black text-gray-800">{question.question}</span>
        <motion.div
          animate={
            feedback === 'wrong' && answers[0] !== question.answer
              ? { x: [-5, 5, -5, 5, 0] }
              : answers[0] && answers[0].length > 0
                ? { scale: 1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }
                : { scale: 1.1, boxShadow: "0 0 30px rgba(253,224,71,0.8)" }
          }
          transition={
            feedback === 'wrong' && answers[0] !== question.answer
              ? { duration: 0.4 }
              : answers[0] && answers[0].length > 0
                ? { duration: 0.2 }
                : { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }
          }
          className={`min-w-[80px] px-6 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-colors
            ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
            ${feedback === 'wrong' && answers[0] !== question.answer ? 'bg-red-100 text-red-500' : ''}
            ${!answers[0] || answers[0].length === 0 ? 'ring-4 ring-yellow-300 bg-yellow-50' : ''}
          `}
        >
          {answers[0] || '?'}
        </motion.div>
      </div>
    );
  };

  // 数物对应渲染
  const renderCounting = () => {
    const emojis = Array(question.count).fill(question.emoji);
    return (
      <div className="text-center w-full">
        <div className="text-2xl font-bold text-gray-500 mb-6 tracking-wider">数一数有几个？</div>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {emojis.map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              className="text-5xl"
            >
              {emoji}
            </motion.span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <span className="text-2xl font-bold text-gray-600">数量：</span>
          <motion.div
            animate={
              feedback === 'wrong' && answers[0] !== question.answer
                ? { x: [-5, 5, -5, 5, 0] }
                : answers[0] && answers[0].length > 0
                  ? { scale: 1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }
                  : { scale: 1.1, boxShadow: "0 0 30px rgba(253,224,71,0.8)" }
            }
            transition={
              feedback === 'wrong' && answers[0] !== question.answer
                ? { duration: 0.4 }
                : answers[0] && answers[0].length > 0
                  ? { duration: 0.2 }
                  : { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }
            }
            className={`min-w-[80px] px-6 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-colors
              ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
              ${feedback === 'wrong' && answers[0] !== question.answer ? 'bg-red-100 text-red-500' : ''}
              ${!answers[0] || answers[0].length === 0 ? 'ring-4 ring-yellow-300 bg-yellow-50' : ''}
            `}
          >
            {answers[0] || '?'}
          </motion.div>
        </div>
      </div>
    );
  };

  // 选择题渲染
  const renderChoice = () => {
    return (
      <div className="text-center w-full">
        <div className="text-2xl font-bold text-gray-500 mb-6 tracking-wider">选择正确答案</div>
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-4xl font-black text-gray-800">{question.question.replace('?', '')}</span>
          <motion.div
            animate={
              feedback === 'wrong' && selectedChoice !== question.answer
                ? { x: [-5, 5, -5, 5, 0] }
                : selectedChoice
                  ? { scale: 1 }
                  : { scale: 1.1, boxShadow: "0 0 30px rgba(253,224,71,0.8)" }
            }
            transition={
              feedback === 'wrong'
                ? { duration: 0.4 }
                : selectedChoice
                ? { duration: 0.2 }
                : { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }
            }
            className={`min-w-[96px] px-6 h-20 rounded-2xl flex items-center justify-center text-4xl font-black transition-colors border-4 shadow-[0_4px_0_#9ca3af]
              ${selectedChoice ? 'bg-blue-100 text-blue-700 border-blue-500' : 'bg-gray-100 text-gray-400 border-gray-300'}
              ${feedback === 'correct' ? '!bg-green-100 !text-green-600 !border-green-500 shadow-[0_4px_0_#16a34a]' : ''}
              ${feedback === 'wrong' ? '!bg-red-100 !text-red-600 !border-red-500 shadow-[0_4px_0_#dc2626]' : ''}
              ${!selectedChoice ? 'ring-4 ring-yellow-300 bg-yellow-50' : ''}
            `}
          >
            {selectedChoice || '?'}
          </motion.div>
        </div>
      </div>
    );
  };

  const renderChoiceButtons = () => {
    const options = question.options || [];
    return (
      <div className="grid grid-cols-4 gap-4">
        {options.map((option, i) => (
          <motion.button
            key={i}
            whileHover={feedback === null ? { scale: 1.02, y: -2 } : {}}
            whileTap={feedback === null ? { y: 6, scale: 0.98 } : {}}
            onClick={() => handleChoiceSelect(option)}
            disabled={feedback !== null}
            className={`h-24 rounded-2xl border-4 text-3xl font-black transition-all ${
              feedback === 'correct' && option === question.answer
                ? 'bg-green-500 text-white border-green-600 shadow-[0_6px_0_#15803d]'
                : feedback === 'wrong' && option === question.answer
                ? 'bg-green-500 text-white border-green-600 shadow-[0_6px_0_#15803d]'
                : feedback === 'wrong' && selectedChoice === option
                ? 'bg-red-500 text-white border-red-600 shadow-[0_6px_0_#b91c1c]'
                : selectedChoice === option
                ? 'bg-white text-gray-700 border-blue-500 shadow-[0_0_0_#9ca3af]'
                : 'bg-white text-gray-700 border-gray-200 shadow-[0_6px_0_#9ca3af]'
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#4facfe] to-[#00f2fe] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white shrink-0">
        <button onClick={onBack} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
          <ChevronLeft size={28} />
        </button>
        <div className="flex-1 mx-6">
          <div className="h-4 bg-white/30 rounded-full overflow-hidden relative border border-white/20">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-300 to-orange-400"
              initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
              animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="font-bold text-lg bg-white/20 px-4 py-2 rounded-full border border-white/20">{currentIndex + 1}/{questions.length}</div>
      </div>

      {/* Main Area */}
      <div className="flex-1 min-h-0 flex flex-col px-4 pb-0 pt-1 relative z-10">
        <motion.div
          key={`battle-${currentIndex}-${combo}-${clearedBlocks}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-h-0 mb-0"
        >
          <BattleStage
            selectedPet={selectedPet}
            combo={combo}
            shotTier={shotTier}
            clearedBlocks={clearedBlocks}
            lastRemoval={lastRemoval}
            bannerText={battleBanner}
            feedback={feedback}
          />
        </motion.div>

        <div className="shrink-0 bg-white/20 backdrop-blur-md rounded-t-[2rem] px-4 pt-4 pb-5">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-3xl mx-auto bg-white/95 rounded-[2rem] px-6 py-5 shadow-2xl h-[170px] flex flex-col items-center justify-center relative border-4 border-white/50 mb-4"
          >
            {question.type === 'text_to_number' ? (
              <div className="text-center w-full">
                <div className="text-2xl font-bold text-gray-500 mb-6 tracking-wider">{question.text}</div>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-xl font-bold text-gray-600">{question.label}</span>
                  <motion.div
                    animate={
                      feedback === 'wrong' && answers[0] !== question.answer
                        ? { x: [-5, 5, -5, 5, 0] }
                        : answers[0] && answers[0].length > 0
                          ? { scale: 1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }
                          : { scale: 1.15, boxShadow: "0 0 35px rgba(253,224,71,1)" }
                    }
                    transition={
                      feedback === 'wrong' && answers[0] !== question.answer
                        ? { duration: 0.4 }
                        : answers[0] && answers[0].length > 0
                          ? { duration: 0.2 }
                          : { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }
                    }
                    className={`min-w-[80px] px-4 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-colors
                      ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                      ${feedback === 'wrong' && answers[0] !== question.answer ? 'bg-red-100 text-red-500' : ''}
                      ${!answers[0] || answers[0].length === 0 ? 'ring-4 ring-yellow-300 bg-yellow-50' : ''}
                    `}
                  >
                    {answers[0] || '?'}
                  </motion.div>
                </div>
              </div>
              ) : question.type === 'number_comparison' ? (
                renderNumberComparison()
              ) : question.type === 'input' ? (
                renderInput()
              ) : question.type === 'counting' ? (
                renderCounting()
              ) : question.type === 'choice' ? (
                renderChoice()
              ) : question.type === 'multi_vertical' ? (
                renderMultiVertical()
              ) : (
                renderVerticalMath()
              )}

              {/* Correct Checkmark */}
              {feedback === 'correct' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute bottom-4"
                >
                  <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm">
                    <Check className="w-8 h-8 text-green-500" strokeWidth={4} />
                  </div>
                </motion.div>
              )}
            </motion.div>

          {question.type === 'number_comparison' ? (
            <div className="grid grid-cols-3 gap-4 px-2 py-1 max-w-md mx-auto">
              {['>', '=', '<'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleKeyPress(sym)}
                  className="bg-white rounded-[1.5rem] h-20 flex items-center justify-center text-blue-500 shadow-[0_8px_0_#e5e7eb] active:shadow-none active:translate-y-2 transition-all"
                >
                  <span className="text-6xl font-bold">{sym}</span>
                </button>
              ))}
            </div>
          ) : question.type === 'choice' ? (
            <div className="max-w-3xl mx-auto">
              {renderChoiceButtons()}
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 items-center">
              <div className="grid w-full grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="bg-white rounded-2xl h-14 w-full text-3xl font-bold text-gray-700 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="grid w-full grid-cols-5 gap-4">
                {[6, 7, 8, 9, 0].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="bg-white rounded-2xl h-14 w-full text-3xl font-bold text-gray-700 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleKeyPress('delete')}
                className="bg-white rounded-2xl h-14 w-full flex items-center justify-center text-red-400 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
              >
                <Delete size={32} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
