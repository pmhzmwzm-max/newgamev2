import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Zap, Sparkles, BookOpen, Lock } from 'lucide-react';
import { petsData } from '../data/pets';

export default function ResultScreen({ stats, puzzlePieces, onBack, onNextLevel, onOpenPokedex, hasNextLevel }: { stats: any, puzzlePieces: number, onBack: () => void, onNextLevel: () => void, onOpenPokedex: () => void, hasNextLevel: boolean }) {
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

  // 计算下一个可成长的宠物
  const getNextPet = () => {
    return petsData.find(pet => pet.requiredPieces > puzzlePieces);
  };

  // 计算已成长解锁的宠物
  const getUnlockedPets = () => {
    return petsData.filter(pet => pet.requiredPieces <= puzzlePieces);
  };

  const nextPet = getNextPet();
  const unlockedPets = getUnlockedPets();
  const currentProgress = puzzlePieces % 5; // 当前成长阶段的经验进度
  const progressToNext = nextPet ? nextPet.requiredPieces - puzzlePieces : 0;
  const expGained = stats.expGained ?? 1;

  return (
    <div className="w-full h-full bg-[#a881f3] flex flex-col items-center py-10 px-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-wrap gap-10 justify-center items-center">
         {[...Array(20)].map((_, i) => <span key={i} className="text-6xl">⭐</span>)}
      </div>

      {/* Title - 放在最上方 */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="text-5xl font-black text-white mb-6 tracking-wider text-center"
        style={{ textShadow: '0 4px 0 #ff7a7a, 0 8px 10px rgba(0,0,0,0.2)' }}
      >
        {getEmotionalText()}
      </motion.div>

      {/* Core Reward: Experience with Pet Growth Preview */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
        className="flex items-center gap-6 mb-6 z-10"
      >
        {/* 经验奖励图标 */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg border-3 border-white relative z-10 transform rotate-12">
            <Sparkles size={32} className="text-white" fill="currentColor" />
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 font-black text-sm px-2 py-1 rounded-full border-2 border-white z-20 shadow-md">
            +{expGained}
          </div>
        </div>

        {/* 下一个宠物剪影 */}
        {nextPet && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-20 h-20 ${nextPet.color} rounded-2xl flex items-center justify-center shadow-lg border-3 border-white/60 relative overflow-hidden`}>
                <div className="text-5xl filter brightness-0 opacity-50">{nextPet.emoji}</div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Lock className="text-white w-7 h-7" />
                </div>
              </div>
              {/* 进度环 */}
              <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeWidth="4" strokeDasharray={`${(currentProgress / 5) * 100} 100`} />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="text-white font-bold text-lg">{nextPet.name}</div>
              <div className="text-white/70 text-sm">再获得 {progressToNext} 点经验可成长</div>
              <div className="flex gap-1.5 mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < currentProgress ? 'bg-yellow-300' : 'bg-white/30'}`} />
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md flex flex-col gap-5 z-10"
      >
        <div className="bg-white/90 backdrop-blur rounded-2xl p-5 flex items-center justify-between shadow-lg relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-500 text-2xl">
              <Sparkles />
            </div>
            <span className="text-gray-600 font-bold text-xl">获得经验</span>
          </div>
          <span className="text-4xl font-black text-emerald-500">+{expGained}</span>
        </div>

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
        className="w-full max-w-md flex flex-col gap-4 z-10 mt-8"
      >
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
      </motion.div>
    </div>
  );
}
