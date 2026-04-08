import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Zap, BookOpen } from 'lucide-react';
import type { RewardCardModel } from '../data/growthRewards';
import GrowthRewardModal from './GrowthRewardModal';

export default function ResultScreen({
  stats,
  onBack,
  onNextLevel,
  onBeginAdventure,
  onOpenPokedex,
  hasNextLevel,
  rewardCard,
  showRewardCard,
  onCloseRewardCard,
  isLevelZeroIntroResult = false,
}: {
  stats: any;
  onBack: () => void;
  onNextLevel: () => void;
  onBeginAdventure?: () => void;
  onOpenPokedex: () => void;
  hasNextLevel: boolean;
  rewardCard: RewardCardModel | null;
  showRewardCard: boolean;
  onCloseRewardCard: () => void;
  isLevelZeroIntroResult?: boolean;
}) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getEmotionalText = () => {
    if (stats.accuracy === 100 && stats.maxCombo >= 10) return '超神！';
    if (stats.accuracy === 100) return '完美过关！';
    if (stats.time < 30) return '快如闪电！';
    return '闯关成功！';
  };

  return (
    <div className="w-full h-full bg-[#a881f3] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-wrap gap-10 justify-center items-center">
         {[...Array(20)].map((_, i) => <span key={i} className="text-6xl">⭐</span>)}
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-16 pt-16 pb-20">
        {/* Title */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="text-5xl font-black text-white mb-10 tracking-wider text-center"
          style={{ textShadow: '0 4px 0 #ff7a7a, 0 8px 10px rgba(0,0,0,0.2)' }}
        >
          {getEmotionalText()}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md flex flex-col gap-5"
        >
          <div className="bg-white/90 backdrop-blur rounded-2xl p-5 flex items-center justify-between shadow-lg relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 text-2xl">
                <Clock />
              </div>
              <span className="text-gray-600 font-bold text-xl">闯关时间</span>
            </div>
            <span className="text-4xl font-black text-orange-500">{formatTime(stats.time)}</span>
            {stats.time < 30 && (
              <div className="absolute -top-4 -right-4 bg-red-400 text-white text-sm font-black px-4 py-1.5 rounded-full transform rotate-12 border-2 border-white shadow-md">
                快如闪电
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-5 flex items-center justify-between shadow-lg relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 text-2xl">
                <CheckCircle />
              </div>
              <span className="text-gray-600 font-bold text-xl">正确率</span>
            </div>
            <span className="text-4xl font-black text-orange-500">{stats.accuracy}%</span>
            {stats.accuracy === 100 && (
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-white text-sm font-black px-4 py-1.5 rounded-full transform rotate-12 border-2 border-white shadow-md">
                Perfect!
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-5 flex items-center justify-between shadow-lg relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 text-2xl">
                <Zap />
              </div>
              <span className="text-gray-600 font-bold text-xl">最高连击</span>
            </div>
            <span className="text-4xl font-black text-orange-500">{stats.maxCombo}连击</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-md flex flex-col gap-4 mt-10"
        >
          {isLevelZeroIntroResult ? (
            <motion.button
              onClick={onBeginAdventure}
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.03, 1],
                boxShadow: [
                  '0 12px 0 #b45309, 0 24px 30px rgba(251,146,60,0.28)',
                  '0 18px 0 #b45309, 0 34px 42px rgba(251,146,60,0.38)',
                  '0 12px 0 #b45309, 0 24px 30px rgba(251,146,60,0.28)',
                ],
              }}
              transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full rounded-full border-4 border-white/80 bg-[linear-gradient(180deg,#ffcf63_0%,#ff972f_52%,#ff7b22_100%)] py-5 text-3xl font-black tracking-[0.12em] text-white"
              style={{ textShadow: '0 3px 0 rgba(146,64,14,0.55)' }}
            >
              开始冒险
            </motion.button>
          ) : (
            <>
              {hasNextLevel && (
                <button
                  onClick={onNextLevel}
                  className="w-full bg-[#2cc4f5] text-white text-2xl font-black py-5 rounded-full shadow-[0_10px_0_#1ba4d0] active:shadow-none active:translate-y-[10px] transition-all"
                >
                  下一关
                </button>
              )}
              <button
                onClick={onBack}
                className="w-full bg-white text-gray-700 text-xl font-bold py-4 rounded-full shadow-[0_8px_0_#e5e7eb] active:shadow-none active:translate-y-[8px] transition-all border-2 border-gray-100"
              >
                返回路线
              </button>
              <button
                onClick={onOpenPokedex}
                className="w-full text-white/80 text-lg font-bold py-3 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                查看图鉴 <BookOpen size={20} />
              </button>
            </>
          )}
        </motion.div>
      </div>

      <GrowthRewardModal
        isOpen={showRewardCard}
        reward={rewardCard}
        onClose={onCloseRewardCard}
        onViewPokedex={() => {
          onCloseRewardCard();
          onOpenPokedex();
        }}
      />
    </div>
  );
}
