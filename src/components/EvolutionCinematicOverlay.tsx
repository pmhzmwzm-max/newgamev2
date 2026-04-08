import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { RewardCardModel } from '../data/growthRewards';

interface EvolutionCinematicOverlayProps {
  reward: RewardCardModel;
  isComplete: boolean;
  onDismiss: () => void;
}

type ParticleSpec = {
  id: number;
  size: number;
  x: number;
  delay: number;
  duration: number;
  drift: number;
  hue: number;
};

export const EVOLUTION_CINEMATIC_DURATION_MS = 6000;
const PARTICLE_COUNT = 14;
const LIGHT_RAY_COUNT = 8;
const STARBURST_RAY_COUNT = 12;
const EDGE_FLARES = [
  { left: '18%', top: '20%', rotate: -26, delay: 0.72, height: 84 },
  { left: '12%', top: '38%', rotate: -54, delay: 0.94, height: 96 },
  { left: '24%', top: '60%', rotate: -78, delay: 1.12, height: 78 },
  { left: '76%', top: '18%', rotate: 28, delay: 0.82, height: 88 },
  { left: '84%', top: '40%', rotate: 58, delay: 1.02, height: 102 },
  { left: '72%', top: '62%', rotate: 82, delay: 1.18, height: 74 },
] as const;
const EDGE_SHARDS = [
  { left: '16%', top: '22%', x: -86, y: -38, rotate: -46, delay: 2.84 },
  { left: '12%', top: '42%', x: -104, y: -10, rotate: -82, delay: 2.9 },
  { left: '24%', top: '66%', x: -72, y: 38, rotate: -118, delay: 2.96 },
  { left: '78%', top: '20%', x: 88, y: -34, rotate: 42, delay: 2.86 },
  { left: '86%', top: '42%', x: 108, y: -4, rotate: 86, delay: 2.92 },
  { left: '74%', top: '66%', x: 76, y: 42, rotate: 124, delay: 2.98 },
  { left: '50%', top: '10%', x: 0, y: -92, rotate: 0, delay: 2.88 },
  { left: '50%', top: '78%', x: 0, y: 86, rotate: 180, delay: 3.02 },
] as const;
const EDGE_RING_COUNT = 4;

