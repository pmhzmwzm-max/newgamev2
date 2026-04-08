import React, { useEffect, useMemo, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGrowthStageByExp, growthStages, type BattleVisualOption } from '../data/growthRewards';

type PokedexTab = 'stage' | 'effect' | 'gem' | 'map';

interface PokedexScreenProps {
  isOpen: boolean;
  puzzlePieces: number;
  selectedBattleStageId: number;
  selectedBattleEffectName: string;
  selectedBattleGemName: string;
  selectedBattleMapTheme: string;
  effectOptions: BattleVisualOption[];
  gemOptions: BattleVisualOption[];
  mapOptions: BattleVisualOption[];
  onSelectBattleStage: (stageId: number) => void;
  onSelectBattleEffect: (effectName: string) => void;
  onSelectBattleGem: (gemName: string) => void;
  onSelectBattleMap: (mapTheme: string) => void;
  onClose: () => void;
  defaultTab?: PokedexTab;
}

const tabItems: Array<{ id: PokedexTab; label: string }> = [
  { id: 'stage', label: '形态' },
  { id: 'effect', label: '能力' },
  { id: 'gem', label: '宝石' },
  { id: 'map', label: '地图' },
];

const LOCKED_ICON_CLASS = 'grayscale brightness-75 contrast-125';
const LOCKED_STAGE_SILHOUETTE_CLASS = 'brightness-0 saturate-0 contrast-[0] opacity-100';

