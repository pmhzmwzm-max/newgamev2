/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, X } from 'lucide-react';
import { petsData } from '../data/pets';

interface PetUnlockModalProps {
  isOpen: boolean;
  petId: number;
  selectedPetId: number;
  onClose: () => void;
  onSetAsPartner: (id: number) => void;
  onViewPokedex: () => void;
}

export default function PetUnlockModal({
  isOpen,
  petId,
  selectedPetId,
  onClose,
  onSetAsPartner,
  onViewPokedex
}: PetUnlockModalProps) {
  const pet = petsData.find(p => p.id === petId);
  if (!pet) return null;

  const isCurrentPartner = selectedPetId === petId;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-blue-900/90 backdrop-blur-md"
          onClick={onClose}
        >
          {/* 背景星星动画 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 1000,
                  y: -20,
                  rotate: 0,
                  opacity: 0
                }}
                animate={{
                  y: 800,
                  rotate: 360,
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute text-2xl"
              >
                {['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </div>

          {/* 恭喜文字 - 3秒后渐出 */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="absolute top-16 text-center z-10"
          >
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 3, duration: 0.5 }}
              className="text-6xl mb-4"
            >
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block"
              >
                🎉
              </motion.span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 3, duration: 0.5 }}
              className="text-4xl font-black text-white tracking-wider"
              style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 4px 0 rgba(0,0,0,0.3)'
              }}
            >
              伙伴成长完成！
            </motion.h1>
          </motion.div>

          {/* 卡片容器 */}
          <motion.div
            initial={{
              scale: 0,
              rotate: -720,
              y: -200,
              opacity: 0
            }}
            animate={{
              scale: 1,
              rotate: 0,
              y: 0,
              opacity: 1
            }}
            transition={{
              type: 'spring',
              bounce: 0.3,
              duration: 1.2,
              delay: 0.3
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            {/* 卡片外层光晕 */}
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 30px ${pet.id === 0 ? 'rgba(251,191,36,0.5)' : pet.id === 1 ? 'rgba(251,146,60,0.5)' : pet.id === 2 ? 'rgba(96,165,250,0.5)' : pet.id === 3 ? 'rgba(34,197,94,0.5)' : pet.id === 4 ? 'rgba(250,204,21,0.5)' : 'rgba(168,85,247,0.5)'}`,
                  `0 0 60px ${pet.id === 0 ? 'rgba(251,191,36,0.8)' : pet.id === 1 ? 'rgba(251,146,60,0.8)' : pet.id === 2 ? 'rgba(96,165,250,0.8)' : pet.id === 3 ? 'rgba(34,197,94,0.8)' : pet.id === 4 ? 'rgba(250,204,21,0.8)' : 'rgba(168,85,247,0.8)'}`,
                  `0 0 30px ${pet.id === 0 ? 'rgba(251,191,36,0.5)' : pet.id === 1 ? 'rgba(251,146,60,0.5)' : pet.id === 2 ? 'rgba(96,165,250,0.5)' : pet.id === 3 ? 'rgba(34,197,94,0.5)' : pet.id === 4 ? 'rgba(250,204,21,0.5)' : 'rgba(168,85,247,0.5)'}`,
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`w-80 rounded-[2.5rem] p-1 bg-gradient-to-br from-white/40 via-white/20 to-white/10`}
            >
              {/* 卡片主体 */}
              <div className={`w-full rounded-[2.25rem] overflow-hidden bg-gradient-to-br ${pet.color} relative`}>
                {/* 装饰性背景 */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 text-6xl">✨</div>
                  <div className="absolute top-8 right-6 text-4xl">⭐</div>
                  <div className="absolute bottom-16 left-6 text-3xl">🌟</div>
                  <div className="absolute bottom-8 right-4 text-5xl">💫</div>
                </div>

                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-20 hover:bg-white/40 transition-colors"
                >
                  <X size={20} />
                </button>

                {/* 宠物展示区 */}
                <div className="pt-12 pb-6 px-6">
                  {/* 宠物大图标 */}
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-40 h-40 mx-auto bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50 mb-6"
                  >
                    <img
                      src={pet.image}
                      alt={pet.name}
                      draggable={false}
                      className="h-[78%] w-[78%] select-none object-contain drop-shadow-[0_12px_24px_rgba(255,255,255,0.18)]"
                    />
                  </motion.div>

                  {/* 宠物名称 */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                  >
                    <h2 className="text-3xl font-black text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      {pet.name}
                    </h2>
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 1 + i * 0.1, type: 'spring' }}
                        >
                          <Sparkles size={16} className="text-yellow-200" fill="currentColor" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* 描述 */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 mb-4"
                  >
                    <p className="text-white text-center font-medium leading-relaxed">
                      {pet.description}
                    </p>
                  </motion.div>

                  {/* 标签 */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4, type: 'spring' }}
                    className="flex justify-center gap-2 mb-4"
                  >
                    <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-white text-sm font-bold">
                      #{pet.id + 1} 号伙伴
                    </span>
                    <span className="px-3 py-1 bg-yellow-400/80 rounded-full text-yellow-900 text-sm font-bold">
                      累计 {pet.requiredPieces} 点经验
                    </span>
                  </motion.div>
                </div>

                {/* 按钮区域 */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="px-6 pb-6 flex flex-col gap-3"
                >
                  {!isCurrentPartner ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetAsPartner(petId);
                        onClose();
                      }}
                      className="w-full bg-white text-emerald-600 text-xl font-black py-4 rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_rgba(0,0,0,0.15)] active:translate-y-[4px] transition-all flex items-center justify-center gap-2 border-2 border-emerald-400 cursor-pointer"
                    >
                      <Sparkles size={22} className="text-emerald-500" />
                      设为出战伙伴
                    </motion.button>
                  ) : (
                    <div className="w-full bg-emerald-100/80 backdrop-blur-sm text-emerald-600 text-xl font-bold py-4 rounded-2xl text-center flex items-center justify-center gap-2 border-2 border-emerald-300">
                      <Sparkles size={22} />
                      当前出战中
                    </div>
                  )}

                  {/* 查看图鉴 - 弱化为文字链接 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      onViewPokedex();
                      onClose();
                    }}
                    className="text-white/70 hover:text-white text-sm font-medium py-2 transition-colors flex items-center justify-center gap-1.5 underline underline-offset-2"
                  >
                    <BookOpen size={14} />
                    查看图鉴列表
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
