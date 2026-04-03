import React, { useEffect, useMemo, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { petsData } from '../data/pets';

interface PokedexScreenProps {
  isOpen: boolean;
  puzzlePieces: number;
  selectedPetId: number;
  onSelectPet: (id: number) => void;
  onClose: () => void;
}

export default function PokedexScreen({
  isOpen,
  puzzlePieces,
  selectedPetId,
  onSelectPet,
  onClose,
}: PokedexScreenProps) {
  const [activePetId, setActivePetId] = useState(selectedPetId);

  useEffect(() => {
    if (isOpen) {
      setActivePetId(selectedPetId);
    }
  }, [isOpen, selectedPetId]);

  const activePet = useMemo(
    () => petsData.find((pet) => pet.id === activePetId) ?? petsData[0],
    [activePetId],
  );

  const renderPetCard = (pet: typeof petsData[number]) => {
    const isUnlocked = pet.id === 0 || puzzlePieces >= pet.requiredPieces;
    const isPartner = selectedPetId === pet.id;
    const isActive = activePetId === pet.id;
    const remainingPieces = Math.max(0, pet.requiredPieces - puzzlePieces);

    return (
      <motion.button
        key={pet.id}
        type="button"
        whileHover={isUnlocked ? { scale: 1.03, y: -2 } : undefined}
        whileTap={isUnlocked ? { scale: 0.98 } : undefined}
        onClick={() => isUnlocked && setActivePetId(pet.id)}
        className={`relative rounded-[20px] border-2 px-2.5 py-2 text-center shadow-[0_8px_16px_rgba(67,99,139,0.1)] transition-all ${
          isUnlocked
            ? 'cursor-pointer border-white/95 bg-white/90'
            : 'cursor-default border-slate-200 bg-slate-100/90'
        } ${isActive ? 'shadow-[0_14px_28px_rgba(255,184,64,0.18)] ring-2 ring-amber-200/60' : ''}`}
      >
        {isPartner && (
          <div className="absolute right-2 top-2 rounded-full border border-amber-100 bg-gradient-to-b from-amber-200 to-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900 shadow-[0_4px_10px_rgba(255,173,67,0.16)]">
            出战
          </div>
        )}

        <div
          className={`mx-auto mb-2 flex h-[58px] w-[58px] items-center justify-center rounded-[18px] text-[30px] shadow-inner ${
            isUnlocked ? '' : 'grayscale opacity-55'
          }`}
          style={{
            background: isUnlocked
              ? pet.id === 0
                ? 'linear-gradient(180deg,#ffe58f,#ffbe5d)'
                : pet.id === 1
                ? 'linear-gradient(180deg,#ffd3b3,#ffa265)'
                : pet.id === 2
                ? 'linear-gradient(180deg,#d6efff,#7dc8ff)'
                : pet.id === 3
                ? 'linear-gradient(180deg,#d8f9e4,#5bc987)'
                : pet.id === 4
                ? 'linear-gradient(180deg,#fff0b0,#ffd35c)'
                : 'linear-gradient(180deg,#efeaf9,#bea7ff)'
              : 'linear-gradient(180deg,#eef2f7,#d9e0e8)',
          }}
        >
          {pet.emoji}
        </div>

        <div className={`mb-0.5 text-[12px] font-black ${isUnlocked ? 'text-slate-700' : 'text-slate-400'}`}>
          {isUnlocked ? pet.name : '未知伙伴'}
        </div>
        <div className="text-[10px] font-bold text-slate-500">
          {isUnlocked ? '已成长解锁' : `${pet.requiredPieces} 点经验成长`}
        </div>

        {!isUnlocked && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2 py-1 text-[10px] font-black text-slate-600">
            <Lock size={11} />
            {remainingPieces > 0 ? `还差 ${remainingPieces} 点经验` : '等待成长激活'}
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[80] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-[6px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="relative h-[calc(100%-24px)] w-[calc(100%-24px)] overflow-hidden rounded-[34px] border-2 border-white/95 bg-[rgba(255,252,246,0.96)] p-5 shadow-[0_22px_54px_rgba(34,64,103,0.18)]"
          >
            <div className="pointer-events-none absolute inset-[12px] rounded-[26px] border border-dashed border-amber-300/40" />

            <div className="relative z-10 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-gradient-to-b from-amber-200 to-orange-300 text-2xl shadow-[0_8px_16px_rgba(255,181,66,0.22)]">
                  📖
                </div>
                <div>
                  <h2 className="text-[28px] font-black leading-none text-slate-700">宠物图鉴</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/90 text-slate-500 shadow-[0_10px_22px_rgba(67,99,139,0.12)] transition-transform active:scale-95"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative z-10 grid h-[calc(100%-64px)] min-h-0 grid-cols-[220px_minmax(0,1fr)] gap-3">
              <aside className="flex min-h-0 flex-col rounded-[28px] border-2 border-white/80 bg-gradient-to-b from-amber-300 to-orange-300 p-4 shadow-[inset_0_-6px_0_rgba(201,129,25,0.16),0_16px_26px_rgba(244,166,52,0.18)]">
                <div className="mb-4 inline-flex w-fit rounded-full bg-white/20 px-3 py-1.5 text-xs font-black tracking-[0.08em] text-white">
                  当前出战伙伴
                </div>

                <div className="flex flex-1 items-center justify-center">
                  <div className="flex h-[138px] w-[138px] items-center justify-center rounded-full border-4 border-white/45 bg-white/25 text-[76px] shadow-[inset_0_12px_24px_rgba(255,255,255,0.28),0_14px_24px_rgba(180,106,10,0.18)]">
                    {activePet.emoji}
                  </div>
                </div>

                <h3 className="mb-2 text-center text-[28px] font-black text-white">{activePet.name}</h3>
                <p className="rounded-[18px] bg-white/18 px-4 py-3 text-center text-sm font-bold leading-6 text-white/95">
                  {activePet.description}
                </p>
                {selectedPetId !== activePet.id && (
                  <button
                    type="button"
                    onClick={() => onSelectPet(activePet.id)}
                    className="mt-4 rounded-[18px] bg-white px-4 py-3 text-base font-black text-amber-700 shadow-[0_7px_0_rgba(205,140,0,0.22)] transition-all active:translate-y-[4px] active:shadow-[0_3px_0_rgba(205,140,0,0.18)]"
                  >
                    设为出战伙伴
                  </button>
                )}
              </aside>

              <section className="flex min-h-0 min-w-0 flex-col rounded-[28px] bg-white/20 px-3 py-2">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="text-base font-black text-slate-700">伙伴列表</div>
                </div>

                <div className="grid min-h-0 grid-cols-2 gap-2.5 overflow-y-auto px-1 pb-3 pt-2">
                  {petsData.map((pet) => renderPetCard(pet))}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
