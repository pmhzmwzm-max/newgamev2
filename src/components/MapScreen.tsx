import { useRef, useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { allLevelsData } from '../data/questions';
import { getLevelRewardConfig, type RewardType } from '../data/growthRewards';
import {
  getHighestUnlockedLevel,
  getLevelProgressRatio,
  getScrollTopForLevel,
} from './mapScroll';
import { primeMapBgm, startMapBgm, stopMapBgm, warmupMapBgm } from './mapBgm';
import pokedexButtonImage from '../../UI v2.0/图鉴按钮v2.png';

const MAX_LEVELS = 159;

function getMapRewardType(levelId: number): RewardType | null {
  if (levelId < 1 || levelId > MAX_LEVELS) return null;
  const config = getLevelRewardConfig(levelId);
  return config.rewardType === 'none' ? null : config.rewardType;
}

function RewardTypeIcon({ type, locked = false }: { type: RewardType; locked?: boolean }) {
  const stroke = locked ? '#FFFFFF' : '#FFFFFF';
  const fill = locked ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.18)';

  switch (type) {
    case 'evolution':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M4 12C5.6 8.2 8.8 5.6 13.8 4.4" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M10.7 3.8L14.6 4L13.9 7.7" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="5" cy="13" r="1.8" fill={stroke} />
        </svg>
      );
    case 'sfx':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M10.6 2.2L5.7 9H9.2L7.5 15.8L12.4 9H8.9L10.6 2.2Z" fill={stroke} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    case 'gem':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M5 4.2H13L15.3 7.4L9 14.6L2.7 7.4L5 4.2Z" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M6.2 4.4L9 14.2L11.8 4.4" stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      );
    case 'bg':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2.2" y="3.2" width="13.6" height="11.2" rx="2.6" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M4.6 11.6L7.2 9.2L9.1 10.9L11.8 8.1L13.4 9.7" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="6.6" r="1.1" fill={stroke} />
        </svg>
      );
    case 'hidden':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 2.4L10.5 6.3L14.7 6.5L11.4 9.2L12.6 13.3L9 10.8L5.4 13.3L6.6 9.2L3.3 6.5L7.5 6.3L9 2.4Z" fill={stroke} />
        </svg>
      );
    default:
      return null;
  }
}

function LevelRewardBadge({ type, locked = false }: { type: RewardType; locked?: boolean }) {
  const badgeClass =
    type === 'evolution'
      ? 'bg-gradient-to-b from-[#FFD86C] to-[#FFB83A] border-white text-[#7B4F00]'
      : type === 'sfx'
      ? 'bg-gradient-to-b from-[#FFA851] to-[#FF7E21] border-white text-white'
      : type === 'gem'
      ? 'bg-gradient-to-b from-[#9AB0FF] to-[#6D79FF] border-white text-white'
      : type === 'hidden'
      ? 'bg-gradient-to-b from-[#ffe9a6] to-[#7b63ff] border-white text-white'
      : 'bg-gradient-to-b from-[#7CDCC8] to-[#28B89D] border-white text-white';

  return (
    <div
      className={`absolute right-[5px] top-[5px] z-[60] flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-md ${badgeClass}`}
      title={
        type === 'evolution'
          ? '本关奖励：进化'
          : type === 'sfx'
          ? '本关奖励：能力升级'
          : type === 'gem'
          ? '本关奖励：新宝石'
          : type === 'hidden'
          ? '本关奖励：隐藏形态'
          : '本关奖励：新地图'
      }
    >
      <RewardTypeIcon type={type} locked={locked} />
    </div>
  );
}

