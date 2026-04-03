/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import MapScreen from './components/MapScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import PokedexScreen from './components/PokedexScreen';
import PetUnlockModal from './components/PetUnlockModal';
import { petsData } from './data/pets';

type Screen = 'map' | 'quiz' | 'result';
type GradeKey = 'k' | '1' | '2' | '3';

interface GradeData {
  unlockedLevels: number[];
  puzzlePieces: number;
}

type GameData = Record<GradeKey, GradeData>;

const MAX_LEVELS = 50; // 每个年级50关

const defaultData: GameData = {
  k: { unlockedLevels: [1], puzzlePieces: 0 },
  '1': { unlockedLevels: [1], puzzlePieces: 0 },
  '2': { unlockedLevels: [1], puzzlePieces: 0 },
  '3': { unlockedLevels: [1], puzzlePieces: 0 },
};

export default function App() {
  // 直接进入三年级关卡地图
  const [currentScreen, setCurrentScreen] = useState<Screen>('map');
  const [currentGrade, setCurrentGrade] = useState<GradeKey>('3');
  const [stats, setStats] = useState({ accuracy: 0, time: 0, maxCombo: 0 });
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [selectedPetId, setSelectedPetId] = useState<number>(() => {
    const saved = localStorage.getItem('selectedPetId');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [newlyUnlockedPetId, setNewlyUnlockedPetId] = useState<number | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showPokedexModal, setShowPokedexModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedPetId', selectedPetId.toString());
  }, [selectedPetId]);

  const [gameData, setGameData] = useState<GameData>(() => {
    const saved = localStorage.getItem('gameDataV3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultData;
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('gameDataV3', JSON.stringify(gameData));
  }, [gameData]);

  const handleLevelComplete = (levelStats: { accuracy: number; time: number; maxCombo: number }) => {
    setStats(levelStats);

    setGameData(prev => {
      const currentData = prev[currentGrade];
      const oldPuzzlePieces = currentData.puzzlePieces;
      const newPuzzlePieces = oldPuzzlePieces + 1;
      const newUnlocked = [...currentData.unlockedLevels];

      // 解锁下一关（最多50关）
      if (!newUnlocked.includes(currentLevelId + 1) && currentLevelId < MAX_LEVELS) {
        newUnlocked.push(currentLevelId + 1);
      }

      // 检查是否解锁了新伙伴
      const newlyUnlockedPet = petsData.find(pet =>
        pet.requiredPieces > oldPuzzlePieces && pet.requiredPieces <= newPuzzlePieces
      );

      if (newlyUnlockedPet) {
        setTimeout(() => {
          setNewlyUnlockedPetId(newlyUnlockedPet.id);
          setShowUnlockModal(true);
        }, 800);
      }

      return {
        ...prev,
        [currentGrade]: {
          unlockedLevels: newUnlocked,
          puzzlePieces: newPuzzlePieces
        }
      };
    });

    setCurrentScreen('result');
  };

  const currentGradeData = gameData[currentGrade];

  return (
    <div className="w-full h-screen bg-gray-100 flex justify-center items-center overflow-hidden font-sans">
      <div className="w-[1024px] h-[768px] bg-white relative shadow-xl overflow-hidden rounded-2xl">
        {currentScreen === 'map' && (
          <MapScreen
            gradeId={currentGrade}
            unlockedLevels={currentGradeData.unlockedLevels}
            puzzlePieces={currentGradeData.puzzlePieces}
            maxLevels={MAX_LEVELS}
            onStart={(levelId) => {
              setCurrentLevelId(levelId);
              setCurrentScreen('quiz');
            }}
            onOpenPokedex={() => setShowPokedexModal(true)}
          />
        )}
        {currentScreen === 'quiz' && (
          <QuizScreen
            gradeId={currentGrade}
            levelId={currentLevelId}
            selectedPet={petsData.find(p => p.id === selectedPetId) || petsData[0]}
            onFinish={handleLevelComplete}
            onBack={() => setCurrentScreen('map')}
          />
        )}
        {currentScreen === 'result' && (
          <ResultScreen
            stats={stats}
            puzzlePieces={currentGradeData.puzzlePieces}
            onBack={() => setCurrentScreen('map')}
            onNextLevel={() => {
              if (currentLevelId < MAX_LEVELS) {
                setCurrentLevelId(currentLevelId + 1);
                setCurrentScreen('quiz');
              } else {
                setCurrentScreen('map');
              }
            }}
            onOpenPokedex={() => setShowPokedexModal(true)}
            hasNextLevel={currentLevelId < MAX_LEVELS && currentGradeData.unlockedLevels.includes(currentLevelId + 1)}
          />
        )}

        <PokedexScreen
          isOpen={showPokedexModal}
          puzzlePieces={currentGradeData.puzzlePieces}
          selectedPetId={selectedPetId}
          onSelectPet={setSelectedPetId}
          onClose={() => setShowPokedexModal(false)}
        />

        {/* 伙伴解锁弹窗 */}
        <PetUnlockModal
          isOpen={showUnlockModal}
          petId={newlyUnlockedPetId ?? 0}
          selectedPetId={selectedPetId}
          onClose={() => setShowUnlockModal(false)}
          onSetAsPartner={setSelectedPetId}
          onViewPokedex={() => setShowPokedexModal(true)}
        />
      </div>
    </div>
  );
}