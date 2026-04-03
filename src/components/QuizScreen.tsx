import React, { useState, useEffect } from 'react';
import { ChevronLeft, Delete, Check, Flame, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { allLevelsData } from '../data/questions';

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

  // 从新的数据源获取关卡数据
  const gradeLevels = allLevelsData[gradeId as keyof typeof allLevelsData];
  const levelInfo = gradeLevels?.[levelId];
  const questions = levelInfo?.questions || [];
  const question = questions[currentIndex];

  // 添加日志
  console.log('Current question:', currentIndex, question);

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

  // 选择题答案处理
  const handleChoiceSelect = (option: string) => {
    if (feedback === 'correct' || feedback === 'wrong') return;

    setSelectedChoice(option);

    if (option === question.answer) {
      setFeedback('correct');
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m: number) => Math.max(m, newCombo));
      if (newCombo > 0 && newCombo % 3 === 0) {
        setShowPetCombo(true);
        if (petComboTimeout) clearTimeout(petComboTimeout);
        const timeout = setTimeout(() => setShowPetCombo(false), 2000);
        setPetComboTimeout(timeout);
      }
      setCorrectCount((c: number) => c + 1);

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i: number) => i + 1);
        } else {
          const timeTaken = Math.floor((Date.now() - startTime) / 1000);
          onFinish({
            accuracy: Math.round(((correctCount + 1) / questions.length) * 100),
            time: timeTaken,
            maxCombo: Math.max(maxCombo, newCombo)
          });
        }
      }, 1000);
    } else {
      setFeedback('wrong');
      setCombo(0);
      setTimeout(() => {
        setSelectedChoice(null);
        setFeedback(null);
      }, 500);
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
          setFeedback('wrong');
          setTimeout(() => {
            setAnswers(['', '', '', '']);
            setFeedback(null);
          }, 500);
        }
        return;
      } else {
        // 检查第二层：answers[3]是十位，answers[2]是个位
        const step2Answer = (answers[3] || '') + (answers[2] || '');
        if (answers[2] === '' || answers[3] === '') return; // 未填完

        if (step2Answer === finalResult) {
          setFeedback('correct');
          const newCombo = combo + 1;
          setCombo(newCombo);
          setMaxCombo((m: number) => Math.max(m, newCombo));
          if (newCombo > 0 && newCombo % 3 === 0) {
            setShowPetCombo(true);
            if (petComboTimeout) clearTimeout(petComboTimeout);
            const timeout = setTimeout(() => setShowPetCombo(false), 2000);
            setPetComboTimeout(timeout);
          }
          setCorrectCount((c: number) => c + 1);

          setTimeout(() => {
            if (currentIndex < questions.length - 1) {
              setCurrentIndex((i: number) => i + 1);
            } else {
              const timeTaken = Math.floor((Date.now() - startTime) / 1000);
              onFinish({
                accuracy: Math.round(((correctCount + 1) / questions.length) * 100),
                time: timeTaken,
                maxCombo: Math.max(maxCombo, newCombo)
              });
            }
          }, 1000);
        } else {
          setFeedback('wrong');
          setCombo(0);
          setTimeout(() => {
            setAnswers((prev: string[]) => { prev[2] = ''; prev[3] = ''; return [...prev]; });
            setFeedback(null);
          }, 500);
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
      setFeedback('correct');
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m: number) => Math.max(m, newCombo));
      if (newCombo > 0 && newCombo % 3 === 0) {
        setShowPetCombo(true);
        if (petComboTimeout) clearTimeout(petComboTimeout);
        // 2秒后开始消失
        const timeout = setTimeout(() => setShowPetCombo(false), 2000);
        setPetComboTimeout(timeout);
      }
      setCorrectCount((c: number) => c + 1);

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i: number) => i + 1);
        } else {
          const timeTaken = Math.floor((Date.now() - startTime) / 1000);
          onFinish({
            accuracy: Math.round(((correctCount + 1) / questions.length) * 100),
            time: timeTaken,
            maxCombo: Math.max(maxCombo, newCombo)
          });
        }
      }, 1000);
    } else {
      setFeedback('wrong');
      setCombo(0);
      setTimeout(() => {
        setAnswers(Array(question.answerLength).fill(''));
        setFeedback(null);
      }, 500);
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
    const options = question.options || [];
    return (
      <div className="text-center w-full">
        <div className="text-2xl font-bold text-gray-500 mb-6 tracking-wider">选择正确答案</div>
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-4xl font-black text-gray-800">{question.question}</span>
          <motion.div
            animate={
              feedback === 'wrong' && selectedChoice !== question.answer
                ? { x: [-5, 5, -5, 5, 0] }
                : selectedChoice
                  ? { scale: 1 }
                  : { scale: 1.1, boxShadow: "0 0 30px rgba(253,224,71,0.8)" }
            }
            transition={
              feedback === 'wrong' ? { duration: 0.4 } : { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }
            }
            className={`min-w-[80px] px-6 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-colors
              ${selectedChoice ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
              ${feedback === 'correct' ? 'bg-green-100 text-green-500' : ''}
              ${feedback === 'wrong' ? 'bg-red-100 text-red-500' : ''}
              ${!selectedChoice ? 'ring-4 ring-yellow-300 bg-yellow-50' : ''}
            `}
          >
            {selectedChoice || '?'}
          </motion.div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {options.map((option, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoiceSelect(option)}
              disabled={feedback !== null}
              className={`py-4 px-6 text-2xl font-bold rounded-2xl transition-all border-4 ${
                feedback === 'correct' && option === question.answer
                  ? 'bg-green-500 text-white border-green-600 shadow-[0_4px_0_#16a34a]'
                  : feedback === 'wrong' && option === question.answer
                  ? 'bg-green-500 text-white border-green-600 shadow-[0_4px_0_#16a34a]'
                  : feedback === 'wrong' && selectedChoice === option
                  ? 'bg-red-500 text-white border-red-600 shadow-[0_4px_0_#dc2626]'
                  : selectedChoice === option
                  ? 'bg-blue-500 text-white border-blue-600 shadow-[0_4px_0_#1d4ed8]'
                  : 'bg-white text-gray-700 border-gray-200 shadow-[0_4px_0_#d1d5db] hover:border-blue-300'
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#4facfe] to-[#00f2fe] flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between p-5 text-white">
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

      {/* Combo Display */}
      <AnimatePresence>
        {combo >= 3 && (
          <motion.div
            key={combo}
            initial={{ opacity: 0, y: -20, scale: 0.5, rotate: -15 }}
            animate={
              combo >= 10
                ? { opacity: 1, y: 0, scale: 1.2, rotate: 0 }
                : combo >= 5
                  ? { opacity: 1, y: 0, scale: 1.1, rotate: 0 }
                  : { opacity: 1, y: 0, scale: 1, rotate: 0 }
            }
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.7 }}
            className={`absolute top-16 right-4 flex items-center gap-2 z-20 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl border-4 ${
              combo >= 10 ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)]' :
              combo >= 5 ? 'border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]' :
              'border-orange-300 shadow-[0_0_15px_rgba(253,186,116,0.5)]'
            }`}
          >
            <ParticleBurst tier={combo >= 10 ? 3 : combo >= 5 ? 2 : 1} />
            <div className="relative z-10 flex items-center gap-2">
              {combo >= 10 ? <Crown className="text-purple-500 w-12 h-12 animate-bounce" fill="currentColor" /> :
               combo >= 5 ? <Zap className="text-pink-500 w-10 h-10 animate-bounce" fill="currentColor" /> :
               <Flame className="text-orange-500 w-8 h-8 animate-bounce" fill="currentColor" />}
              <span className={`font-black italic drop-shadow-md ${
                combo >= 10 ? 'text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500' :
                combo >= 5 ? 'text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500' :
                'text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600'
              }`}>
                {combo} 连击!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {/* Pet Combo Animation */}
        <AnimatePresence mode="wait">
          {showPetCombo && selectedPet && (
            <motion.div
              key={`pet-${combo}`}
              initial={{ x: 200, opacity: 0, scale: 0.5, rotate: 30 }}
              animate={{ x: 0, opacity: 1, scale: 0.8, rotate: -5 }}
              exit={{ x: 200, opacity: 0, scale: 0.5, rotate: 30 }}
              transition={{ type: 'spring', bounce: 0.6, duration: 0.8, exit: { duration: 0.5 } }}
              className="absolute bottom-24 right-8 z-50 flex flex-col items-end pointer-events-none"
            >
              {/* Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
                className="relative bg-white text-orange-500 font-black px-5 py-2.5 rounded-[2rem] rounded-br-sm shadow-2xl mb-3 text-lg border-4 border-orange-200"
              >
                {combo >= 12 ? "你简直是天才！" : combo >= 9 ? "太不可思议了！" : combo >= 6 ? "哇！手速太快了！" : "干得漂亮！"}
                {/* Tail */}
                <div className="absolute -bottom-4 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-t-[16px] border-t-white border-r-[10px] border-r-transparent drop-shadow-md"></div>
              </motion.div>

              {/* Pet - 放大图标 */}
              <motion.div
                animate={{ y: -10 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" }}
                className={`w-28 h-28 rounded-full ${selectedPet.color} flex items-center justify-center text-6xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-4 border-white`}
              >
                {selectedPet.emoji}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg bg-white/95 rounded-[2rem] p-10 shadow-2xl min-h-[280px] flex flex-col items-center justify-center relative border-4 border-white/50"
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
      </div>

      {/* Numpad */}
      <div className="bg-white/20 backdrop-blur-md rounded-t-[2rem] p-6 pb-10">
        {question.type === 'number_comparison' ? (
          <div className="grid grid-cols-3 gap-5 px-4 py-2">
            {['>', '=', '<'].map((sym) => (
              <button
                key={sym}
                onClick={() => handleKeyPress(sym)}
                className="bg-white rounded-[1.5rem] h-24 flex items-center justify-center text-blue-500 shadow-[0_8px_0_#e5e7eb] active:shadow-none active:translate-y-2 transition-all"
              >
                <span className="text-6xl font-bold">{sym}</span>
              </button>
            ))}
          </div>
        ) : question.type === 'choice' ? (
          <div className="text-center text-white/80 py-8">
            <span className="text-xl font-bold">👆 点击上方选项作答</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="bg-white rounded-2xl h-16 w-20 text-3xl font-bold text-gray-700 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-4">
              {[6, 7, 8, 9, 0].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="bg-white rounded-2xl h-16 w-20 text-3xl font-bold text-gray-700 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleKeyPress('delete')}
              className="bg-white rounded-2xl h-16 flex items-center justify-center text-red-400 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
              style={{ width: 'calc(5 * 80px + 4 * 16px)' }}
            >
              <Delete size={32} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