export default function PokedexScreen({
  isOpen,
  puzzlePieces,
  selectedBattleStageId,
  selectedBattleEffectName,
  selectedBattleGemName,
  selectedBattleMapTheme,
  effectOptions,
  gemOptions,
  mapOptions,
  onSelectBattleStage,
  onSelectBattleEffect,
  onSelectBattleGem,
  onSelectBattleMap,
  onClose,
  defaultTab = 'stage',
}: PokedexScreenProps) {
  const activeStage = useMemo(() => getGrowthStageByExp(puzzlePieces), [puzzlePieces]);
  const [selectedStageId, setSelectedStageId] = useState(selectedBattleStageId);
  const [selectedEffectId, setSelectedEffectId] = useState(selectedBattleEffectName);
  const [selectedGemId, setSelectedGemId] = useState(selectedBattleGemName);
  const [selectedMapId, setSelectedMapId] = useState(selectedBattleMapTheme);
  const [activeTab, setActiveTab] = useState<PokedexTab>(defaultTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (isOpen) {
      setSelectedStageId(selectedBattleStageId);
      setSelectedEffectId(selectedBattleEffectName);
      setSelectedGemId(selectedBattleGemName);
      setSelectedMapId(selectedBattleMapTheme);
    }
  }, [isOpen, selectedBattleStageId, selectedBattleEffectName, selectedBattleGemName, selectedBattleMapTheme]);

  const selectedStage = useMemo(
    () => growthStages.find((stage) => stage.id === selectedStageId) ?? activeStage,
    [activeStage, selectedStageId]
  );
  const isSelectedStageUnlocked = puzzlePieces >= selectedStage.threshold;
  const selectedEffectOption = effectOptions.find((option) => option.id === selectedEffectId) ?? effectOptions[0];
  const selectedGemOption = gemOptions.find((option) => option.id === selectedGemId) ?? gemOptions[0];
  const selectedMapOption = mapOptions.find((option) => option.id === selectedMapId) ?? mapOptions[0];

  const getStageImageStyle = (
    stage: typeof growthStages[number],
    context: 'list' | 'detail'
  ): React.CSSProperties => {
    if (context === 'detail') {
      if (stage.hidden) {
        return { transform: 'translateY(2%) scale(1.39)', transformOrigin: 'center center' };
      }
      if (stage.id === 3) {
        return { transform: 'translateY(6px) scale(0.83)', transformOrigin: 'center center' };
      }
      if (stage.id === 4) {
        return { transform: 'translateY(8px) scale(0.81)', transformOrigin: 'center center' };
      }
      if (stage.id === 5) {
        return { transform: 'translateY(8px) scale(1.01)', transformOrigin: 'center center' };
      }
      if (stage.id === 6) {
        return { transform: 'translateY(8px) scale(0.95)', transformOrigin: 'center center' };
      }
      if (stage.id === 7) {
        return { transform: 'translateY(8px) scale(1.06)', transformOrigin: 'center center' };
      }
      return { transform: 'scale(0.86)', transformOrigin: 'center center' };
    }

    if (stage.hidden) {
      return { transform: 'translateY(0px) scale(1.06)', transformOrigin: 'center center' };
    }
    if (stage.id >= 6) {
      return { transform: 'translateY(2px) scale(0.86)', transformOrigin: 'center center' };
    }
    return { transform: 'scale(0.82)', transformOrigin: 'center center' };
  };

  const renderStageCard = (stage: typeof growthStages[number]) => {
    const isUnlocked = puzzlePieces >= stage.threshold;
    const isSelected = selectedStage.id === stage.id;
    const isHiddenStage = Boolean(stage.hidden);
    const isBattleStage = selectedBattleStageId === stage.id;

    return (
      <motion.button
        key={stage.id}
        type="button"
        whileHover={isUnlocked ? { scale: 1.03, y: -2 } : undefined}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setSelectedStageId(stage.id);
        }}
        className={`relative flex min-h-[102px] flex-col items-center justify-start rounded-[20px] border-2 px-3 pt-3 pb-3 text-center shadow-[0_8px_16px_rgba(67,99,139,0.1)] transition-all sm:min-h-[112px] sm:pb-3 ${
          isUnlocked
            ? 'cursor-pointer border-white/95 bg-white/90'
            : 'cursor-pointer border-slate-200 bg-slate-100/90'
        } ${isSelected ? 'shadow-[0_14px_28px_rgba(255,184,64,0.18)] ring-2 ring-amber-200/60' : ''} ${isBattleStage ? 'border-sky-300 shadow-[0_16px_26px_rgba(69,148,255,0.18)]' : ''}`}
      >
        {isBattleStage ? (
          <div className="absolute right-[-4px] top-[-6px] rounded-full bg-sky-400 px-2.5 py-0.5 text-[9px] font-black text-white shadow-[0_4px_10px_rgba(56,189,248,0.32)]">
            当前形态
          </div>
        ) : null}

        <div
          className={`mx-auto mb-1.5 flex h-[56px] w-[56px] items-center justify-center rounded-[18px] text-[30px] shadow-inner sm:mb-2 sm:h-[58px] sm:w-[58px] ${
            isUnlocked ? '' : LOCKED_ICON_CLASS
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
              alt={isUnlocked ? stage.name : isHiddenStage ? '隐藏形态' : '未知伙伴'}
              draggable={false}
              className={`h-full w-full select-none object-contain drop-shadow-[0_8px_16px_rgba(255,255,255,0.16)] ${isUnlocked ? '' : LOCKED_STAGE_SILHOUETTE_CLASS}`}
              style={getStageImageStyle(stage, 'list')}
            />
          ) : (
            <span>{stage.emoji ?? '🥚'}</span>
          )}
        </div>

        {isUnlocked ? (
          <div className="flex min-h-[22px] items-start justify-center sm:min-h-[24px]">
            <div className="text-center text-[12px] font-black leading-[1.1] text-slate-700">{stage.name}</div>
          </div>
        ) : isHiddenStage ? (
          <div className="flex min-h-[22px] items-start justify-center text-[12px] font-black tracking-[0.22em] text-slate-400 sm:min-h-[24px]" />
        ) : null}

        {!isUnlocked && (
          <div className="absolute bottom-3 left-1/2 inline-flex min-w-[74px] -translate-x-1/2 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-slate-200/80 px-2.5 py-1 text-[10px] font-black leading-none text-slate-600 shadow-[0_2px_6px_rgba(148,163,184,0.16)]">
            <Lock size={11} />
            {`第${stage.unlockLevel}关`}
          </div>
        )}
      </motion.button>
    );
  };

  const renderVisualOptionCard = (
    option: BattleVisualOption,
    selectedId: string,
    currentUsedId: string,
    onInspect: (id: string) => void,
    accentClass: string,
    kind: 'effect' | 'gem' | 'map'
  ) => {
    const isSelected = option.id === selectedId;
    const isCurrentUsed = option.id === currentUsedId;
    const isUnlocked = option.unlocked !== false;
    // 提取 ring 颜色用于选中状态
    const ringColor = kind === 'effect' ? 'ring-amber-200/60' : kind === 'gem' ? 'ring-sky-200' : 'ring-violet-200';
    return (
      <button
        key={option.id}
        type="button"
        onClick={() => {
          onInspect(option.id);
        }}
        className={`relative flex min-h-[112px] flex-col items-center justify-start rounded-[20px] border-2 px-3 pt-3 pb-3 text-center shadow-[0_8px_16px_rgba(67,99,139,0.1)] transition-all active:scale-[0.98] border-white/95 bg-white/92 ${
          isSelected ? 'shadow-[0_14px_28px_rgba(255,184,64,0.18)] ring-2 ring-amber-200/60' : ''
        }`}
      >
        {isCurrentUsed ? (
          <div className="absolute right-[-4px] top-[-6px] rounded-full bg-sky-400 px-2.5 py-0.5 text-[9px] font-black text-white shadow-[0_4px_10px_rgba(56,189,248,0.32)]">
            {kind === 'effect' ? '当前能力' : kind === 'gem' ? '当前宝石' : '当前地图'}
          </div>
        ) : null}
        {kind === 'map' ? (
          // 地图列表：白色圈外切
          <div className="mx-auto mb-2 flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-2 border-white/80">
            {option.image ? (
              <img
                src={option.image}
                alt={option.name}
                draggable={false}
                className={`h-full w-full object-cover ${isUnlocked ? '' : LOCKED_ICON_CLASS}`}
                style={{ objectPosition: option.name === '踏火山径' || option.name === '星火遗坛' ? 'top' : 'center' }}
              />
            ) : (
              <div className="text-[11px] font-black text-slate-500">{option.name}</div>
            )}
          </div>
        ) : (
          // 能力/宝石列表：无白色圈
          <div className="mx-auto mb-2 flex h-[60px] w-[60px] items-center justify-center overflow-visible">
            {option.image ? (
              <img
                src={option.image}
                alt={option.name}
                draggable={false}
                className={`h-full w-full object-contain ${kind === 'effect' ? 'scale-[1.15]' : ''} ${isUnlocked ? '' : LOCKED_ICON_CLASS}`}
              />
            ) : (
              <div className="text-[11px] font-black text-slate-500">{option.name}</div>
            )}
          </div>
        )}
        {isUnlocked ? (
          <div className="text-center text-[12px] font-black leading-[1.1] text-slate-700">{option.name}</div>
        ) : (
          <div className="absolute bottom-3 left-1/2 inline-flex min-w-[74px] -translate-x-1/2 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-slate-200/80 px-2.5 py-1 text-[10px] font-black leading-none text-slate-600 shadow-[0_2px_6px_rgba(148,163,184,0.16)]">
            <Lock size={11} />
            {`第${option.unlockLevel ?? 0}关`}
          </div>
        )}
      </button>
    );
  };

  const renderAssetTab = (
    title: string,
    previewImage: string | undefined,
    previewLabel: string | undefined,
    description: string,
    options: BattleVisualOption[],
    selectedId: string,
    currentUsedId: string,
    onInspect: (id: string) => void,
    onApply: (id: string) => void,
    accentClass: string,
    kind: 'effect' | 'gem' | 'map'
  ) => {
    const selectedOption = options.find((item) => item.id === selectedId);
    const isSelectedUnlocked = selectedOption?.unlocked !== false;
    const isCurrentUsed = selectedId === currentUsedId;
    const applyLabel = kind === 'effect' ? '使用该能力' : kind === 'gem' ? '使用该宝石' : '使用该地图';
    const currentLabel = kind === 'effect' ? '当前能力' : kind === 'gem' ? '当前宝石' : '当前地图';

    return (
      <div className="relative z-10 grid h-[calc(100%-56px)] min-h-0 grid-rows-[minmax(0,1.06fr)_minmax(0,0.94fr)] gap-3 sm:h-[calc(100%-64px)] sm:grid-rows-[minmax(0,0.86fr)_308px]">
        <aside className={`relative flex min-h-0 flex-col overflow-hidden rounded-[24px] border-2 px-4 py-4 shadow-[inset_0_-6px_0_rgba(201,129,25,0.16),0_16px_26px_rgba(244,166,52,0.18)] sm:rounded-[28px] sm:px-5 sm:py-5 ${
          isSelectedUnlocked
            ? 'border-white/80 bg-gradient-to-br from-amber-300 via-orange-300 to-orange-400'
            : 'border-slate-200/90 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500'
        }`}>
          <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/18 blur-2xl" />
          <div className="pointer-events-none absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-amber-100/20 blur-2xl" />

          <div className="relative z-10 flex flex-1 flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
            <div className="order-1 flex justify-center self-center sm:order-1 sm:min-w-[148px]">
              {kind === 'map' ? (
                // 地图：白色圈外切包住场景图
                <div className="flex h-[148px] w-[148px] items-center justify-center overflow-hidden rounded-full border-4 border-white/45 bg-transparent shadow-[0_14px_24px_rgba(180,106,10,0.18)] sm:h-[154px] sm:w-[154px]">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={previewLabel ?? title}
                      draggable={false}
                      className={`h-full w-full object-cover ${isSelectedUnlocked ? '' : LOCKED_ICON_CLASS}`}
                      style={{ objectPosition: previewLabel === '踏火山径' || previewLabel === '星火遗坛' ? 'top' : 'center' }}
                    />
                  ) : (
                    <div className="text-sm font-black text-white/90">{previewLabel ?? title}</div>
                  )}
                </div>
              ) : (
                // 能力/宝石：无白色圈
                <div className="flex h-[148px] w-[148px] items-center justify-center overflow-visible sm:h-[154px] sm:w-[154px]">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={previewLabel ?? title}
                      draggable={false}
                      className={`h-full w-full object-contain drop-shadow-[0_16px_24px_rgba(255,255,255,0.2)] ${kind === 'gem' ? 'scale-[0.8]' : ''} ${isSelectedUnlocked ? '' : LOCKED_ICON_CLASS}`}
                    />
                  ) : (
                    <div className="text-sm font-black text-white/90">{previewLabel ?? title}</div>
                  )}
                </div>
              )}
            </div>

            <div className="order-2 flex min-w-0 flex-1 flex-col justify-start sm:order-2">
              <div className="mb-3 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
                <h3 className="min-w-0 text-[26px] font-black leading-[1.12] text-white drop-shadow-[0_2px_6px_rgba(150,82,0,0.22)] sm:flex-1 sm:text-[30px]">
                  {isSelectedUnlocked ? previewLabel ?? title : '???'}
                </h3>
                {isSelectedUnlocked ? (
                  isCurrentUsed ? (
                    <div className="shrink-0 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-black text-sky-600 shadow-[0_8px_16px_rgba(255,255,255,0.18)] sm:text-sm">
                      {currentLabel}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onApply(selectedId)}
                      className="shrink-0 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-black text-amber-700 shadow-[0_8px_16px_rgba(255,255,255,0.18)] transition-transform active:scale-95 sm:text-sm"
                    >
                      {applyLabel}
                    </button>
                  )
                ) : null}
              </div>
              <p className="min-h-0 overflow-y-auto rounded-[20px] bg-white/16 px-4 py-3 text-sm font-bold leading-6 text-white/95 backdrop-blur-[2px] sm:flex-1 sm:rounded-[22px] sm:px-5 sm:py-4 sm:text-base sm:leading-7">
                {isSelectedUnlocked ? description : '???'}
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col rounded-[24px] bg-white/20 px-2 py-2 sm:rounded-[28px] sm:px-3 sm:py-3">
          <div className="grid min-h-0 grid-cols-2 gap-2.5 overflow-y-auto px-1 pb-2 pt-1 sm:grid-cols-4">
            {options.map((option) => renderVisualOptionCard(option, selectedId, currentUsedId, onInspect, accentClass, kind))}
          </div>
        </section>
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === 'effect') {
      return renderAssetTab(
        '能力',
        selectedEffectOption?.image,
        selectedEffectOption?.name,
        selectedEffectOption?.description ?? '',
        effectOptions,
        selectedEffectId,
        selectedBattleEffectName,
        setSelectedEffectId,
        onSelectBattleEffect,
        'border-orange-100 bg-gradient-to-br from-amber-300/30 to-orange-300/30 ring-amber-200',
        'effect'
      );
    }

    if (activeTab === 'gem') {
      return renderAssetTab(
        '宝石',
        selectedGemOption?.image,
        selectedGemOption?.name,
        selectedGemOption?.description ?? '',
        gemOptions,
        selectedGemId,
        selectedBattleGemName,
        setSelectedGemId,
        onSelectBattleGem,
        'border-sky-100 bg-gradient-to-br from-sky-300/30 to-cyan-300/30 ring-sky-200',
        'gem'
      );
    }

    if (activeTab === 'map') {
      return renderAssetTab(
        '地图',
        selectedMapOption?.image,
        selectedMapOption?.name,
        selectedMapOption?.description ?? '',
        mapOptions,
        selectedMapId,
        selectedBattleMapTheme,
        setSelectedMapId,
        onSelectBattleMap,
        'border-violet-100 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 ring-violet-200',
        'map'
      );
    }

    return (
      <div className="relative z-10 grid h-[calc(100%-56px)] min-h-0 grid-rows-[minmax(0,1.06fr)_minmax(0,0.94fr)] gap-3 sm:h-[calc(100%-64px)] sm:grid-rows-[minmax(0,0.86fr)_308px]">
        <aside className={`relative flex min-h-0 flex-col ${selectedStage.hidden ? 'overflow-visible' : 'overflow-hidden'} rounded-[24px] border-2 px-4 py-4 shadow-[inset_0_-6px_0_rgba(201,129,25,0.16),0_16px_26px_rgba(244,166,52,0.18)] sm:rounded-[28px] sm:px-5 sm:py-5 ${
          isSelectedStageUnlocked
            ? 'border-white/80 bg-gradient-to-br from-amber-300 via-orange-300 to-orange-400'
            : 'border-slate-200/90 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500'
        }`}>
          <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/18 blur-2xl" />
          <div className={`pointer-events-none absolute -left-6 bottom-0 h-28 w-28 blur-2xl ${isSelectedStageUnlocked ? 'rounded-full bg-amber-100/20' : 'rounded-full bg-white/10'}`} />

          <div className="relative z-10 flex flex-1 flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
            <div className={`order-1 flex justify-center self-center sm:order-1 sm:min-w-[148px] ${selectedStage.hidden ? 'relative z-30 -mt-6 sm:-mt-8' : ''}`}>
              <div className="flex h-[148px] w-[148px] items-center justify-center overflow-visible rounded-full border-4 border-white/45 bg-white/25 shadow-[inset_0_12px_24px_rgba(255,255,255,0.28),0_14px_24px_rgba(180,106,10,0.18)] sm:h-[154px] sm:w-[154px]">
                {selectedStage.image ? (
                  <img
                    src={selectedStage.image}
                    alt={isSelectedStageUnlocked ? selectedStage.name : '未知形态'}
                    draggable={false}
                    className={`h-full w-full select-none object-contain drop-shadow-[0_16px_24px_rgba(255,255,255,0.2)] ${selectedStage.hidden ? 'relative z-30' : ''} ${isSelectedStageUnlocked ? '' : LOCKED_STAGE_SILHOUETTE_CLASS}`}
                    style={getStageImageStyle(selectedStage, 'detail')}
                  />
                ) : (
                  <span className="text-8xl">{selectedStage.emoji ?? '🥚'}</span>
                )}
              </div>
            </div>

            <div className="order-2 flex min-w-0 flex-1 flex-col justify-start sm:order-2">
              <div className={`mb-3 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left ${selectedStage.hidden ? 'relative z-40' : ''}`}>
                <h3 className={`min-w-0 text-[26px] font-black leading-[1.12] text-white drop-shadow-[0_2px_6px_rgba(150,82,0,0.22)] sm:flex-1 sm:text-[30px] ${selectedStage.hidden ? 'relative z-40' : ''}`}>
                  {isSelectedStageUnlocked ? selectedStage.name : '???'}
                </h3>
                {isSelectedStageUnlocked ? (
                  selectedBattleStageId === selectedStage.id ? (
                    <div className="shrink-0 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-black text-sky-600 shadow-[0_8px_16px_rgba(255,255,255,0.18)] sm:text-sm">
                      当前形态
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectBattleStage(selectedStage.id)}
                      className="shrink-0 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-black text-amber-700 shadow-[0_8px_16px_rgba(255,255,255,0.18)] transition-transform active:scale-95 sm:text-sm"
                    >
                      使用该形态
                    </button>
                  )
                ) : null}
              </div>
              <p className="min-h-0 overflow-y-auto rounded-[20px] bg-white/16 px-4 py-3 text-sm font-bold leading-6 text-white/95 backdrop-blur-[2px] sm:flex-1 sm:rounded-[22px] sm:px-5 sm:py-4 sm:text-base sm:leading-7">
                {isSelectedStageUnlocked ? selectedStage.description : '???'}
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col rounded-[24px] bg-white/20 px-2 py-2 sm:rounded-[28px] sm:px-3 sm:py-3">
          <div className="grid min-h-0 grid-cols-2 gap-2.5 overflow-y-auto px-1 pb-2 pt-1 sm:grid-cols-4">
            {growthStages.map((stage) => renderStageCard(stage))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[80] flex items-center justify-center bg-slate-900/35 p-2 backdrop-blur-[6px] sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="relative h-[calc(100%-12px)] w-[calc(100%-12px)] overflow-hidden rounded-[26px] border-2 border-white/95 bg-[rgba(255,252,246,0.96)] p-3 shadow-[0_22px_54px_rgba(34,64,103,0.18)] sm:h-[calc(100%-24px)] sm:w-[calc(100%-24px)] sm:rounded-[34px] sm:p-5"
          >
            <div className="pointer-events-none absolute inset-[8px] rounded-[20px] border border-dashed border-amber-300/40 sm:inset-[12px] sm:rounded-[26px]" />

            <div className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-gradient-to-b from-amber-200 to-orange-300 text-xl shadow-[0_8px_16px_rgba(255,181,66,0.22)] sm:h-11 sm:w-11 sm:rounded-[16px] sm:text-2xl">
                  📖
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <h2 className="text-[24px] font-black leading-none text-slate-700 sm:text-[28px]">图鉴</h2>
                  <div className="flex flex-wrap gap-2">
                    {tabItems.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`rounded-full px-3 py-1.5 text-[11px] font-black transition-all sm:text-xs ${
                            isActive
                              ? 'bg-gradient-to-b from-[#ffcc73] to-[#f59e0b] text-[#7b3b12] shadow-[0_8px_16px_rgba(245,158,11,0.28)]'
                              : 'bg-white/85 text-slate-500 shadow-[0_8px_16px_rgba(67,99,139,0.08)]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/90 text-slate-500 shadow-[0_10px_22px_rgba(67,99,139,0.12)] transition-transform active:scale-95 sm:h-11 sm:w-11"
              >
                <X size={22} />
              </button>
            </div>

            {renderContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