export default function MapScreen({
  gradeId,
  onStart,
  onOpenPokedex,
  unlockedLevels,
  completedLevels,
  puzzlePieces,
  maxLevels = MAX_LEVELS
}: {
  gradeId: string;
  onStart: (levelId: number) => void;
  onOpenPokedex: () => void;
  unlockedLevels: number[];
  completedLevels: number[];
  puzzlePieces: number;
  maxLevels?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentLevelRef = useRef<HTMLDivElement>(null);
  const [isCurrentLevelVisible, setIsCurrentLevelVisible] = useState(true);

  const gradeData = allLevelsData[gradeId as keyof typeof allLevelsData];

  // 三年级使用一年级背景图
  const gradeBackgrounds: Record<string, string> = {
    'k': '/images/幼儿园关卡背景图.png',
    '1': '/images/一年级关卡背景图.png',
    '2': '/images/二年级关卡背景图.png',
    '3': '/images/一年级关卡背景图.png' // 三年级使用一年级背景
  };

  // 宠物图鉴按钮切图
  const pokedexButton = pokedexButtonImage;

  // 精心设计的159关蜿蜒路径 - 统一间距模式
  const levels = [
    // 底部起点 (1-5)
    { id: 1, top: 240, left: 50 },
    { id: 2, top: 228, left: 30 },
    { id: 3, top: 222, left: 55 },
    { id: 4, top: 216, left: 70 },
    { id: 5, top: 210, left: 40 },
    { id: 6, top: 202, left: 25 },
    { id: 7, top: 194, left: 45 },
    { id: 8, top: 188, left: 65 },
    { id: 9, top: 182, left: 35 },
    { id: 10, top: 174, left: 55 },
    { id: 11, top: 168, left: 75 },
    { id: 12, top: 162, left: 45 },
    { id: 13, top: 154, left: 28 },
    { id: 14, top: 148, left: 58 },
    { id: 15, top: 142, left: 38 },
    { id: 16, top: 134, left: 22 },
    { id: 17, top: 128, left: 48 },
    { id: 18, top: 122, left: 68 },
    { id: 19, top: 116, left: 42 },
    { id: 20, top: 110, left: 60 },
    { id: 21, top: 102, left: 32 },
    { id: 22, top: 96, left: 52 },
    { id: 23, top: 90, left: 72 },
    { id: 24, top: 84, left: 45 },
    { id: 25, top: 78, left: 28 },
    { id: 26, top: 70, left: 50 },
    { id: 27, top: 64, left: 35 },
    { id: 28, top: 58, left: 60 },
    { id: 29, top: 52, left: 42 },
    { id: 30, top: 46, left: 65 },
    { id: 31, top: 38, left: 38 },
    { id: 32, top: 32, left: 55 },
    { id: 33, top: 26, left: 25 },
    { id: 34, top: 20, left: 48 },
    { id: 35, top: 14, left: 70 },
    { id: 36, top: 6, left: 42 },
    { id: 37, top: 0, left: 30 },
    { id: 38, top: -6, left: 58 },
    { id: 39, top: -12, left: 40 },
    { id: 40, top: -18, left: 65 },
    { id: 41, top: -26, left: 35 },
    { id: 42, top: -32, left: 52 },
    { id: 43, top: -38, left: 22 },
    { id: 44, top: -44, left: 48 },
    { id: 45, top: -50, left: 68 },
    // 最后冲刺 (46-50)
    { id: 46, top: -58, left: 38 },
    { id: 47, top: -64, left: 55 },
    { id: 48, top: -70, left: 42 },
    { id: 49, top: -76, left: 60 },
    { id: 50, top: -82, left: 50 },
    // 延展段 (51-159) - 循环使用1-50关的间距模式
    { id: 51, top: -94, left: 50 },
    { id: 52, top: -100, left: 30 },
    { id: 53, top: -106, left: 55 },
    { id: 54, top: -112, left: 70 },
    { id: 55, top: -120, left: 40 },
    { id: 56, top: -128, left: 25 },
    { id: 57, top: -134, left: 45 },
    { id: 58, top: -140, left: 65 },
    { id: 59, top: -148, left: 35 },
    { id: 60, top: -154, left: 55 },
    // 第61-80关
    { id: 61, top: -160, left: 75 },
    { id: 62, top: -168, left: 45 },
    { id: 63, top: -174, left: 28 },
    { id: 64, top: -180, left: 58 },
    { id: 65, top: -188, left: 38 },
    { id: 66, top: -194, left: 22 },
    { id: 67, top: -200, left: 48 },
    { id: 68, top: -206, left: 68 },
    { id: 69, top: -212, left: 42 },
    { id: 70, top: -220, left: 60 },
    { id: 71, top: -226, left: 32 },
    { id: 72, top: -232, left: 52 },
    { id: 73, top: -238, left: 72 },
    { id: 74, top: -244, left: 45 },
    { id: 75, top: -252, left: 28 },
    { id: 76, top: -258, left: 50 },
    { id: 77, top: -264, left: 35 },
    { id: 78, top: -270, left: 60 },
    { id: 79, top: -276, left: 42 },
    { id: 80, top: -284, left: 65 },
    // 第81-100关
    { id: 81, top: -290, left: 38 },
    { id: 82, top: -296, left: 55 },
    { id: 83, top: -302, left: 25 },
    { id: 84, top: -308, left: 48 },
    { id: 85, top: -316, left: 70 },
    { id: 86, top: -322, left: 42 },
    { id: 87, top: -328, left: 30 },
    { id: 88, top: -334, left: 58 },
    { id: 89, top: -340, left: 40 },
    { id: 90, top: -348, left: 65 },
    { id: 91, top: -354, left: 35 },
    { id: 92, top: -360, left: 52 },
    { id: 93, top: -366, left: 22 },
    { id: 94, top: -372, left: 48 },
    { id: 95, top: -380, left: 68 },
    { id: 96, top: -386, left: 38 },
    { id: 97, top: -392, left: 55 },
    { id: 98, top: -398, left: 42 },
    { id: 99, top: -404, left: 60 },
    { id: 100, top: -416, left: 50 },
    // 第101-120关
    { id: 101, top: -422, left: 50 },
    { id: 102, top: -428, left: 30 },
    { id: 103, top: -434, left: 55 },
    { id: 104, top: -442, left: 70 },
    { id: 105, top: -450, left: 40 },
    { id: 106, top: -456, left: 25 },
    { id: 107, top: -462, left: 45 },
    { id: 108, top: -470, left: 65 },
    { id: 109, top: -476, left: 35 },
    { id: 110, top: -482, left: 55 },
    { id: 111, top: -490, left: 75 },
    { id: 112, top: -496, left: 45 },
    { id: 113, top: -502, left: 28 },
    { id: 114, top: -510, left: 58 },
    { id: 115, top: -516, left: 38 },
    { id: 116, top: -522, left: 22 },
    { id: 117, top: -528, left: 48 },
    { id: 118, top: -534, left: 68 },
    { id: 119, top: -542, left: 42 },
    { id: 120, top: -548, left: 60 },
    // 第121-140关
    { id: 121, top: -554, left: 32 },
    { id: 122, top: -560, left: 52 },
    { id: 123, top: -566, left: 72 },
    { id: 124, top: -574, left: 45 },
    { id: 125, top: -580, left: 28 },
    { id: 126, top: -586, left: 50 },
    { id: 127, top: -592, left: 35 },
    { id: 128, top: -598, left: 60 },
    { id: 129, top: -606, left: 42 },
    { id: 130, top: -612, left: 65 },
    { id: 131, top: -618, left: 38 },
    { id: 132, top: -624, left: 55 },
    { id: 133, top: -630, left: 25 },
    { id: 134, top: -638, left: 48 },
    { id: 135, top: -644, left: 70 },
    { id: 136, top: -650, left: 42 },
    { id: 137, top: -656, left: 30 },
    { id: 138, top: -662, left: 58 },
    { id: 139, top: -670, left: 40 },
    { id: 140, top: -676, left: 65 },
    // 第141-159关
    { id: 141, top: -682, left: 35 },
    { id: 142, top: -688, left: 52 },
    { id: 143, top: -694, left: 22 },
    { id: 144, top: -702, left: 48 },
    { id: 145, top: -708, left: 68 },
    { id: 146, top: -714, left: 38 },
    { id: 147, top: -720, left: 55 },
    { id: 148, top: -726, left: 42 },
    { id: 149, top: -738, left: 60 },
    { id: 150, top: -744, left: 50 },
    { id: 151, top: -750, left: 50 },
    { id: 152, top: -756, left: 30 },
    { id: 153, top: -764, left: 55 },
    { id: 154, top: -772, left: 70 },
    { id: 155, top: -778, left: 40 },
    { id: 156, top: -784, left: 25 },
    { id: 157, top: -792, left: 45 },
    { id: 158, top: -798, left: 65 },
    { id: 159, top: -804, left: 35 },
  ];

  // 组件挂载后执行一次滚动
  useEffect(() => {
    const scrollToCurrentLevel = (attemptNumber: number) => {
      if (!scrollRef.current || unlockedLevels.length === 0) {
        console.log(`Attempt ${attemptNumber}: Cannot scroll - ref or levels missing`);
        return false;
      }

      const targetLevel = getHighestUnlockedLevel(unlockedLevels, levels);

      if (!targetLevel) {
        console.log(`Attempt ${attemptNumber}: Cannot scroll - target level not found`);
        return false;
      }

      const scrollContainer = scrollRef.current;
      const containerHeight = scrollContainer.clientHeight;
      const scrollHeight = scrollContainer.scrollHeight;

      if (scrollHeight === 0) {
        console.log(`Attempt ${attemptNumber}: scrollHeight is 0, retrying...`);
        return false;
      }

      const highestLevel = targetLevel.id;
      const targetRatio = getLevelProgressRatio(targetLevel.top);
      const finalScrollTop = getScrollTopForLevel({
        levelTop: targetLevel.top,
        scrollHeight,
        containerHeight,
      });

      console.log(`Attempt ${attemptNumber}: Scrolling to level ${highestLevel}:`, {
        targetTop: targetLevel.top,
        targetRatio: targetRatio.toFixed(2),
        scrollHeight,
        finalScrollTop: Math.round(finalScrollTop)
      });

      scrollContainer.scrollTo({
        top: finalScrollTop,
        behavior: attemptNumber === 1 ? 'auto' : 'smooth'
      });

      // 验证滚动是否生效
      setTimeout(() => {
        console.log(`After scroll: scrollTop = ${scrollContainer.scrollTop}, expected ~${Math.round(finalScrollTop)}`);
      }, 100);

      return true;
    };

    // 使用递增延迟确保DOM完全渲染
    const delays = [50, 200, 500, 1000, 2000];
    let success = false;

    delays.forEach((delay, index) => {
      setTimeout(() => {
        if (!success) {
          const result = scrollToCurrentLevel(index + 1);
          if (result) success = true;
        }
      }, delay);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedLevels]);

  useEffect(() => {
    warmupMapBgm();
    void startMapBgm();

    const resumeMapBgm = () => {
      void primeMapBgm();
    };

    window.addEventListener('pointerdown', resumeMapBgm, { passive: true });
    window.addEventListener('keydown', resumeMapBgm);

    return () => {
      window.removeEventListener('pointerdown', resumeMapBgm);
      window.removeEventListener('keydown', resumeMapBgm);
      stopMapBgm();
    };
  }, []);

  // 监听滚动，检测当前关卡头像是否在可视区域内
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || unlockedLevels.length === 0) return;

    const checkVisibility = () => {
      const targetLevel = getHighestUnlockedLevel(unlockedLevels, levels);
      if (!targetLevel) return;

      const containerHeight = scrollContainer.clientHeight;
      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight;

      // 计算目标关卡的位置（头像在关卡上方约50px）
      const targetRatio = getLevelProgressRatio(targetLevel.top);
      const levelOffset = targetRatio * scrollHeight - 50;

      // 判断是否在可视区域内（留一些缓冲）
      const buffer = 80;
      const isVisible = levelOffset >= scrollTop - buffer && levelOffset <= scrollTop + containerHeight + buffer;
      setIsCurrentLevelVisible(isVisible);
    };

    checkVisibility();
    scrollContainer.addEventListener('scroll', checkVisibility, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', checkVisibility);
  }, [unlockedLevels]);

  // 生成蜿蜒路径的SVG路径数据
  const generateWindingPath = () => {
    let pathD = '';

    for (let i = 0; i < levels.length; i++) {
      const current = levels[i];
      const x = current.left;
      // SVG坐标：关卡1在底部(y=1044)，关卡159在顶部(y=0)
      const y = current.top + 804;

      if (i === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        const prev = levels[i - 1];
        const prevY = prev.top + 804;
        const currentY = current.top + 804;

        // 使用更平滑的贝塞尔曲线
        const midY = (prevY + currentY) / 2;
        const deltaX = current.left - prev.left;

        // 控制点1：从前一个点延伸出来
        const cp1x = prev.left + deltaX * 0.3;
        const cp1y = prevY - (prevY - currentY) * 0.2;

        // 控制点2：向当前点接近
        const cp2x = current.left - deltaX * 0.3;
        const cp2y = midY;

        pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    }

    return pathD;
  };

  // 手动滚动到当前关卡函数
  const handleManualScroll = () => {
    if (!scrollRef.current || unlockedLevels.length === 0) {
      console.log('Manual scroll: ref or levels missing');
      return;
    }

    const targetLevel = getHighestUnlockedLevel(unlockedLevels, levels);

    if (!targetLevel) {
      console.log('Manual scroll: target level not found');
      return;
    }

    const scrollContainer = scrollRef.current;
    const containerHeight = scrollContainer.clientHeight;
    const scrollHeight = scrollContainer.scrollHeight;
    const targetRatio = getLevelProgressRatio(targetLevel.top);
    const finalScrollTop = getScrollTopForLevel({
      levelTop: targetLevel.top,
      scrollHeight,
      containerHeight,
    });

    console.log('Manual scrolling:', {
      targetTop: targetLevel.top,
      targetRatio: targetRatio.toFixed(2),
      finalScrollTop: Math.round(finalScrollTop),
      currentScrollTop: Math.round(scrollContainer.scrollTop)
    });

    scrollContainer.scrollTo({
      top: finalScrollTop,
      behavior: 'smooth'
    });
  };

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* 背景图 */}
      <div className="absolute inset-0 z-0">
        <img
          src={gradeBackgrounds[gradeId] || gradeBackgrounds['k']}
          alt="关卡背景"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 漂浮云朵 - 从年级岛屿页保留 */}
      <div className="absolute inset-0 z-[50] overflow-hidden pointer-events-none">
        {/* 云朵1 - 大白云 */}
        <motion.div
          initial={{ x: 100 }}
          animate={{ x: 1200 }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
            repeatDelay: 5
          }}
          className="absolute top-[12%]"
        >
          <svg width="160" height="70" viewBox="0 0 160 70" className="opacity-75">
            <defs>
              <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#F0F8FF" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M25,50 Q15,50 15,40 Q15,28 28,28 Q32,15 52,15 Q68,8 88,15 Q102,12 116,24 Q130,20 140,35 Q150,35 150,48 Q150,58 136,58 L35,58 Q25,58 25,50Z"
              fill="url(#cloudGrad1)"
            />
          </svg>
        </motion.div>

        {/* 云朵2 - 中等 */}
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 1400 }}
          transition={{
            duration: 65,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
            repeatDelay: 3
          }}
          className="absolute top-[35%]"
        >
          <svg width="130" height="55" viewBox="0 0 130 55" className="opacity-65">
            <defs>
              <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E8F4FF" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <path
              d="M22,42 Q12,42 12,32 Q12,22 24,22 Q28,12 46,12 Q58,6 74,12 Q86,10 96,20 Q108,16 116,28 Q124,28 124,38 Q124,46 112,46 L26,46 Q22,42 22,42Z"
              fill="url(#cloudGrad2)"
            />
          </svg>
        </motion.div>

        {/* 云朵3 - 小云朵 */}
        <motion.div
          initial={{ x: 750 }}
          animate={{ x: 1500 }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
            repeatDelay: 8
          }}
          className="absolute top-[58%]"
        >
          <svg width="90" height="42" viewBox="0 0 90 42" className="opacity-55">
            <defs>
              <linearGradient id="cloudGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#F5FAFF" stopOpacity="0.65" />
              </linearGradient>
            </defs>
            <path
              d="M15,34 Q10,34 10,26 Q10,18 18,18 Q22,10 34,10 Q44,6 54,12 Q64,8 70,18 Q78,18 78,26 Q78,32 68,32 L18,32 Q15,34 15,34Z"
              fill="url(#cloudGrad3)"
            />
          </svg>
        </motion.div>
      </div>

      {/* 顶部导航栏 */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-end items-start z-20 pointer-events-none">
        {/* 宠物图鉴按钮 - 使用切图，放大50% */}
        <button
          onClick={onOpenPokedex}
          className="pointer-events-auto active:scale-95 transition-transform relative"
        >
          <img
            src={pokedexButton}
            alt="宠物图鉴"
            className="h-18 w-auto object-contain"
            style={{ height: '72px' }}
          />
        </button>
      </div>

      {/* 地图区域 - 可滚动 */}
      <div
        ref={scrollRef}
        className="flex-1 relative overflow-y-auto overflow-x-hidden pt-20"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        <div className="w-full relative" style={{ height: '1296vh' }}>
          {/* SVG蜿蜒路径 - viewBox匹配关卡坐标系 */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 1044"
            preserveAspectRatio="none"
          >
            {/* 路径阴影 - 加粗100% */}
            <path
              d={generateWindingPath()}
              fill="none"
              stroke="rgba(0,0,0,0.12)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0.2, 0.2)"
            />
            {/* 主路径 - 泥土路 - 加粗100% */}
            <path
              d={generateWindingPath()}
              fill="none"
              stroke="#8D6E63"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 路径高光 - 加粗100% */}
            <path
              d={generateWindingPath()}
              fill="none"
              stroke="#A1887F"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0.2 1"
            />
          </svg>

          {/* 关卡节点 - 使用百分比定位匹配SVG坐标系 */}
          {levels.map((level) => {
            const isUnlocked = unlockedLevels.includes(level.id);
            const isCurrent = Math.max(...unlockedLevels, 0) === level.id && isUnlocked;
            const isCompleted = completedLevels.includes(level.id);
            const isHiddenFinalNode = level.id === 159;
            const rewardType = getMapRewardType(level.id);
            const showRewardBadge = Boolean(rewardType) && !isCompleted;
            // 将level.top (240 到 -804) 映射到 CSS百分比 (100% 到 0%)
            // 关卡1 (240) -> 100% (底部), 关卡159 (-804) -> 0% (顶部)
            const cssTopPercent = ((level.top + 804) / 1044) * 100;

            return (
              <div
                key={level.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{
                  left: `${level.left}%`,
                  top: `${cssTopPercent}%`,
                  zIndex: isCurrent ? 25 : 12,
                }}
              >
                {isUnlocked ? (
                  <motion.button
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onStart(level.id)}
                    className="relative flex flex-col items-center cursor-pointer"
                  >
                    {showRewardBadge && <LevelRewardBadge type={rewardType!} />}

                    {/* 当前关卡标记 - 使用头像切图，最高层级，放大20% */}
                    {isCurrent && (
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className="absolute -top-12 z-[200]"
                      >
                        <img
                          src="/images/我的头像.png"
                          alt="我的头像"
                          className="w-14 h-14 rounded-full border-2 border-white shadow-lg object-cover"
                        />
                      </motion.div>
                    )}

                    {/* 关卡按钮 */}
                    <div
                      className={`relative flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? isHiddenFinalNode
                            ? 'drop-shadow-[0_0_22px_rgba(251,191,36,0.95)]'
                            : 'drop-shadow-[0_0_15px_rgba(255,193,7,0.7)]'
                          : isHiddenFinalNode
                          ? 'drop-shadow-[0_0_14px_rgba(246,211,101,0.6)]'
                          : ''
                      }`}
                    >
                      {/* 底座阴影 */}
                      <div
                        className={`absolute top-3 w-18 h-4 rounded-full ${
                          isHiddenFinalNode
                            ? 'bg-amber-700/45'
                            : isCurrent
                            ? 'bg-orange-600/40'
                            : isCompleted
                            ? 'bg-green-700/30'
                            : 'bg-blue-700/30'
                        }`}
                      />
                      {/* 主体 */}
                      <div
                        className={`relative flex items-center justify-center border-4 border-white shadow-lg ${
                          isHiddenFinalNode
                            ? 'bg-gradient-to-br from-[#43326d] via-[#8873ff] to-[#ffe38d]'
                            : isCurrent
                            ? 'bg-gradient-to-br from-yellow-300 to-orange-400'
                            : isCompleted
                            ? 'bg-gradient-to-br from-green-300 to-green-500'
                            : 'bg-gradient-to-br from-blue-300 to-blue-500'
                        }`}
                        style={{
                          width: '84px',
                          height: '84px',
                          borderRadius: '40% 60% 65% 35% / 45% 50% 55% 50%',
                          boxShadow: isHiddenFinalNode
                            ? '0 9px 0 #6B4FD1, 0 0 20px rgba(255,231,160,0.7), 0 12px 22px rgba(0,0,0,0.24)'
                            : isCurrent
                            ? '0 9px 0 #E65100, 0 12px 22px rgba(0,0,0,0.2)'
                            : isCompleted
                            ? '0 9px 0 #2E7D32, 0 12px 22px rgba(0,0,0,0.15)'
                            : '0 9px 0 #1976D2, 0 12px 22px rgba(0,0,0,0.15)'
                        }}
                      >
                        {isHiddenFinalNode ? (
                          <>
                            <div className="absolute inset-2 rounded-[38%_62%_60%_40%/48%_48%_52%_52%] border border-white/35" />
                            <span className="text-3xl font-black text-white drop-shadow-md">{level.id}</span>
                          </>
                        ) : (
                          <span className="text-3xl font-black text-white drop-shadow-md">{level.id}</span>
                        )}
                      </div>
                      {/* 高光 */}
                      <div className={`absolute top-2 left-3 h-2 rounded-full ${isHiddenFinalNode ? 'w-5 bg-white/55' : 'w-4 bg-white/40'}`} />
                    </div>
                  </motion.button>
                ) : (
                  <div className="relative flex items-center justify-center">
                    {showRewardBadge && <LevelRewardBadge type={rewardType!} locked />}
                    {/* 锁定的关卡 - 实色，去掉半透明 */}
                    <div
                      className={`flex items-center justify-center border-3 shadow-md ${
                        isHiddenFinalNode
                          ? 'bg-gradient-to-br from-[#4a3d74] via-[#6b5ca5] to-[#b59dff] border-white/70'
                          : 'bg-gradient-to-br from-gray-400 to-gray-500 border-white/50'
                      }`}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '35% 65% 70% 30% / 40% 55% 50% 45%',
                        boxShadow: isHiddenFinalNode
                          ? '0 7px 0 #56439a, 0 0 16px rgba(255,231,160,0.4)'
                          : '0 7px 0 #9ca3af'
                      }}
                    >
                      <Lock className={isHiddenFinalNode ? 'text-amber-100' : 'text-gray-600'} size={30} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 终点旗帜 - 降低层级避免遮挡第159关 */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[5]"
            style={{ top: `${((levels[158].top + 804) / 1044) * 100}%` }}
          >
            <motion.div
              animate={{ rotate: [0, 8, 0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-2xl"
            >
              🏆
            </motion.div>
          </div>
        </div>
      </div>

      {/* 返回当前关卡按钮 - 弱化UI，仅在头像不在可视区域时显示 */}
      {!isCurrentLevelVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={handleManualScroll}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto
                     px-3 py-1.5 rounded-full
                     bg-white/70 backdrop-blur-sm text-gray-600 text-xs font-medium
                     shadow-sm border border-white/50
                     hover:bg-white/90 hover:text-gray-800
                     active:scale-95 transition-all"
        >
          返回当前关卡
        </motion.button>
      )}

      {gradeId === '3' && (
        <button
          onClick={() => onStart(0)}
          className="absolute bottom-6 right-6 z-20 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-gray-700 shadow-md border border-white/70 hover:bg-white active:scale-95 transition-all"
        >
          第0关
        </button>
      )}
    </div>
  );
}
