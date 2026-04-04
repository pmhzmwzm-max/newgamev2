import React, { useEffect, useMemo, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGrowthStageByExp, getNextGrowthStage, growthStages } from '../data/growthRewards';

interface PokedexScreenProps {
  isOpen: boolean;
  puzzlePieces: number;
  onClose: () => void;
}

export default function PokedexScreen({
  isOpen,
  puzzlePieces,
  onClose,
}: PokedexScreenProps) {
  const activeStage = useMemo(() => getGrowthStageByExp(puzzlePieces), [puzzlePieces]);
  const nextStage = useMemo(() => getNextGrowthStage(puzzlePieces), [puzzlePieces]);
  const [selectedStageId, setSelectedStageId] = useState(activeStage.id);

  useEffect(() => {
    if (isOpen) {
      setSelectedStageId(activeStage.id);
    }
  }, [activeStage.id, isOpen]);

  const selectedStage = useMemo(
    () => growthStages.find((stage) => stage.id === selectedStageId) ?? activeStage,
    [activeStage, selectedStageId]
  );

  const renderStageCard = (stage: typeof growthStages[number]) => {
    const isUnlocked = puzzlePieces >= stage.threshold;
    const isSelected = selectedStage.id === stage.id;

    return (
      <motion.button
        key={stage.id}
        type="button"
        whileHover={isUnlocked ? { scale: 1.03, y: -2 } : undefined}
        whileTap={isUnlocked ? { scale: 0.98 } : undefined}
        onClick={() => {
          if (isUnlocked) {
            setSelectedStageId(stage.id);
          }
        }}
        className={`relative rounded-[20px] border-2 px-2.5 py-2 text-center shadow-[0_8px_16px_rgba(67,99,139,0.1)] transition-all ${
          isUnlocked
            ? 'cursor-pointer border-white/95 bg-white/90'
            : 'cursor-default border-slate-200 bg-slate-100/90'
        } ${isSelected ? 'shadow-[0_14px_28px_rgba(255,184,64,0.18)] ring-2 ring-amber-200/60' : ''}`}
      >

        <div
          className={`mx-auto mb-2 flex h-[58px] w-[58px] items-center justify-center rounded-[18px] text-[30px] shadow-inner ${
            isUnlocked ? '' : 'grayscale opacity-55'
          }`}
          style={{
            background: isUnlocked
              ? stage.id === 0
                ? 'linear-gradient(180deg,#ffe58f,#ffbe5d)'
                : stage.id === 1
                ? 'linear-gradient(180deg,#ffd3b3,#ffa265)'
                : stage.id === 2
                ? 'linear-gradient(180deg,#fff0b0,#ffd35c)'
                : stage.id === 3
                ? 'linear-gradient(180deg,#ffd3c5,#ff9d6e)'
                : stage.id === 4
                ? 'linear-gradient(180deg,#ffe5af,#ffbf59)'
                : stage.id === 5
                ? 'linear-gradient(180deg,#d6efff,#7dc8ff)'
                : stage.id === 6
                ? 'linear-gradient(180deg,#fff0b0,#ffd35c)'
                : 'linear-gradient(180deg,#efeaf9,#bea7ff)'
              : 'linear-gradient(180deg,#eef2f7,#d9e0e8)',
          }}
        >
          {stage.image ? (
            <img
              src={stage.image}
              alt={isUnlocked ? stage.name : '未知伙伴'}
              draggable={false}
              className={`h-[88%] w-[88%] select-none object-contain ${isUnlocked ? '' : 'brightness-0'}`}
            />
          ) : (
            <span>{stage.emoji ?? '🥚'}</span>
          )}
        </div>

        {isUnlocked ? (
          <div className="mb-0.5 text-[12px] font-black text-slate-700">{stage.name}</div>
        ) : null}

        {!isUnlocked && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2 py-1 text-[10px] font-black text-slate-600">
            <Lock size={11} />
            {`第${stage.unlockLevel}关`}
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
                  <h2 className="text-[28px] font-black leading-none text-slate-700">图鉴</h2>
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

            <div className="relative z-10 grid h-[calc(100%-64px)] min-h-0 grid-rows-[minmax(0,0.86fr)_308px] gap-3">
              <aside className="relative flex min-h-0 flex-col overflow-hidden rounded-[28px] border-2 border-white/80 bg-gradient-to-br from-amber-300 via-orange-300 to-orange-400 px-5 py-5 shadow-[inset_0_-6px_0_rgba(201,129,25,0.16),0_16px_26px_rgba(244,166,52,0.18)]">
                <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/18 blur-2xl" />
                <div className="pointer-events-none absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-amber-100/20 blur-2xl" />

                <div className="relative z-10 flex flex-1 items-center gap-6">
                  <div className="flex min-w-[170px] justify-center">
                    <div className="flex h-[170px] w-[170px] items-center justify-center rounded-full border-4 border-white/45 bg-white/25 shadow-[inset_0_12px_24px_rgba(255,255,255,0.28),0_14px_24px_rgba(180,106,10,0.18)]">
                      {selectedStage.image ? (
                        <img
                          src={selectedStage.image}
                          alt={selectedStage.name}
                          draggable={false}
                          className="h-[82%] w-[82%] select-none object-contain drop-shadow-[0_10px_20px_rgba(255,255,255,0.18)]"
                        />
                      ) : (
                        <span className="text-8xl">{selectedStage.emoji ?? '🥚'}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <h3 className="mb-3 text-[34px] font-black leading-tight text-white drop-shadow-[0_2px_6px_rgba(150,82,0,0.22)]">
                      {selectedStage.name}
                    </h3>
                    <p className="rounded-[22px] bg-white/16 px-5 py-4 text-base font-bold leading-7 text-white/95 backdrop-blur-[2px]">
                      {selectedStage.description}
                    </p>
                  </div>
                </div>
              </aside>

              <section className="flex min-h-0 min-w-0 flex-col rounded-[28px] bg-white/20 px-3 py-3">
                <div className="grid min-h-0 grid-cols-4 gap-2.5 overflow-y-auto px-1 pb-2 pt-1">
                  {growthStages.map((stage) => renderStageCard(stage))}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