export default function EvolutionCinematicOverlay({
  reward,
  isComplete,
  onDismiss,
}: EvolutionCinematicOverlayProps) {
  const cinematic = reward.evolutionCinematic;
  const isHiddenFinale = reward.focus === 'hidden_finale';
  const backgroundClass = isHiddenFinale
    ? 'bg-[radial-gradient(circle_at_50%_42%,rgba(233,220,255,0.22),rgba(63,28,92,0.78)_42%,rgba(10,8,20,0.98)_100%)]'
    : 'bg-[radial-gradient(circle_at_50%_42%,rgba(255,243,198,0.20),rgba(95,30,10,0.72)_42%,rgba(18,10,20,0.98)_100%)]';
  const atmosphereClass = isHiddenFinale
    ? 'bg-[radial-gradient(circle_at_50%_78%,rgba(168,139,250,0.2),transparent_34%),radial-gradient(circle_at_50%_18%,rgba(255,239,213,0.10),transparent_26%)]'
    : 'bg-[radial-gradient(circle_at_50%_78%,rgba(255,178,72,0.2),transparent_34%),radial-gradient(circle_at_50%_18%,rgba(255,240,214,0.08),transparent_26%)]';
  const ringBorderPrimary = isHiddenFinale ? 'border-[#f1ddff]/55' : 'border-[#fff2ca]/50';
  const ringBorderSecondary = isHiddenFinale ? 'border-[#c9a7ff]/22' : 'border-[#ffd37e]/18';
  const groundPrimaryClass = isHiddenFinale
    ? 'border-[#d8b4fe]/44 bg-[radial-gradient(circle,rgba(248,243,255,0.96)_0%,rgba(196,161,255,0.38)_32%,rgba(129,91,255,0.16)_58%,transparent_76%)]'
    : 'border-[#ffd98d]/40 bg-[radial-gradient(circle,rgba(255,241,202,0.92)_0%,rgba(255,212,120,0.46)_30%,rgba(255,168,67,0.14)_58%,transparent_76%)]';
  const groundSecondaryBorder = isHiddenFinale ? 'border-[#e9d5ff]/24' : 'border-[#ffe6b8]/20';
  const groundTertiaryBorder = isHiddenFinale ? 'border-[#f3e8ff]/16' : 'border-[#fff3d2]/12';
  const lightRayClass = isHiddenFinale
    ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(231,214,255,0.72)_35%,rgba(167,139,250,0.14)_100%)]'
    : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,235,188,0.6)_35%,rgba(255,180,76,0.08)_100%)]';
  const starburstRayClass = isHiddenFinale
    ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(221,198,255,0.52)_38%,rgba(129,91,255,0.08)_100%)]'
    : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(255,222,158,0.48)_38%,rgba(255,176,78,0.04)_100%)]';
  const titleText = isHiddenFinale ? '隐藏觉醒！' : '进化！';
  const titleColor = isHiddenFinale ? 'text-[#f3e8ff]' : 'text-[#fff4d1]';
  const titleShadow = isHiddenFinale ? '0 0 26px rgba(201,167,255,0.46)' : '0 0 22px rgba(255,210,119,0.42)';
  const subtitleClass = isHiddenFinale
    ? 'rounded-full border border-white/14 bg-white/10 px-6 py-3 text-[22px] font-black text-white/96 backdrop-blur-[8px]'
    : 'rounded-full border border-white/18 bg-white/8 px-6 py-3 text-[22px] font-black text-white/96 backdrop-blur-[6px]';
  const sweepClass = isHiddenFinale
    ? 'bg-[linear-gradient(90deg,transparent,rgba(245,236,255,0.92),transparent)]'
    : 'bg-[linear-gradient(90deg,transparent,rgba(255,250,224,0.88),transparent)]';

  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
        id: index,
        size: 6 + (index % 4) * 4,
        x: 10 + ((index * 7) % 80),
        delay: 0.18 + (index % 6) * 0.08,
        duration: 1.05 + (index % 5) * 0.16,
        drift: index % 2 === 0 ? -22 - index : 20 + index,
        hue: index % 3,
      })),
    []
  );

  if (!cinematic) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 z-[80] overflow-hidden ${backgroundClass} ${isComplete ? 'cursor-pointer' : 'pointer-events-auto'}`}
      onClick={isComplete ? onDismiss : undefined}
    >
      <motion.div
        initial={{ x: 0, y: 0 }}
        animate={{
          x: [0, 0, 0, -4, 4, -3, 3, -1, 1, 0],
          y: [0, 0, 0, 2, -2, 1, -1, 1, 0, 0],
        }}
        transition={{
          duration: EVOLUTION_CINEMATIC_DURATION_MS / 1000,
          times: [0, 0.43, 0.47, 0.49, 0.515, 0.54, 0.565, 0.59, 0.62, 1],
          ease: 'linear',
        }}
        className="absolute inset-0 will-change-transform"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1] }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
          className={`absolute inset-0 ${atmosphereClass}`}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: [0, 0, 0.95, 0], scale: [0.86, 0.86, 1.18, 1.42] }}
          transition={{ duration: 1.34, delay: 2.62, ease: [0.18, 0.82, 0.22, 1] }}
          className={`absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border ${ringBorderPrimary} will-change-transform`}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: [0, 0, 0.68, 0], scale: [0.94, 0.94, 1.3, 1.56] }}
          transition={{ duration: 1.5, delay: 2.7, ease: [0.18, 0.82, 0.22, 1] }}
          className={`absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border ${ringBorderSecondary} will-change-transform`}
        />

        <div className="absolute inset-x-0 bottom-[152px] flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.72 }}
          animate={{ opacity: [0, 0.95, 0.72], scale: [0.72, 1, 1.08] }}
          transition={{ duration: 4.6, ease: [0.24, 0.72, 0.22, 1] }}
          className={`h-[190px] w-[190px] rounded-full border ${groundPrimaryClass} will-change-transform`}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: [0, 0.75, 0.42], scale: [0.82, 1.08, 1.2], rotate: [0, 24, 48] }}
          transition={{ duration: 5.6, ease: 'linear' }}
          className={`absolute top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full border ${groundSecondaryBorder}`}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.34, 0.2, 0.28], rotate: [0, -12, -22] }}
          transition={{ duration: 6, ease: 'linear' }}
          className={`absolute top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full border border-dashed ${groundTertiaryBorder}`}
        />
      </div>

        <div className="absolute inset-x-0 bottom-[224px] flex justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.14] }}
          transition={{ duration: 4.4, ease: [0.24, 0.72, 0.22, 1] }}
          className="relative h-[320px] w-[320px]"
        >
          {Array.from({ length: LIGHT_RAY_COUNT }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scaleY: 0.2 }}
              animate={{ opacity: [0, 0.68, 0.18], scaleY: [0.2, 1, 0.82] }}
              transition={{ duration: 3, delay: 0.36 + index * 0.08, ease: [0.24, 0.72, 0.22, 1] }}
              className={`absolute left-1/2 top-1/2 h-[160px] w-[18px] origin-bottom rounded-full ${lightRayClass}`}
              style={{
                transform: `translate(-50%, -100%) rotate(${index * 24}deg)`,
              }}
            />
          ))}
        </motion.div>
      </div>

        <div className="absolute inset-x-0 bottom-[206px] flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{ opacity: [0, 0, 0.78, 0.46], scale: [0.8, 0.8, 1.12, 1.04], rotate: [0, 0, 18, 26] }}
          transition={{ duration: 2.44, delay: 2.9, ease: [0.18, 0.82, 0.22, 1] }}
          className="relative h-[360px] w-[360px]"
        >
          {Array.from({ length: STARBURST_RAY_COUNT }).map((_, index) => (
            <div
              key={index}
              className={`absolute left-1/2 top-1/2 h-[168px] w-[12px] origin-bottom rounded-full ${starburstRayClass}`}
              style={{
                transform: `translate(-50%, -100%) rotate(${index * 30}deg)`,
              }}
            />
          ))}
        </motion.div>
      </div>

        <div className="pointer-events-none absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, x: '-50%', y: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 0.95, 0],
              y: [0, -120 - particle.id * 8],
              x: [`calc(-50% + 0px)`, `calc(-50% + ${particle.drift}px)`],
              scale: [0.6, 1, 0.88],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: [0.24, 0.72, 0.22, 1],
            }}
            className="absolute bottom-[248px] rounded-full"
            style={{
              left: `${particle.x}%`,
              width: particle.size,
              height: particle.size,
              background:
                particle.hue === 0
                  ? 'rgba(255,245,206,0.95)'
                  : particle.hue === 1
                  ? 'rgba(255,211,123,0.9)'
                  : 'rgba(255,170,124,0.82)',
            }}
          />
        ))}
      </div>

        <div className="pointer-events-none absolute inset-0">
        {particles.slice(0, 8).map((particle) => (
          <motion.div
            key={`burst-${particle.id}`}
            initial={{ opacity: 0, x: '-50%', y: 0, scale: 0.3, rotate: 0 }}
            animate={{
              opacity: [0, 0, 1, 0],
              y: [0, 0, -94 - particle.id * 10, -126 - particle.id * 12],
              x: [`calc(-50% + 0px)`, `calc(-50% + 0px)`, `calc(-50% + ${particle.drift * 2.1}px)`, `calc(-50% + ${particle.drift * 2.8}px)`],
              scale: [0.3, 0.3, 1.12, 0.54],
              rotate: [0, 0, particle.drift * 2.5, particle.drift * 3.5],
            }}
            transition={{
              duration: 0.86,
              delay: 2.84 + particle.id * 0.03,
              ease: [0.18, 0.82, 0.22, 1],
            }}
            className="absolute bottom-[270px] left-1/2"
          >
            <div
              className="h-[18px] w-[18px] rotate-45 rounded-[4px]"
              style={{
                background:
                  particle.hue === 0
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,220,141,0.78))'
                    : particle.hue === 1
                    ? 'linear-gradient(135deg, rgba(255,243,196,0.96), rgba(255,170,94,0.72))'
                    : 'linear-gradient(135deg, rgba(255,214,170,0.92), rgba(255,123,98,0.7))',
              }}
            />
          </motion.div>
        ))}
      </div>

        <div className="absolute inset-x-0 top-[136px] flex justify-center">
        <div className="relative h-[520px] w-[420px]">
          {cinematic.fromImage ? (
            <>
              <div className="absolute left-1/2 top-[48px] h-[344px] w-[344px] -translate-x-1/2">
                {EDGE_FLARES.map((flare, index) => (
                  <motion.div
                    key={`edge-flare-${index}`}
                    initial={{ opacity: 0, scaleY: 0.2, scaleX: 0.8 }}
                    animate={{
                      opacity: [0, 0.18, 0.72, 0.28, 0],
                      scaleY: [0.2, 0.44, 1, 1.08, 0.24],
                      scaleX: [0.8, 0.94, 1.02, 1.08, 0.82],
                    }}
                    transition={{
                      duration: 1.9,
                      delay: flare.delay,
                      ease: [0.3, 0.08, 0.14, 1],
                    }}
                    className="absolute w-[14px] origin-bottom rounded-full"
                    style={{
                      left: flare.left,
                      top: flare.top,
                      height: flare.height,
                      transform: `translate(-50%, -50%) rotate(${flare.rotate}deg)`,
                      background:
                        isHiddenFinale
                          ? 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(227,201,255,0.94) 24%, rgba(149,104,255,0.66) 58%, rgba(129,91,255,0.06) 100%)'
                          : 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,215,126,0.92) 24%, rgba(255,132,54,0.62) 58%, rgba(255,92,38,0.06) 100%)',
                      boxShadow: isHiddenFinale ? '0 0 20px rgba(173,125,255,0.3)' : '0 0 18px rgba(255,170,82,0.28)',
                    }}
                  />
                ))}
                {EDGE_SHARDS.map((shard, index) => (
                  <motion.div
                    key={`edge-shard-${index}`}
                    initial={{ opacity: 0, x: '-50%', y: '-50%', scale: 0.18, rotate: shard.rotate - 16 }}
                    animate={{
                      opacity: [0, 0, 1, 0],
                      x: ['-50%', `calc(-50% + ${shard.x * 0.28}px)`, `calc(-50% + ${shard.x}px)`],
                      y: ['-50%', `calc(-50% + ${shard.y * 0.26}px)`, `calc(-50% + ${shard.y}px)`],
                      scale: [0.18, 0.52, 1.02],
                      rotate: [shard.rotate - 16, shard.rotate + 10, shard.rotate + 42],
                    }}
                    transition={{
                      duration: 0.3,
                      delay: shard.delay,
                      times: [0, 0.36, 1],
                      ease: [0.2, 0.9, 0.18, 1],
                    }}
                    className="absolute left-0 top-0"
                    style={{
                      left: shard.left,
                      top: shard.top,
                    }}
                  >
                    <div
                      className="h-[16px] w-[16px] rotate-45 rounded-[4px]"
                      style={{
                        background: isHiddenFinale
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(228,209,255,0.9) 38%, rgba(149,104,255,0.72) 78%, rgba(110,66,219,0.24))'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,208,110,0.88) 38%, rgba(255,108,42,0.68) 78%, rgba(255,94,40,0.24))',
                        boxShadow: isHiddenFinale ? '0 0 16px rgba(173,125,255,0.34)' : '0 0 14px rgba(255,170,82,0.32)',
                      }}
                    />
                  </motion.div>
                ))}
                {Array.from({ length: EDGE_RING_COUNT }).map((_, index) => (
                  <motion.div
                    key={`edge-ring-${index}`}
                    initial={{ opacity: 0, scale: 0.78 }}
                    animate={{ opacity: [0, 0.08, 0.24, 0], scale: [0.78, 0.9, 1.04, 1.16] }}
                    transition={{
                      duration: 1.5,
                      delay: 0.86 + index * 0.18,
                      ease: [0.28, 0.12, 0.16, 1],
                    }}
                    className={`absolute left-1/2 top-1/2 rounded-full border ${isHiddenFinale ? 'border-[#c9a7ff]/24' : 'border-[#ffcf7a]/20'}`}
                    style={{
                      width: 214 + index * 16,
                      height: 246 + index * 18,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </div>

              <motion.img
                src={cinematic.fromImage}
                alt={cinematic.fromName}
                draggable={false}
                initial={{ opacity: 0, y: 28, scale: 0.92 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [28, 0, -4, -24],
                  scale: [1.2, 1.3, 1.34, 1.44],
                }}
                transition={{
                  duration: 3.4,
                  times: [0, 0.48, 0.84, 1],
                  ease: [0.34, 0.04, 0.12, 1],
                }}
                className="absolute left-1/2 top-[48px] h-[344px] w-[344px] -translate-x-1/2 object-contain drop-shadow-[0_18px_32px_rgba(255,196,112,0.26)]"
              />
            </>
          ) : null}

          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.86, 0], scale: [0.4, 1.3, 1.85] }}
            transition={{ duration: 1.04, delay: 2.62, ease: [0.18, 0.82, 0.22, 1] }}
            className={`absolute left-1/2 top-[196px] h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full ${
              isHiddenFinale
                ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(238,226,255,0.76)_40%,rgba(173,125,255,0.16)_72%,transparent_100%)]'
                : 'bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(255,242,213,0.72)_40%,rgba(255,211,135,0.12)_72%,transparent_100%)]'
            }`}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.24 }}
            animate={{ opacity: [0, 0, 0.98, 0], scale: [0.24, 0.24, 1.2, 1.72] }}
            transition={{ duration: 0.7, delay: 2.76, ease: [0.12, 0.78, 0.18, 1] }}
            className={`absolute left-1/2 top-[196px] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full ${
              isHiddenFinale
                ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(244,237,255,0.92)_28%,rgba(173,125,255,0.28)_58%,transparent_82%)]'
                : 'bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(255,250,232,0.88)_28%,rgba(255,225,168,0.24)_58%,transparent_82%)]'
            }`}
          />

          {cinematic.toImage ? (
            <>
              <motion.img
                src={cinematic.toImage}
                alt={cinematic.toName}
                draggable={false}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: [0, 0.5, 0], scale: [1.16, 1.24, 1.34] }}
                transition={{ duration: 1.02, delay: 3.12, ease: [0.22, 0.9, 0.16, 1] }}
                className="absolute left-1/2 top-[20px] h-[416px] w-[416px] -translate-x-1/2 object-contain brightness-0 saturate-0 drop-shadow-[0_0_30px_rgba(255,241,196,0.45)]"
              />
              <motion.img
                src={cinematic.toImage}
                alt={cinematic.toName}
                draggable={false}
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: [0, 0, 0.36, 1], y: [28, 24, 10, -4], scale: [1.04, 1.08, 1.18, 1.3] }}
                transition={{
                  duration: 2.82,
                  delay: 3.04,
                  times: [0, 0.42, 0.78, 1],
                  ease: [0.26, 0.02, 0.08, 1],
                }}
                className="absolute left-1/2 top-[20px] h-[416px] w-[416px] -translate-x-1/2 object-contain drop-shadow-[0_22px_38px_rgba(255,203,96,0.34)]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.76 }}
                animate={{ opacity: [0, 0, 0.72, 0.22], scale: [0.76, 0.76, 1.16, 1.24] }}
                transition={{ duration: 2.36, delay: 3.12, ease: [0.18, 0.82, 0.22, 1] }}
                className={`absolute left-1/2 top-[186px] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  isHiddenFinale
                    ? 'bg-[radial-gradient(circle,rgba(243,232,255,0.46)_0%,rgba(173,125,255,0.22)_42%,transparent_74%)]'
                    : 'bg-[radial-gradient(circle,rgba(255,245,212,0.42)_0%,rgba(255,214,131,0.18)_42%,transparent_74%)]'
                }`}
              />
            </>
          ) : null}
        </div>
      </div>

        <div className="absolute inset-x-0 bottom-[110px] flex flex-col items-center px-8 text-center">
        <div className="relative mb-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: [0, 0, 1], y: [16, 16, 0] }}
            transition={{ duration: 1.4, delay: 3.84, ease: [0.18, 0.82, 0.22, 1] }}
            className={`text-[42px] font-black tracking-[0.12em] ${titleColor}`}
            style={{ textShadow: titleShadow }}
          >
            {titleText}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -90 }}
            animate={{ opacity: [0, 0, 0.9, 0], x: [-90, -90, 86, 116] }}
            transition={{ duration: 1.28, delay: 4.06, ease: [0.18, 0.82, 0.22, 1] }}
            className={`pointer-events-none absolute inset-y-0 left-0 w-16 skew-x-[-20deg] ${sweepClass} blur-[2px]`}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: [0, 0, 0.95], y: [12, 12, 0] }}
          transition={{ duration: 1.4, delay: 3.96, ease: [0.18, 0.82, 0.22, 1] }}
          className={subtitleClass}
        >
          {cinematic.fromName} → {cinematic.toName}
        </motion.div>
        {isComplete ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-6 text-base font-black tracking-[0.16em] text-white/82"
          >
            点击以继续
          </motion.div>
        ) : null}
        </div>
      </motion.div>
    </div>
  );
}
