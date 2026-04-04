import homeMapBgmUrl from '../../UI v2.0/首页路径bgm.mp3';

const MAP_BGM_VOLUME = 0.2;

let mapBgm: HTMLAudioElement | null = null;
let mapBgmWarmupDone = false;
let mapBgmWarmupHandle: number | ReturnType<typeof setTimeout> | null = null;

const getMapBgm = () => {
  if (typeof window === 'undefined') return null;
  if (!mapBgm) {
    mapBgm = new Audio(homeMapBgmUrl);
    mapBgm.loop = true;
    mapBgm.preload = 'metadata';
    mapBgm.volume = MAP_BGM_VOLUME;
  }
  return mapBgm;
};

const performMapBgmWarmup = () => {
  const bgm = getMapBgm();
  if (!bgm || mapBgmWarmupDone) return;
  mapBgmWarmupDone = true;
  bgm.load();
};

export const warmupMapBgm = () => {
  if (typeof window === 'undefined' || mapBgmWarmupDone || mapBgmWarmupHandle !== null) return;

  if ('requestIdleCallback' in window) {
    mapBgmWarmupHandle = window.requestIdleCallback(() => {
      mapBgmWarmupHandle = null;
      performMapBgmWarmup();
    }, { timeout: 1200 });
    return;
  }

  mapBgmWarmupHandle = globalThis.setTimeout(() => {
    mapBgmWarmupHandle = null;
    performMapBgmWarmup();
  }, 220);
};

export const startMapBgm = async () => {
  const bgm = getMapBgm();
  if (!bgm) return;
  warmupMapBgm();
  bgm.volume = MAP_BGM_VOLUME;
  if (!bgm.paused) return;
  try {
    await bgm.play();
  } catch {
    // Autoplay may be blocked until first user interaction.
  }
};

export const primeMapBgm = async () => {
  warmupMapBgm();
  await startMapBgm();
};

export const stopMapBgm = () => {
  if (typeof window !== 'undefined' && mapBgmWarmupHandle !== null) {
    if ('cancelIdleCallback' in window) {
      window.cancelIdleCallback(mapBgmWarmupHandle as number);
    } else {
      globalThis.clearTimeout(mapBgmWarmupHandle);
    }
    mapBgmWarmupHandle = null;
  }

  if (!mapBgm) return;
  mapBgm.pause();
  mapBgm.currentTime = 0;
};
