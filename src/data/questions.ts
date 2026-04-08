/**
 * Math Adventure 题目数据
 * 基于《人教版小学数学》知识点体系
 * 4个年级 × 50关 × 10题 = 2000题
 */

export type QuestionType = 'vertical_addition' | 'multi_vertical' | 'number_comparison' | 'text_to_number' | 'counting' | 'input' | 'choice';

export interface Question {
  id: string;
  type: QuestionType;
  text?: string;
  label?: string;
  num1?: number;
  num2?: number;
  num3?: number;
  operator?: '+' | '-' | '×' | '÷';
  question?: string;
  emoji?: string;
  count?: number;
  options?: string[];
  answer: string;
  answerLength: number;
}

export interface LevelData {
  title: string;
  questions: Question[];
}

// ============================================
// 演示关卡（幼儿园第1关）- 包含所有题型
// ============================================
const demoLevel: LevelData = {
  title: '综合演示关卡',
  questions: [
    // 竖式加法
    { id: 'demo_1', type: 'vertical_addition', num1: 3, num2: 5, operator: '+', answer: '8', answerLength: 1 },
    // 竖式减法
    { id: 'demo_2', type: 'vertical_addition', num1: 9, num2: 4, operator: '-', answer: '5', answerLength: 1 },
    // 比较大小
    { id: 'demo_3', type: 'number_comparison', num1: 7, num2: 5, answer: '>', answerLength: 1 },
    // 读作写作
    { id: 'demo_4', type: 'text_to_number', text: '读作：十五', label: '写作：', answer: '15', answerLength: 2 },
    // 数物对应
    { id: 'demo_5', type: 'counting', emoji: '🍎', count: 6, answer: '6', answerLength: 1 },
    // 输入题（乘法）
    { id: 'demo_6', type: 'input', question: '3 × 4 =', answer: '12', answerLength: 2 },
    // 竖式加法（两位数）
    { id: 'demo_7', type: 'vertical_addition', num1: 25, num2: 18, operator: '+', answer: '43', answerLength: 2 },
    // 输入题（除法）
    { id: 'demo_8', type: 'input', question: '24 ÷ 6 =', answer: '4', answerLength: 1 },
    // 比较大小（两位数）
    { id: 'demo_9', type: 'number_comparison', num1: 45, num2: 54, answer: '<', answerLength: 1 },
    // 数物对应（不同emoji）
    { id: 'demo_10', type: 'counting', emoji: '⭐', count: 8, answer: '8', answerLength: 1 },
  ]
};

// ============================================
// 题目生成辅助函数
// ============================================

function generateId(grade: string, level: number, q: number): string {
  return `${grade}_${level}_${q}`;
}

// ============================================
// 幼儿园 50关
// ============================================

function generateKindergartenLevels(): Record<number, LevelData> {
  const levels: Record<number, LevelData> = {};
  const emojis = ['🍎', '⭐', '🌸', '🐱', '🌈', '🟦', '🔶', '🟢', '🔵', '🟡'];

  // 第1关：演示关卡
  levels[1] = demoLevel;

  // 第2-10关：数字认识
  for (let level = 2; level <= 10; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const count = (level * 10 + q) % 10 + 1;
      const emoji = emojis[(level + q) % emojis.length];
      questions.push({
        id: generateId('k', level, q),
        type: 'counting',
        emoji,
        count,
        answer: count.toString(),
        answerLength: 1
      });
    }
    levels[level] = { title: `数字认识 ${level - 1}`, questions };
  }

  // 第11-20关：比较大小
  for (let level = 11; level <= 20; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const num1 = ((level - 11) * 10 + q) % 10 + 1;
      const num2 = ((level - 11) * 10 + q + 3) % 10 + 1;
      questions.push({
        id: generateId('k', level, q),
        type: 'number_comparison',
        num1,
        num2,
        answer: num1 > num2 ? '>' : num1 < num2 ? '<' : '=',
        answerLength: 1
      });
    }
    levels[level] = { title: `比较大小 ${level - 10}`, questions };
  }

  // 第21-35关：简单加法
  for (let level = 21; level <= 35; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const a = ((level - 21) * 10 + q) % 5 + 1;
      const b = Math.min(10 - a, ((level - 21) * 10 + q + 2) % 5 + 1);
      const sum = a + b;
      questions.push({
        id: generateId('k', level, q),
        type: 'vertical_addition',
        num1: a,
        num2: b,
        operator: '+',
        answer: sum.toString(),
        answerLength: sum >= 10 ? 2 : 1
      });
    }
    levels[level] = { title: `简单加法 ${level - 20}`, questions };
  }

  // 第36-50关：简单减法
  for (let level = 36; level <= 50; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const a = ((level - 36) * 10 + q) % 5 + 5;
      const b = ((level - 36) * 10 + q + 1) % (a - 1) + 1;
      const diff = a - b;
      questions.push({
        id: generateId('k', level, q),
        type: 'vertical_addition',
        num1: a,
        num2: b,
        operator: '-',
        answer: diff.toString(),
        answerLength: 1
      });
    }
    levels[level] = { title: `简单减法 ${level - 35}`, questions };
  }

  return levels;
}

// ============================================
// 一年级 50关
// ============================================

function generateGrade1Levels(): Record<number, LevelData> {
  const levels: Record<number, LevelData> = {};

  // 第1-8关：1-5加减
  for (let level = 1; level <= 8; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const a = ((level - 1) * 10 + q) % 5 + 1;
      const b = ((level - 1) * 10 + q + 1) % 5 + 1;
      const isAdd = ((level - 1) * 10 + q) % 2 === 0;

      if (isAdd) {
        const sum = a + b;
        questions.push({
          id: generateId('g1', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '+',
          answer: sum.toString(),
          answerLength: sum >= 10 ? 2 : 1
        });
      } else {
        const bigger = Math.max(a, b);
        const smaller = Math.min(a, b);
        questions.push({
          id: generateId('g1', level, q),
          type: 'vertical_addition',
          num1: bigger,
          num2: smaller,
          operator: '-',
          answer: (bigger - smaller).toString(),
          answerLength: 1
        });
      }
    }
    levels[level] = { title: `1-5加减 ${level}`, questions };
  }

  // 第9-16关：6-10加减
  for (let level = 9; level <= 16; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const a = ((level - 9) * 10 + q) % 5 + 6;
      const b = ((level - 9) * 10 + q + 1) % 5 + 1;
      const isAdd = ((level - 9) * 10 + q) % 2 === 0;

      if (isAdd) {
        const sum = a + b;
        questions.push({
          id: generateId('g1', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '+',
          answer: sum.toString(),
          answerLength: sum >= 10 ? 2 : 1
        });
      } else {
        questions.push({
          id: generateId('g1', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '-',
          answer: (a - b).toString(),
          answerLength: 1
        });
      }
    }
    levels[level] = { title: `6-10加减 ${level - 8}`, questions };
  }

  // 第17-22关：凑十练习
  for (let level = 17; level <= 22; level++) {
    const questions: Question[] = [];
    const pairs = [[1,9], [2,8], [3,7], [4,6], [5,5], [6,4], [7,3], [8,2], [9,1], [1,9]];
    for (let q = 1; q <= 10; q++) {
      const pair = pairs[q - 1];
      questions.push({
        id: generateId('g1', level, q),
        type: 'vertical_addition',
        num1: pair[0],
        num2: pair[1],
        operator: '+',
        answer: '10',
        answerLength: 2
      });
    }
    levels[level] = { title: `凑十练习 ${level - 16}`, questions };
  }

  // 第23-32关：20以内进位加
  for (let level = 23; level <= 32; level++) {
    const questions: Question[] = [];
    const bigs = [9, 8, 7, 6];
    for (let q = 1; q <= 10; q++) {
      const big = bigs[((level - 23) * 10 + q) % bigs.length];
      const small = ((level - 23) * 10 + q) % 5 + 2;
      const sum = big + small;
      questions.push({
        id: generateId('g1', level, q),
        type: 'vertical_addition',
        num1: big,
        num2: small,
        operator: '+',
        answer: sum.toString(),
        answerLength: 2
      });
    }
    levels[level] = { title: `进位加法 ${level - 22}`, questions };
  }

  // 第33-42关：20以内退位减
  for (let level = 33; level <= 42; level++) {
    const questions: Question[] = [];
    const tens = [11, 12, 13, 14, 15, 16, 17, 18];
    for (let q = 1; q <= 10; q++) {
      const minuend = tens[((level - 33) * 10 + q) % tens.length];
      const subtrahend = ((level - 33) * 10 + q) % 8 + 3;
      const diff = minuend - subtrahend;
      questions.push({
        id: generateId('g1', level, q),
        type: 'vertical_addition',
        num1: minuend,
        num2: subtrahend,
        operator: '-',
        answer: diff.toString(),
        answerLength: diff >= 10 ? 2 : 1
      });
    }
    levels[level] = { title: `退位减法 ${level - 32}`, questions };
  }

  // 第43-50关：综合练习
  for (let level = 43; level <= 50; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const type = ((level - 43) * 10 + q) % 3;

      if (type === 0) {
        const a = ((level - 43) * 10 + q) % 10 + 5;
        const b = ((level - 43) * 10 + q + 2) % 10 + 1;
        const sum = a + b;
        questions.push({
          id: generateId('g1', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '+',
          answer: sum.toString(),
          answerLength: 2
        });
      } else if (type === 1) {
        const a = ((level - 43) * 10 + q) % 8 + 12;
        const b = ((level - 43) * 10 + q + 1) % 9 + 2;
        const diff = a - b;
        questions.push({
          id: generateId('g1', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '-',
          answer: diff.toString(),
          answerLength: diff >= 10 ? 2 : 1
        });
      } else {
        const num1 = ((level - 43) * 10 + q) % 15 + 5;
        const num2 = ((level - 43) * 10 + q + 3) % 15 + 5;
        questions.push({
          id: generateId('g1', level, q),
          type: 'number_comparison',
          num1,
          num2,
          answer: num1 > num2 ? '>' : num1 < num2 ? '<' : '=',
          answerLength: 1
        });
      }
    }
    levels[level] = { title: `综合练习 ${level - 42}`, questions };
  }

  return levels;
}

// ============================================
// 二年级 50关
// ============================================

function generateGrade2Levels(): Record<number, LevelData> {
  const levels: Record<number, LevelData> = {};

  // 第1-8关：100以内加减
  for (let level = 1; level <= 8; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const isAdd = ((level - 1) * 10 + q) % 2 === 0;

      if (isAdd) {
        const a = ((level - 1) * 10 + q) * 7 % 50 + 20;
        const b = ((level - 1) * 10 + q) * 3 % 30 + 10;
        const sum = a + b;
        questions.push({
          id: generateId('g2', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '+',
          answer: sum.toString(),
          answerLength: sum >= 100 ? 3 : 2
        });
      } else {
        const a = ((level - 1) * 10 + q) * 5 % 50 + 50;
        const b = ((level - 1) * 10 + q) * 3 % 30 + 10;
        const diff = a - b;
        questions.push({
          id: generateId('g2', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '-',
          answer: diff.toString(),
          answerLength: diff >= 10 ? 2 : 1
        });
      }
    }
    levels[level] = { title: `100以内加减 ${level}`, questions };
  }

  // 第9-14关：乘法初步
  for (let level = 9; level <= 14; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const a = ((level - 9) * 10 + q) % 4 + 2;
      const b = ((level - 9) * 10 + q + 1) % 5 + 1;
      const product = a * b;
      questions.push({
        id: generateId('g2', level, q),
        type: 'input',
        question: `${a} × ${b} =`,
        answer: product.toString(),
        answerLength: product >= 10 ? 2 : 1
      });
    }
    levels[level] = { title: `乘法初步 ${level - 8}`, questions };
  }

  // 第15-22关：2-6乘法口诀
  for (let level = 15; level <= 22; level++) {
    const questions: Question[] = [];
    const baseMult = Math.floor((level - 15) / 3) + 2;
    for (let q = 1; q <= 10; q++) {
      const a = baseMult;
      const b = ((level - 15) * 10 + q) % 9 + 1;
      const product = a * b;
      questions.push({
        id: generateId('g2', level, q),
        type: 'input',
        question: `${a} × ${b} =`,
        answer: product.toString(),
        answerLength: product >= 10 ? 2 : 1
      });
    }
    levels[level] = { title: `${Math.floor((level - 15) / 3) + 2}的乘法口诀`, questions };
  }

  // 第23-30关：7-9乘法口诀
  for (let level = 23; level <= 30; level++) {
    const questions: Question[] = [];
    const sevens = [7, 8, 9];
    for (let q = 1; q <= 10; q++) {
      const a = sevens[((level - 23) * 10 + q) % 3];
      const b = ((level - 23) * 10 + q) % 9 + 1;
      const product = a * b;
      questions.push({
        id: generateId('g2', level, q),
        type: 'input',
        question: `${a} × ${b} =`,
        answer: product.toString(),
        answerLength: product >= 10 ? 2 : 1
      });
    }
    levels[level] = { title: `${sevens[(level - 23) % 3]}的乘法口诀`, questions };
  }

  // 第31-38关：表内除法
  for (let level = 31; level <= 38; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const b = ((level - 31) * 10 + q) % 9 + 1;
      const quotient = ((level - 31) * 10 + q) % 9 + 1;
      const a = b * quotient;
      questions.push({
        id: generateId('g2', level, q),
        type: 'input',
        question: `${a} ÷ ${b} =`,
        answer: quotient.toString(),
        answerLength: quotient >= 10 ? 2 : 1
      });
    }
    levels[level] = { title: `表内除法 ${level - 30}`, questions };
  }

  // 第39-50关：混合运算
  for (let level = 39; level <= 50; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const type = ((level - 39) * 10 + q) % 4;

      if (type === 0) {
        const a = ((level - 39) * 10 + q) % 9 + 1;
        const b = ((level - 39) * 10 + q + 1) % 9 + 1;
        const product = a * b;
        questions.push({
          id: generateId('g2', level, q),
          type: 'input',
          question: `${a} × ${b} =`,
          answer: product.toString(),
          answerLength: product >= 10 ? 2 : 1
        });
      } else if (type === 1) {
        const b = ((level - 39) * 10 + q) % 9 + 1;
        const quotient = ((level - 39) * 10 + q + 2) % 9 + 1;
        const a = b * quotient;
        questions.push({
          id: generateId('g2', level, q),
          type: 'input',
          question: `${a} ÷ ${b} =`,
          answer: quotient.toString(),
          answerLength: 1
        });
      } else if (type === 2) {
        const a = ((level - 39) * 10 + q) * 7 % 50 + 30;
        const b = ((level - 39) * 10 + q) * 3 % 30 + 10;
        const sum = a + b;
        questions.push({
          id: generateId('g2', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '+',
          answer: sum.toString(),
          answerLength: sum >= 100 ? 3 : 2
        });
      } else {
        const num1 = ((level - 39) * 10 + q) * 5 + 10;
        const num2 = ((level - 39) * 10 + q) * 4 + 15;
        questions.push({
          id: generateId('g2', level, q),
          type: 'number_comparison',
          num1,
          num2,
          answer: num1 > num2 ? '>' : num1 < num2 ? '<' : '=',
          answerLength: 1
        });
      }
    }
    levels[level] = { title: `混合运算 ${level - 38}`, questions };
  }

  return levels;
}

// ============================================
// 三年级 159关
// ============================================

// 三年级 159关 - 基于派培优计算练习三年级春·3-4月 & 5-6月
// 共1590题，每关10题

function generateGrade3Levels(): Record<number, LevelData> {
  const levels: Record<number, LevelData> = {};

  // 第0关：过渡热身关，仅包含两位数与一位数之间的简单四则运算
  levels[0] = {
    title: '第 0 关',
    questions: [
      { id: 'g3_0_1', type: 'input', question: '3+4 =', answer: '7', answerLength: 1 },
      { id: 'g3_0_2', type: 'input', question: '8+5 =', answer: '13', answerLength: 2 },
      { id: 'g3_0_3', type: 'input', question: '18÷2 =', answer: '9', answerLength: 1 },
    ],
  };

  // 第1关
  levels[1] = {
    title: '第 1 关',
    questions: [
      { id: 'g3_1_1', type: 'input', question: '25×4 =', answer: '100', answerLength: 3 },
      { id: 'g3_1_2', type: 'input', question: '125×8 =', answer: '1000', answerLength: 4 },
      { id: 'g3_1_3', type: 'input', question: '12×5 =', answer: '60', answerLength: 2 },
      { id: 'g3_1_4', type: 'input', question: '15×6 =', answer: '90', answerLength: 2 },
      { id: 'g3_1_5', type: 'input', question: '24×5 =', answer: '120', answerLength: 3 },
      { id: 'g3_1_6', type: 'input', question: '30×40 =', answer: '1200', answerLength: 4 },
      { id: 'g3_1_7', type: 'input', question: '420÷6 =', answer: '70', answerLength: 2 },
      { id: 'g3_1_8', type: 'input', question: '630÷9 =', answer: '70', answerLength: 2 },
      { id: 'g3_1_9', type: 'input', question: '150×2 =', answer: '300', answerLength: 3 },
      { id: 'g3_1_10', type: 'input', question: '18×4 =', answer: '72', answerLength: 2 },
    ]
  };

  // 第2关
  levels[2] = {
    title: '第 2 关',
    questions: [
      { id: 'g3_2_1', type: 'input', question: '125×4 =', answer: '500', answerLength: 3 },
      { id: 'g3_2_2', type: 'input', question: '25×8 =', answer: '200', answerLength: 3 },
      { id: 'g3_2_3', type: 'input', question: '125×(8+4) =', answer: '1500', answerLength: 4 },
      { id: 'g3_2_4', type: 'input', question: '36×72+36×28 =', answer: '3600', answerLength: 4 },
      { id: 'g3_2_5', type: 'input', question: '17×25+17×45+17×3 =', answer: '1241', answerLength: 4 },
      { id: 'g3_2_6', type: 'input', question: '26×15+13×70 =', answer: '1300', answerLength: 4 },
      { id: 'g3_2_7', type: 'input', question: '48×37 =', answer: '1776', answerLength: 4 },
      { id: 'g3_2_8', type: 'input', question: '825÷3 =', answer: '275', answerLength: 3 },
      { id: 'g3_2_9', type: 'input', question: '数串3,7,11,15...的第20项是多少？ =', answer: '79', answerLength: 2 },
      { id: 'g3_2_10', type: 'input', question: '数串5,10,15...105共有多少项？ =', answer: '21', answerLength: 2 },
    ]
  };

  // 第3关
  levels[3] = {
    title: '第 3 关',
    questions: [
      { id: 'g3_3_1', type: 'input', question: '25×5 =', answer: '125', answerLength: 3 },
      { id: 'g3_3_2', type: 'input', question: '125×8 =', answer: '1000', answerLength: 4 },
      { id: 'g3_3_3', type: 'input', question: '15×6 =', answer: '90', answerLength: 2 },
      { id: 'g3_3_4', type: 'input', question: '240÷6 =', answer: '40', answerLength: 2 },
      { id: 'g3_3_5', type: 'input', question: '11×50 =', answer: '550', answerLength: 3 },
      { id: 'g3_3_6', type: 'input', question: '80×90 =', answer: '7200', answerLength: 4 },
      { id: 'g3_3_7', type: 'input', question: '450÷5 =', answer: '90', answerLength: 2 },
      { id: 'g3_3_8', type: 'input', question: '13×4 =', answer: '52', answerLength: 2 },
      { id: 'g3_3_9', type: 'input', question: '32+68×0 =', answer: '32', answerLength: 2 },
      { id: 'g3_3_10', type: 'input', question: '35×2 =', answer: '70', answerLength: 2 },
    ]
  };

  // 第4关
  levels[4] = {
    title: '第 4 关',
    questions: [
      { id: 'g3_4_1', type: 'input', question: '1000÷8 =', answer: '125', answerLength: 3 },
      { id: 'g3_4_2', type: 'input', question: '12×5 =', answer: '60', answerLength: 2 },
      { id: 'g3_4_3', type: 'input', question: '25×(4+8) =', answer: '300', answerLength: 3 },
      { id: 'g3_4_4', type: 'input', question: '36×75+36×25 =', answer: '3600', answerLength: 4 },
      { id: 'g3_4_5', type: 'input', question: '12×15+12×35+12×50 =', answer: '1200', answerLength: 4 },
      { id: 'g3_4_6', type: 'input', question: '24×15+12×70 =', answer: '1200', answerLength: 4 },
      { id: 'g3_4_7', type: 'input', question: '43×26 =', answer: '1118', answerLength: 4 },
      { id: 'g3_4_8', type: 'input', question: '848÷4 =', answer: '212', answerLength: 3 },
      { id: 'g3_4_9', type: 'input', question: '数串1,4,7,10...第15个数是几？ =', answer: '43', answerLength: 2 },
      { id: 'g3_4_10', type: 'input', question: '数串2,4,6,8...40共有多少个数？ =', answer: '20', answerLength: 2 },
    ]
  };

  // 第5关
  levels[5] = {
    title: '第 5 关',
    questions: [
      { id: 'g3_5_1', type: 'input', question: '25×2 =', answer: '50', answerLength: 2 },
      { id: 'g3_5_2', type: 'input', question: '125×16 =', answer: '2000', answerLength: 4 },
      { id: 'g3_5_3', type: 'input', question: '50×4 =', answer: '200', answerLength: 3 },
      { id: 'g3_5_4', type: 'input', question: '250×8 =', answer: '2000', answerLength: 4 },
      { id: 'g3_5_5', type: 'input', question: '13×5 =', answer: '65', answerLength: 2 },
      { id: 'g3_5_6', type: 'input', question: '360÷9 =', answer: '40', answerLength: 2 },
      { id: 'g3_5_7', type: 'input', question: '22×3 =', answer: '66', answerLength: 2 },
      { id: 'g3_5_8', type: 'input', question: '70×6 =', answer: '420', answerLength: 3 },
      { id: 'g3_5_9', type: 'input', question: '150×2 =', answer: '300', answerLength: 3 },
      { id: 'g3_5_10', type: 'input', question: '640÷8 =', answer: '80', answerLength: 2 },
    ]
  };

  // 第6关
  levels[6] = {
    title: '第 6 关',
    questions: [
      { id: 'g3_6_1', type: 'input', question: '18×3 =', answer: '54', answerLength: 2 },
      { id: 'g3_6_2', type: 'input', question: '40×15 =', answer: '600', answerLength: 3 },
      { id: 'g3_6_3', type: 'input', question: '125×(8+6) =', answer: '1750', answerLength: 4 },
      { id: 'g3_6_4', type: 'input', question: '58×64+58×36 =', answer: '5800', answerLength: 4 },
      { id: 'g3_6_5', type: 'input', question: '27×18+27×32+27×50 =', answer: '2700', answerLength: 4 },
      { id: 'g3_6_6', type: 'input', question: '36×14+18×72 =', answer: '1800', answerLength: 4 },
      { id: 'g3_6_7', type: 'input', question: '57×32 =', answer: '1824', answerLength: 4 },
      { id: 'g3_6_8', type: 'input', question: '735÷3 =', answer: '245', answerLength: 3 },
      { id: 'g3_6_9', type: 'input', question: '数串3,8,13,18...第12个数是几？ =', answer: '58', answerLength: 2 },
      { id: 'g3_6_10', type: 'input', question: '500÷4 =', answer: '125', answerLength: 3 },
    ]
  };

  // 第7关
  levels[7] = {
    title: '第 7 关',
    questions: [
      { id: 'g3_7_1', type: 'input', question: '25×16 =', answer: '400', answerLength: 3 },
      { id: 'g3_7_2', type: 'input', question: '125×24 =', answer: '3000', answerLength: 4 },
      { id: 'g3_7_3', type: 'input', question: '16×5 =', answer: '80', answerLength: 2 },
      { id: 'g3_7_4', type: 'input', question: '280÷7 =', answer: '40', answerLength: 2 },
      { id: 'g3_7_5', type: 'input', question: '33×3 =', answer: '99', answerLength: 2 },
      { id: 'g3_7_6', type: 'input', question: '90×4 =', answer: '360', answerLength: 3 },
      { id: 'g3_7_7', type: 'input', question: '250×4 =', answer: '1000', answerLength: 4 },
      { id: 'g3_7_8', type: 'input', question: '480÷6 =', answer: '80', answerLength: 2 },
      { id: 'g3_7_9', type: 'input', question: '12×8 =', answer: '96', answerLength: 2 },
      { id: 'g3_7_10', type: 'input', question: '60×11 =', answer: '660', answerLength: 3 },
    ]
  };

  // 第8关
  levels[8] = {
    title: '第 8 关',
    questions: [
      { id: 'g3_8_1', type: 'input', question: '800÷5 =', answer: '160', answerLength: 3 },
      { id: 'g3_8_2', type: 'input', question: '25×(40+4) =', answer: '1100', answerLength: 4 },
      { id: 'g3_8_3', type: 'input', question: '47×123−47×23 =', answer: '4700', answerLength: 4 },
      { id: 'g3_8_4', type: 'input', question: '15×14+15×26+15×60 =', answer: '1500', answerLength: 4 },
      { id: 'g3_8_5', type: 'input', question: '46×12+23×76 =', answer: '2300', answerLength: 4 },
      { id: 'g3_8_6', type: 'input', question: '28×49 =', answer: '1372', answerLength: 4 },
      { id: 'g3_8_7', type: 'input', question: '912÷6 =', answer: '152', answerLength: 3 },
      { id: 'g3_8_8', type: 'input', question: '数串5,10,15,20...105共有几项？ =', answer: '21', answerLength: 2 },
      { id: 'g3_8_9', type: 'input', question: '24×2 =', answer: '48', answerLength: 2 },
      { id: 'g3_8_10', type: 'input', question: '50×2 =', answer: '100', answerLength: 3 },
    ]
  };

  // 第9关
  levels[9] = {
    title: '第 9 关',
    questions: [
      { id: 'g3_9_1', type: 'input', question: '40×25 =', answer: '1000', answerLength: 4 },
      { id: 'g3_9_2', type: 'input', question: '80×125 =', answer: '10000', answerLength: 5 },
      { id: 'g3_9_3', type: 'input', question: '25×40 =', answer: '1000', answerLength: 4 },
      { id: 'g3_9_4', type: 'input', question: '15×4 =', answer: '60', answerLength: 2 },
      { id: 'g3_9_5', type: 'input', question: '810÷9 =', answer: '90', answerLength: 2 },
      { id: 'g3_9_6', type: 'input', question: '11×8 =', answer: '88', answerLength: 2 },
      { id: 'g3_9_7', type: 'input', question: '60×7 =', answer: '420', answerLength: 3 },
      { id: 'g3_9_8', type: 'input', question: '450×2 =', answer: '900', answerLength: 3 },
      { id: 'g3_9_9', type: 'input', question: '560÷7 =', answer: '80', answerLength: 2 },
      { id: 'g3_9_10', type: 'input', question: '13×3 =', answer: '39', answerLength: 2 },
    ]
  };

  // 第10关
  levels[10] = {
    title: '第 10 关',
    questions: [
      { id: 'g3_10_1', type: 'input', question: '125×(80+8) =', answer: '11000', answerLength: 5 },
      { id: 'g3_10_2', type: 'input', question: '82×45+82×55 =', answer: '8200', answerLength: 4 },
      { id: 'g3_10_3', type: 'input', question: '34×25+34×45+34×30 =', answer: '3400', answerLength: 4 },
      { id: 'g3_10_4', type: 'input', question: '28×15+14×70 =', answer: '1400', answerLength: 4 },
      { id: 'g3_10_5', type: 'input', question: '36×54 =', answer: '1944', answerLength: 4 },
      { id: 'g3_10_6', type: 'input', question: '625÷5 =', answer: '125', answerLength: 3 },
      { id: 'g3_10_7', type: 'input', question: '数串10,13,16,19...第20个数是几？ =', answer: '67', answerLength: 2 },
      { id: 'g3_10_8', type: 'input', question: '30×13 =', answer: '390', answerLength: 3 },
      { id: 'g3_10_9', type: 'input', question: '100÷4 =', answer: '25', answerLength: 2 },
      { id: 'g3_10_10', type: 'input', question: '14×5 =', answer: '70', answerLength: 2 },
    ]
  };

  // 第11关
  levels[11] = {
    title: '第 11 关',
    questions: [
      { id: 'g3_11_1', type: 'input', question: '250×4 =', answer: '1000', answerLength: 4 },
      { id: 'g3_11_2', type: 'input', question: '810÷9 =', answer: '90', answerLength: 2 },
      { id: 'g3_11_3', type: 'input', question: '13×3 =', answer: '39', answerLength: 2 },
      { id: 'g3_11_4', type: 'input', question: '1000÷8 =', answer: '125', answerLength: 3 },
      { id: 'g3_11_5', type: 'input', question: '40×25 =', answer: '1000', answerLength: 4 },
      { id: 'g3_11_6', type: 'input', question: '60×11 =', answer: '660', answerLength: 3 },
      { id: 'g3_11_7', type: 'input', question: '75×2 =', answer: '150', answerLength: 3 },
      { id: 'g3_11_8', type: 'input', question: '420÷7 =', answer: '60', answerLength: 2 },
      { id: 'g3_11_9', type: 'input', question: '125×3 =', answer: '375', answerLength: 3 },
      { id: 'g3_11_10', type: 'input', question: '25×(4+12) =', answer: '400', answerLength: 3 },
    ]
  };

  // 第12关
  levels[12] = {
    title: '第 12 关',
    questions: [
      { id: 'g3_12_1', type: 'input', question: '19×72+19×28 =', answer: '1900', answerLength: 4 },
      { id: 'g3_12_2', type: 'input', question: '41×16+41×24+41×60 =', answer: '4100', answerLength: 4 },
      { id: 'g3_12_3', type: 'input', question: '52×14+26×72 =', answer: '2600', answerLength: 4 },
      { id: 'g3_12_4', type: 'input', question: '78×21 =', answer: '1638', answerLength: 4 },
      { id: 'g3_12_5', type: 'input', question: '544÷8 =', answer: '68', answerLength: 2 },
      { id: 'g3_12_6', type: 'input', question: '数串4,10,16,22...第11个数是几？ =', answer: '64', answerLength: 2 },
      { id: 'g3_12_7', type: 'input', question: '数串7,10,13,16...70共有几项？ =', answer: '22', answerLength: 2 },
      { id: 'g3_12_8', type: 'input', question: '8×125 =', answer: '1000', answerLength: 4 },
      { id: 'g3_12_9', type: 'input', question: '50×16 =', answer: '800', answerLength: 3 },
      { id: 'g3_12_10', type: 'input', question: '320÷4 =', answer: '80', answerLength: 2 },
    ]
  };

  // 第13关
  levels[13] = {
    title: '第 13 关',
    questions: [
      { id: 'g3_13_1', type: 'input', question: '22×4 =', answer: '88', answerLength: 2 },
      { id: 'g3_13_2', type: 'input', question: '100÷4 =', answer: '25', answerLength: 2 },
      { id: 'g3_13_3', type: 'input', question: '45×2 =', answer: '90', answerLength: 2 },
      { id: 'g3_13_4', type: 'input', question: '20×25 =', answer: '500', answerLength: 3 },
      { id: 'g3_13_5', type: 'input', question: '800×5 =', answer: '4000', answerLength: 4 },
      { id: 'g3_13_6', type: 'input', question: '150÷5 =', answer: '30', answerLength: 2 },
      { id: 'g3_13_7', type: 'input', question: '12×4 =', answer: '48', answerLength: 2 },
      { id: 'g3_13_8', type: 'input', question: '50×9 =', answer: '450', answerLength: 3 },
      { id: 'g3_13_9', type: 'input', question: '125×8 =', answer: '1000', answerLength: 4 },
      { id: 'g3_13_10', type: 'input', question: '125×(8+24) =', answer: '4000', answerLength: 4 },
    ]
  };

  // 第14关
  levels[14] = {
    title: '第 14 关',
    questions: [
      { id: 'g3_14_1', type: 'input', question: '63×84+63×16 =', answer: '6300', answerLength: 4 },
      { id: 'g3_14_2', type: 'input', question: '22×27+22×33+22×40 =', answer: '2200', answerLength: 4 },
      { id: 'g3_14_3', type: 'input', question: '18×26+9×48 =', answer: '900', answerLength: 3 },
      { id: 'g3_14_4', type: 'input', question: '39×42 =', answer: '1638', answerLength: 4 },
      { id: 'g3_14_5', type: 'input', question: '936÷9 =', answer: '104', answerLength: 3 },
      { id: 'g3_14_6', type: 'input', question: '数串3,6,9,12...45共有多少个数？ =', answer: '15', answerLength: 2 },
      { id: 'g3_14_7', type: 'input', question: '350÷7 =', answer: '50', answerLength: 2 },
      { id: 'g3_14_8', type: 'input', question: '15×8 =', answer: '120', answerLength: 3 },
      { id: 'g3_14_9', type: 'input', question: '20×17 =', answer: '340', answerLength: 3 },
      { id: 'g3_14_10', type: 'input', question: '600÷4 =', answer: '150', answerLength: 3 },
    ]
  };

  // 第15关
  levels[15] = {
    title: '第 15 关',
    questions: [
      { id: 'g3_15_1', type: 'input', question: '11×6 =', answer: '66', answerLength: 2 },
      { id: 'g3_15_2', type: 'input', question: '50×14 =', answer: '700', answerLength: 3 },
      { id: 'g3_15_3', type: 'input', question: '1000÷4 =', answer: '250', answerLength: 3 },
      { id: 'g3_15_4', type: 'input', question: '16×3 =', answer: '48', answerLength: 2 },
      { id: 'g3_15_5', type: 'input', question: '25×12 =', answer: '300', answerLength: 3 },
      { id: 'g3_15_6', type: 'input', question: '125×32 =', answer: '4000', answerLength: 4 },
      { id: 'g3_15_7', type: 'input', question: '15×4 =', answer: '60', answerLength: 2 },
      { id: 'g3_15_8', type: 'input', question: '630÷7 =', answer: '90', answerLength: 2 },
      { id: 'g3_15_9', type: 'input', question: '25×(20+4) =', answer: '600', answerLength: 3 },
      { id: 'g3_15_10', type: 'input', question: '91×56+91×44 =', answer: '9100', answerLength: 4 },
    ]
  };

  // 第16关
  levels[16] = {
    title: '第 16 关',
    questions: [
      { id: 'g3_16_1', type: 'input', question: '18×15+18×25+18×60 =', answer: '1800', answerLength: 4 },
      { id: 'g3_16_2', type: 'input', question: '44×15+22×70 =', answer: '2200', answerLength: 4 },
      { id: 'g3_16_3', type: 'input', question: '64×35 =', answer: '2240', answerLength: 4 },
      { id: 'g3_16_4', type: 'input', question: '819÷7 =', answer: '117', answerLength: 3 },
      { id: 'g3_16_5', type: 'input', question: '数串3,7,11,15...的第20项是多少？ =', answer: '79', answerLength: 2 },
      { id: 'g3_16_6', type: 'input', question: '数串5,10,15...105共有多少项？ =', answer: '21', answerLength: 2 },
      { id: 'g3_16_7', type: 'input', question: '21×4 =', answer: '84', answerLength: 2 },
      { id: 'g3_16_8', type: 'input', question: '50×6 =', answer: '300', answerLength: 3 },
      { id: 'g3_16_9', type: 'input', question: '250×2 =', answer: '500', answerLength: 3 },
      { id: 'g3_16_10', type: 'input', question: '450÷5 =', answer: '90', answerLength: 2 },
    ]
  };

  // 第17关
  levels[17] = {
    title: '第 17 关',
    questions: [
      { id: 'g3_17_1', type: 'input', question: '11×9 =', answer: '99', answerLength: 2 },
      { id: 'g3_17_2', type: 'input', question: '20×13 =', answer: '260', answerLength: 3 },
      { id: 'g3_17_3', type: 'input', question: '200÷8 =', answer: '25', answerLength: 2 },
      { id: 'g3_17_4', type: 'input', question: '12×9 =', answer: '108', answerLength: 3 },
      { id: 'g3_17_5', type: 'input', question: '25×40 =', answer: '1000', answerLength: 4 },
      { id: 'g3_17_6', type: 'input', question: '125×80 =', answer: '10000', answerLength: 5 },
      { id: 'g3_17_7', type: 'input', question: '17×3 =', answer: '51', answerLength: 2 },
      { id: 'g3_17_8', type: 'input', question: '320÷4 =', answer: '80', answerLength: 2 },
      { id: 'g3_17_9', type: 'input', question: '125×(8+32) =', answer: '5000', answerLength: 4 },
      { id: 'g3_17_10', type: 'input', question: '35×78+35×22 =', answer: '3500', answerLength: 4 },
    ]
  };

  // 第18关
  levels[18] = {
    title: '第 18 关',
    questions: [
      { id: 'g3_18_1', type: 'input', question: '26×19+26×31+26×50 =', answer: '2600', answerLength: 4 },
      { id: 'g3_18_2', type: 'input', question: '38×24+19×52 =', answer: '1900', answerLength: 4 },
      { id: 'g3_18_3', type: 'input', question: '53×27 =', answer: '1431', answerLength: 4 },
      { id: 'g3_18_4', type: 'input', question: '642÷6 =', answer: '107', answerLength: 3 },
      { id: 'g3_18_5', type: 'input', question: '数串1,5,9,13...第18个数是几？ =', answer: '69', answerLength: 2 },
      { id: 'g3_18_6', type: 'input', question: '12×3 =', answer: '36', answerLength: 2 },
      { id: 'g3_18_7', type: 'input', question: '90×6 =', answer: '540', answerLength: 3 },
      { id: 'g3_18_8', type: 'input', question: '15×4 =', answer: '60', answerLength: 2 },
      { id: 'g3_18_9', type: 'input', question: '540÷9 =', answer: '60', answerLength: 2 },
      { id: 'g3_18_10', type: 'input', question: '360÷6 =', answer: '60', answerLength: 2 },
    ]
  };

  // 第19关
  levels[19] = {
    title: '第 19 关',
    questions: [
      { id: 'g3_19_1', type: 'input', question: '12×50 =', answer: '600', answerLength: 3 },
      { id: 'g3_19_2', type: 'input', question: '25×6 =', answer: '150', answerLength: 3 },
      { id: 'g3_19_3', type: 'input', question: '800÷4 =', answer: '200', answerLength: 3 },
      { id: 'g3_19_4', type: 'input', question: '15×4 =', answer: '60', answerLength: 2 },
      { id: 'g3_19_5', type: 'input', question: '0×99+7 =', answer: '7', answerLength: 1 },
      { id: 'g3_19_6', type: 'input', question: '125×2 =', answer: '250', answerLength: 3 },
      { id: 'g3_19_7', type: 'input', question: '560÷8 =', answer: '70', answerLength: 2 },
      { id: 'g3_19_8', type: 'input', question: '25×(4+28) =', answer: '800', answerLength: 3 },
      { id: 'g3_19_9', type: 'input', question: '74×115−74×15 =', answer: '7400', answerLength: 4 },
      { id: 'g3_19_10', type: 'input', question: '14×28+14×42+14×30 =', answer: '1400', answerLength: 4 },
    ]
  };

  // 第20关
  levels[20] = {
    title: '第 20 关',
    questions: [
      { id: 'g3_20_1', type: 'input', question: '62×15+31×70 =', answer: '3100', answerLength: 4 },
      { id: 'g3_20_2', type: 'input', question: '46×58 =', answer: '2668', answerLength: 4 },
      { id: 'g3_20_3', type: 'input', question: '752÷4 =', answer: '188', answerLength: 3 },
      { id: 'g3_20_4', type: 'input', question: '数串6,11,16,21...第21个数是几？ =', answer: '106', answerLength: 3 },
      { id: 'g3_20_5', type: 'input', question: '数串10,20,30,40...150共有几项？ =', answer: '15', answerLength: 2 },
      { id: 'g3_20_6', type: 'input', question: '16×5 =', answer: '80', answerLength: 2 },
      { id: 'g3_20_7', type: 'input', question: '25×12 =', answer: '300', answerLength: 3 },
      { id: 'g3_20_8', type: 'input', question: '240÷4 =', answer: '60', answerLength: 2 },
      { id: 'g3_20_9', type: 'input', question: '150×2 =', answer: '300', answerLength: 3 },
      { id: 'g3_20_10', type: 'input', question: '25×40 =', answer: '1000', answerLength: 4 },
    ]
  };

  // 第21关
  levels[21] = {
    title: '第 21 关',
    questions: [
      { id: 'g3_21_1', type: 'input', question: '480÷6 =', answer: '80', answerLength: 2 },
      { id: 'g3_21_2', type: 'input', question: '17×2 =', answer: '34', answerLength: 2 },
      { id: 'g3_21_3', type: 'input', question: '125×40 =', answer: '5000', answerLength: 4 },
      { id: 'g3_21_4', type: 'input', question: '33×3 =', answer: '99', answerLength: 2 },
      { id: 'g3_21_5', type: 'input', question: '90×4 =', answer: '360', answerLength: 3 },
      { id: 'g3_21_6', type: 'input', question: '250×4 =', answer: '1000', answerLength: 4 },
      { id: 'g3_21_7', type: 'input', question: '400÷8 =', answer: '50', answerLength: 2 },
      { id: 'g3_21_8', type: 'input', question: '125×(16+8) =', answer: '3000', answerLength: 4 },
      { id: 'g3_21_9', type: 'input', question: '29×146−29×46 =', answer: '2900', answerLength: 4 },
      { id: 'g3_21_10', type: 'input', question: '33×17+33×33+33×50 =', answer: '3300', answerLength: 4 },
    ]
  };

  // 第22关
  levels[22] = {
    title: '第 22 关',
    questions: [
      { id: 'g3_22_1', type: 'input', question: '48×18+24×64 =', answer: '2400', answerLength: 4 },
      { id: 'g3_22_2', type: 'input', question: '82×24 =', answer: '1968', answerLength: 4 },
      { id: 'g3_22_3', type: 'input', question: '954÷6 =', answer: '159', answerLength: 3 },
      { id: 'g3_22_4', type: 'input', question: '数串1,2,3,4...80共有多少项？ =', answer: '80', answerLength: 2 },
      { id: 'g3_22_5', type: 'input', question: '12×8 =', answer: '96', answerLength: 2 },
      { id: 'g3_22_6', type: 'input', question: '60×12 =', answer: '720', answerLength: 3 },
      { id: 'g3_22_7', type: 'input', question: '800÷5 =', answer: '160', answerLength: 3 },
      { id: 'g3_22_8', type: 'input', question: '24×2 =', answer: '48', answerLength: 2 },
      { id: 'g3_22_9', type: 'input', question: '75×4 =', answer: '300', answerLength: 3 },
      { id: 'g3_22_10', type: 'input', question: '125×12 =', answer: '1500', answerLength: 4 },
    ]
  };

  // 第23关
  levels[23] = {
    title: '第 23 关',
    questions: [
      { id: 'g3_23_1', type: 'input', question: '44×2 =', answer: '88', answerLength: 2 },
      { id: 'g3_23_2', type: 'input', question: '15×3 =', answer: '45', answerLength: 2 },
      { id: 'g3_23_3', type: 'input', question: '11×11 =', answer: '121', answerLength: 3 },
      { id: 'g3_23_4', type: 'input', question: '120÷8 =', answer: '15', answerLength: 2 },
      { id: 'g3_23_5', type: 'input', question: '18×2 =', answer: '36', answerLength: 2 },
      { id: 'g3_23_6', type: 'input', question: '540÷6 =', answer: '90', answerLength: 2 },
      { id: 'g3_23_7', type: 'input', question: '25×(40+8) =', answer: '1200', answerLength: 4 },
      { id: 'g3_23_8', type: 'input', question: '42×88+42×12 =', answer: '4200', answerLength: 4 },
      { id: 'g3_23_9', type: 'input', question: '19×25+19×45+19×30 =', answer: '1900', answerLength: 4 },
      { id: 'g3_23_10', type: 'input', question: '34×12+17×76 =', answer: '1700', answerLength: 4 },
    ]
  };

  // 第24关
  levels[24] = {
    title: '第 24 关',
    questions: [
      { id: 'g3_24_1', type: 'input', question: '56×29 =', answer: '1624', answerLength: 4 },
      { id: 'g3_24_2', type: 'input', question: '864÷4 =', answer: '216', answerLength: 3 },
      { id: 'g3_24_3', type: 'input', question: '数串8,11,14,17...第15个数是几？ =', answer: '50', answerLength: 2 },
      { id: 'g3_24_4', type: 'input', question: '11×5 =', answer: '55', answerLength: 2 },
      { id: 'g3_24_5', type: 'input', question: '70×4 =', answer: '280', answerLength: 3 },
      { id: 'g3_24_6', type: 'input', question: '25×4 =', answer: '100', answerLength: 3 },
      { id: 'g3_24_7', type: 'input', question: '400÷5 =', answer: '80', answerLength: 2 },
      { id: 'g3_24_8', type: 'input', question: '14×3 =', answer: '42', answerLength: 2 },
      { id: 'g3_24_9', type: 'input', question: '30×12 =', answer: '360', answerLength: 3 },
      { id: 'g3_24_10', type: 'input', question: '120÷4 =', answer: '30', answerLength: 2 },
    ]
  };

  // 第25关
  levels[25] = {
    title: '第 25 关',
    questions: [
      { id: 'g3_25_1', type: 'input', question: '15×5 =', answer: '75', answerLength: 2 },
      { id: 'g3_25_2', type: 'input', question: '25×16 =', answer: '400', answerLength: 3 },
      { id: 'g3_25_3', type: 'input', question: '125×24 =', answer: '3000', answerLength: 4 },
      { id: 'g3_25_4', type: 'input', question: '16×4 =', answer: '64', answerLength: 2 },
      { id: 'g3_25_5', type: 'input', question: '480÷8 =', answer: '60', answerLength: 2 },
      { id: 'g3_25_6', type: 'input', question: '125×(8+16) =', answer: '3000', answerLength: 4 },
      { id: 'g3_25_7', type: 'input', question: '56×135−56×35 =', answer: '5600', answerLength: 4 },
      { id: 'g3_25_8', type: 'input', question: '21×16+21×24+21×60 =', answer: '2100', answerLength: 4 },
      { id: 'g3_25_9', type: 'input', question: '28×25+14×150 =', answer: '2800', answerLength: 4 },
      { id: 'g3_25_10', type: 'input', question: '48×34 =', answer: '1632', answerLength: 4 },
    ]
  };

  // 第26关
  levels[26] = {
    title: '第 26 关',
    questions: [
      { id: 'g3_26_1', type: 'input', question: '925÷5 =', answer: '185', answerLength: 3 },
      { id: 'g3_26_2', type: 'input', question: '数串9,13,17,21...第14个数是几？ =', answer: '61', answerLength: 2 },
      { id: 'g3_26_3', type: 'input', question: '数串5,15,25,35...105共有多少个数？ =', answer: '11', answerLength: 2 },
      { id: 'g3_26_4', type: 'input', question: '13×6 =', answer: '78', answerLength: 2 },
      { id: 'g3_26_5', type: 'input', question: '60×9 =', answer: '540', answerLength: 3 },
      { id: 'g3_26_6', type: 'input', question: '20×25 =', answer: '500', answerLength: 3 },
      { id: 'g3_26_7', type: 'input', question: '360÷4 =', answer: '90', answerLength: 2 },
      { id: 'g3_26_8', type: 'input', question: '12×7 =', answer: '84', answerLength: 2 },
      { id: 'g3_26_9', type: 'input', question: '40×11 =', answer: '440', answerLength: 3 },
      { id: 'g3_26_10', type: 'input', question: '450÷9 =', answer: '50', answerLength: 2 },
    ]
  };

  // 第27关
  levels[27] = {
    title: '第 27 关',
    questions: [
      { id: 'g3_27_1', type: 'input', question: '125×4 =', answer: '500', answerLength: 3 },
      { id: 'g3_27_2', type: 'input', question: '18×5 =', answer: '90', answerLength: 2 },
      { id: 'g3_27_3', type: 'input', question: '60×70 =', answer: '4200', answerLength: 4 },
      { id: 'g3_27_4', type: 'input', question: '25×8 =', answer: '200', answerLength: 3 },
      { id: 'g3_27_5', type: 'input', question: '1000÷4 =', answer: '250', answerLength: 3 },
      { id: 'g3_27_6', type: 'input', question: '25×(12+4) =', answer: '400', answerLength: 3 },
      { id: 'g3_27_7', type: 'input', question: '73×62+73×38 =', answer: '7300', answerLength: 4 },
      { id: 'g3_27_8', type: 'input', question: '13×27+13×33+13×40 =', answer: '1300', answerLength: 4 },
      { id: 'g3_27_9', type: 'input', question: '42×15+21×70 =', answer: '2100', answerLength: 4 },
      { id: 'g3_27_10', type: 'input', question: '62×47 =', answer: '2914', answerLength: 4 },
    ]
  };

  // 第28关
  levels[28] = {
    title: '第 28 关',
    questions: [
      { id: 'g3_28_1', type: 'input', question: '744÷6 =', answer: '124', answerLength: 3 },
      { id: 'g3_28_2', type: 'input', question: '数串12,17,22,27...67共有多少个数？ =', answer: '12', answerLength: 2 },
      { id: 'g3_28_3', type: 'input', question: '13×4 =', answer: '52', answerLength: 2 },
      { id: 'g3_28_4', type: 'input', question: '250×2 =', answer: '500', answerLength: 3 },
      { id: 'g3_28_5', type: 'input', question: '35×20 =', answer: '700', answerLength: 3 },
      { id: 'g3_28_6', type: 'input', question: '500÷5 =', answer: '100', answerLength: 3 },
      { id: 'g3_28_7', type: 'input', question: '11×90 =', answer: '990', answerLength: 3 },
      { id: 'g3_28_8', type: 'input', question: '125×80 =', answer: '10000', answerLength: 5 },
      { id: 'g3_28_9', type: 'input', question: '14×3 =', answer: '42', answerLength: 2 },
      { id: 'g3_28_10', type: 'input', question: '720÷8 =', answer: '90', answerLength: 2 },
    ]
  };

  // 第29关
  levels[29] = {
    title: '第 29 关',
    questions: [
      { id: 'g3_29_1', type: 'input', question: '25×3 =', answer: '75', answerLength: 2 },
      { id: 'g3_29_2', type: 'input', question: '125×5 =', answer: '625', answerLength: 3 },
      { id: 'g3_29_3', type: 'input', question: '630÷7 =', answer: '90', answerLength: 2 },
      { id: 'g3_29_4', type: 'input', question: '16×2 =', answer: '32', answerLength: 2 },
      { id: 'g3_29_5', type: 'input', question: '125×(40+8) =', answer: '6000', answerLength: 4 },
      { id: 'g3_29_6', type: 'input', question: '85×112−85×12 =', answer: '8500', answerLength: 4 },
      { id: 'g3_29_7', type: 'input', question: '24×15+24×25+24×60 =', answer: '2400', answerLength: 4 },
      { id: 'g3_29_8', type: 'input', question: '32×15+16×70 =', answer: '1600', answerLength: 4 },
      { id: 'g3_29_9', type: 'input', question: '37×58 =', answer: '2146', answerLength: 4 },
      { id: 'g3_29_10', type: 'input', question: '856÷8 =', answer: '107', answerLength: 3 },
    ]
  };

  // 第30关
  levels[30] = {
    title: '第 30 关',
    questions: [
      { id: 'g3_30_1', type: 'input', question: '数串2,9,16,23...第12个数是几？ =', answer: '79', answerLength: 2 },
      { id: 'g3_30_2', type: 'input', question: '50×14 =', answer: '700', answerLength: 3 },
      { id: 'g3_30_3', type: 'input', question: '1000÷125 =', answer: '8', answerLength: 1 },
      { id: 'g3_30_4', type: 'input', question: '13×6 =', answer: '78', answerLength: 2 },
      { id: 'g3_30_5', type: 'input', question: '40×15 =', answer: '600', answerLength: 3 },
      { id: 'g3_30_6', type: 'input', question: '250÷5 =', answer: '50', answerLength: 2 },
      { id: 'g3_30_7', type: 'input', question: '19×2 =', answer: '38', answerLength: 2 },
      { id: 'g3_30_8', type: 'input', question: '125×6 =', answer: '750', answerLength: 3 },
      { id: 'g3_30_9', type: 'input', question: '210÷3 =', answer: '70', answerLength: 2 },
      { id: 'g3_30_10', type: 'input', question: '80×8 =', answer: '640', answerLength: 3 },
    ]
  };

  // 第31关
  levels[31] = {
    title: '第 31 关',
    questions: [
      { id: 'g3_31_1', type: 'input', question: '720÷9 =', answer: '80', answerLength: 2 },
      { id: 'g3_31_2', type: 'input', question: '120÷4 =', answer: '30', answerLength: 2 },
      { id: 'g3_31_3', type: 'input', question: '15×5 =', answer: '75', answerLength: 2 },
      { id: 'g3_31_4', type: 'input', question: '25×(100+4) =', answer: '2600', answerLength: 4 },
      { id: 'g3_31_5', type: 'input', question: '67×99+67 =', answer: '6700', answerLength: 4 },
      { id: 'g3_31_6', type: 'input', question: '14×25+14×45+14×30 =', answer: '1400', answerLength: 4 },
      { id: 'g3_31_7', type: 'input', question: '26×24+13×52 =', answer: '1300', answerLength: 4 },
      { id: 'g3_31_8', type: 'input', question: '84×23 =', answer: '1932', answerLength: 4 },
      { id: 'g3_31_9', type: 'input', question: '931÷7 =', answer: '133', answerLength: 3 },
      { id: 'g3_31_10', type: 'input', question: '数串20,24,28,32...第15个数是几？ =', answer: '76', answerLength: 2 },
    ]
  };

  // 第32关
  levels[32] = {
    title: '第 32 关',
    questions: [
      { id: 'g3_32_1', type: 'input', question: '数串13,16,19,22...40共有多少个数？ =', answer: '10', answerLength: 2 },
      { id: 'g3_32_2', type: 'input', question: '16×4 =', answer: '64', answerLength: 2 },
      { id: 'g3_32_3', type: 'input', question: '480÷8 =', answer: '60', answerLength: 2 },
      { id: 'g3_32_4', type: 'input', question: '60×9 =', answer: '540', answerLength: 3 },
      { id: 'g3_32_5', type: 'input', question: '360÷4 =', answer: '90', answerLength: 2 },
      { id: 'g3_32_6', type: 'input', question: '12×7 =', answer: '84', answerLength: 2 },
      { id: 'g3_32_7', type: 'input', question: '40×11 =', answer: '440', answerLength: 3 },
      { id: 'g3_32_8', type: 'input', question: '1000÷5 =', answer: '200', answerLength: 3 },
      { id: 'g3_32_9', type: 'input', question: '19×2 =', answer: '38', answerLength: 2 },
      { id: 'g3_32_10', type: 'input', question: '21×4 =', answer: '84', answerLength: 2 },
    ]
  };

  // 第33关
  levels[33] = {
    title: '第 33 关',
    questions: [
      { id: 'g3_33_1', type: 'input', question: '50×6 =', answer: '300', answerLength: 3 },
      { id: 'g3_33_2', type: 'input', question: '250×2 =', answer: '500', answerLength: 3 },
      { id: 'g3_33_3', type: 'input', question: '450÷5 =', answer: '90', answerLength: 2 },
      { id: 'g3_33_4', type: 'input', question: '125×(80+16) =', answer: '12000', answerLength: 5 },
      { id: 'g3_33_5', type: 'input', question: '45×101−45 =', answer: '4500', answerLength: 4 },
      { id: 'g3_33_6', type: 'input', question: '32×18+32×32+32×50 =', answer: '3200', answerLength: 4 },
      { id: 'g3_33_7', type: 'input', question: '44×12+22×76 =', answer: '2200', answerLength: 4 },
      { id: 'g3_33_8', type: 'input', question: '49×36 =', answer: '1764', answerLength: 4 },
      { id: 'g3_33_9', type: 'input', question: '816÷4 =', answer: '204', answerLength: 3 },
      { id: 'g3_33_10', type: 'input', question: '11×9 =', answer: '99', answerLength: 2 },
    ]
  };

  // 第34关
  levels[34] = {
    title: '第 34 关',
    questions: [
      { id: 'g3_34_1', type: 'input', question: '20×13 =', answer: '260', answerLength: 3 },
      { id: 'g3_34_2', type: 'input', question: '200÷8 =', answer: '25', answerLength: 2 },
      { id: 'g3_34_3', type: 'input', question: '12×9 =', answer: '108', answerLength: 3 },
      { id: 'g3_34_4', type: 'input', question: '25×14 =', answer: '350', answerLength: 3 },
      { id: 'g3_34_5', type: 'input', question: '125×7 =', answer: '875', answerLength: 3 },
      { id: 'g3_34_6', type: 'input', question: '80×60 =', answer: '4800', answerLength: 4 },
      { id: 'g3_34_7', type: 'input', question: '1000−125 =', answer: '875', answerLength: 3 },
      { id: 'g3_34_8', type: 'input', question: '25×20 =', answer: '500', answerLength: 3 },
      { id: 'g3_34_9', type: 'input', question: '125×16 =', answer: '2000', answerLength: 4 },
      { id: 'g3_34_10', type: 'input', question: '45×4 =', answer: '180', answerLength: 3 },
    ]
  };

  // 第35关
  levels[35] = {
    title: '第 35 关',
    questions: [
      { id: 'g3_35_1', type: 'input', question: '840÷2 =', answer: '420', answerLength: 3 },
      { id: 'g3_35_2', type: 'input', question: '25×(10+4) =', answer: '350', answerLength: 3 },
      { id: 'g3_35_3', type: 'input', question: '125×88 =', answer: '11000', answerLength: 5 },
      { id: 'g3_35_4', type: 'input', question: '16×23+16×37+16×40 =', answer: '1600', answerLength: 4 },
      { id: 'g3_35_5', type: 'input', question: '38×14+19×72 =', answer: '1900', answerLength: 4 },
      { id: 'g3_35_6', type: 'input', question: '55×42 =', answer: '2310', answerLength: 4 },
      { id: 'g3_35_7', type: 'input', question: '768÷3 =', answer: '256', answerLength: 3 },
      { id: 'g3_35_8', type: 'input', question: '数串3,5,7,9...第25个数是几？ =', answer: '51', answerLength: 2 },
      { id: 'g3_35_9', type: 'input', question: '16×50 =', answer: '800', answerLength: 3 },
      { id: 'g3_35_10', type: 'input', question: '90×30 =', answer: '2700', answerLength: 4 },
    ]
  };

  // 第36关
  levels[36] = {
    title: '第 36 关',
    questions: [
      { id: 'g3_36_1', type: 'input', question: '720÷90 =', answer: '8', answerLength: 1 },
      { id: 'g3_36_2', type: 'input', question: '25×0+75 =', answer: '75', answerLength: 2 },
      { id: 'g3_36_3', type: 'input', question: '15×8 =', answer: '120', answerLength: 3 },
      { id: 'g3_36_4', type: 'input', question: '500÷25 =', answer: '20', answerLength: 2 },
      { id: 'g3_36_5', type: 'input', question: '125×2 =', answer: '250', answerLength: 3 },
      { id: 'g3_36_6', type: 'input', question: '13×7 =', answer: '91', answerLength: 2 },
      { id: 'g3_36_7', type: 'input', question: '125×40 =', answer: '5000', answerLength: 4 },
      { id: 'g3_36_8', type: 'input', question: '48×5 =', answer: '240', answerLength: 3 },
      { id: 'g3_36_9', type: 'input', question: '100÷5 =', answer: '20', answerLength: 2 },
      { id: 'g3_36_10', type: 'input', question: '11×40 =', answer: '440', answerLength: 3 },
    ]
  };

  // 第37关
  levels[37] = {
    title: '第 37 关',
    questions: [
      { id: 'g3_37_1', type: 'input', question: '125×(24+8) =', answer: '4000', answerLength: 4 },
      { id: 'g3_37_2', type: 'input', question: '99×34+34 =', answer: '3400', answerLength: 4 },
      { id: 'g3_37_3', type: 'input', question: '28×15+28×35+28×50 =', answer: '2800', answerLength: 4 },
      { id: 'g3_37_4', type: 'input', question: '54×13+27×74 =', answer: '2700', answerLength: 4 },
      { id: 'g3_37_5', type: 'input', question: '72×38 =', answer: '2736', answerLength: 4 },
      { id: 'g3_37_6', type: 'input', question: '948÷6 =', answer: '158', answerLength: 3 },
      { id: 'g3_37_7', type: 'input', question: '数串5,9,13,17...第20个数是几？ =', answer: '81', answerLength: 2 },
      { id: 'g3_37_8', type: 'input', question: '数串10,12,14,16...60共有多少个数？ =', answer: '26', answerLength: 2 },
      { id: 'g3_37_9', type: 'input', question: '25×12 =', answer: '300', answerLength: 3 },
      { id: 'g3_37_10', type: 'input', question: '630÷9 =', answer: '70', answerLength: 2 },
    ]
  };

  // 第38关
  levels[38] = {
    title: '第 38 关',
    questions: [
      { id: 'g3_38_1', type: 'input', question: '50×12 =', answer: '600', answerLength: 3 },
      { id: 'g3_38_2', type: 'input', question: '8×250 =', answer: '2000', answerLength: 4 },
      { id: 'g3_38_3', type: 'input', question: '35×4 =', answer: '140', answerLength: 3 },
      { id: 'g3_38_4', type: 'input', question: '14×5 =', answer: '70', answerLength: 2 },
      { id: 'g3_38_5', type: 'input', question: '60×80 =', answer: '4800', answerLength: 4 },
      { id: 'g3_38_6', type: 'input', question: '75×4 =', answer: '300', answerLength: 3 },
      { id: 'g3_38_7', type: 'input', question: '1000÷125 =', answer: '8', answerLength: 1 },
      { id: 'g3_38_8', type: 'input', question: '18×5 =', answer: '90', answerLength: 2 },
      { id: 'g3_38_9', type: 'input', question: '40×13 =', answer: '520', answerLength: 3 },
      { id: 'g3_38_10', type: 'input', question: '25×32 =', answer: '800', answerLength: 3 },
    ]
  };

  // 第39关
  levels[39] = {
    title: '第 39 关',
    questions: [
      { id: 'g3_39_1', type: 'input', question: '25×(12+40) =', answer: '1300', answerLength: 4 },
      { id: 'g3_39_2', type: 'input', question: '23×17+23×83 =', answer: '2300', answerLength: 4 },
      { id: 'g3_39_3', type: 'input', question: '17×26+17×34+17×40 =', answer: '1700', answerLength: 4 },
      { id: 'g3_39_4', type: 'input', question: '38×15+19×70 =', answer: '1900', answerLength: 4 },
      { id: 'g3_39_5', type: 'input', question: '26×64 =', answer: '1664', answerLength: 4 },
      { id: 'g3_39_6', type: 'input', question: '855÷9 =', answer: '95', answerLength: 2 },
      { id: 'g3_39_7', type: 'input', question: '40×20 =', answer: '800', answerLength: 3 },
      { id: 'g3_39_8', type: 'input', question: '18×5 =', answer: '90', answerLength: 2 },
      { id: 'g3_39_9', type: 'input', question: '420÷6 =', answer: '70', answerLength: 2 },
      { id: 'g3_39_10', type: 'input', question: '800÷2 =', answer: '400', answerLength: 3 },
    ]
  };

  // 第40关
  levels[40] = {
    title: '第 40 关',
    questions: [
      { id: 'g3_40_1', type: 'input', question: '23×3 =', answer: '69', answerLength: 2 },
      { id: 'g3_40_2', type: 'input', question: '12×7 =', answer: '84', answerLength: 2 },
      { id: 'g3_40_3', type: 'input', question: '540÷9 =', answer: '60', answerLength: 2 },
      { id: 'g3_40_4', type: 'input', question: '4×3×2×1 =', answer: '24', answerLength: 2 },
      { id: 'g3_40_5', type: 'input', question: '6×5×4 =', answer: '120', answerLength: 3 },
      { id: 'g3_40_6', type: 'input', question: '2×5×9×0 =', answer: '0', answerLength: 1 },
      { id: 'g3_40_7', type: 'choice', question: '326÷3=', options: ["113……3", "106……1", "105……7", "108……2"], answer: '108……2', answerLength: 4 },
      { id: 'g3_40_8', type: 'choice', question: '418÷4=', options: ["101……3", "104……2", "109……2", "109……3"], answer: '104……2', answerLength: 4 },
      { id: 'g3_40_9', type: 'choice', question: '607÷5=', options: ["117……1", "121……2", "121……4", "122……8"], answer: '121……2', answerLength: 4 },
      { id: 'g3_40_10', type: 'input', question: '24×13 =', answer: '312', answerLength: 3 },
    ]
  };

  // 第41关
  levels[41] = {
    title: '第 41 关',
    questions: [
      { id: 'g3_41_1', type: 'input', question: '45×26 =', answer: '1170', answerLength: 4 },
      { id: 'g3_41_2', type: 'input', question: '58×32 =', answer: '1856', answerLength: 4 },
      { id: 'g3_41_3', type: 'input', question: '20×30 =', answer: '600', answerLength: 3 },
      { id: 'g3_41_4', type: 'input', question: '14×5 =', answer: '70', answerLength: 2 },
      { id: 'g3_41_5', type: 'input', question: '160÷2 =', answer: '80', answerLength: 2 },
      { id: 'g3_41_6', type: 'input', question: '4×5×2 =', answer: '40', answerLength: 2 },
      { id: 'g3_41_7', type: 'input', question: '28÷(  )=7 =', answer: '4', answerLength: 1 },
      { id: 'g3_41_8', type: 'input', question: '25×4 =', answer: '100', answerLength: 3 },
      { id: 'g3_41_9', type: 'input', question: '480÷6 =', answer: '80', answerLength: 2 },
      { id: 'g3_41_10', type: 'input', question: '3×2×9 =', answer: '54', answerLength: 2 },
    ]
  };

  // 第42关
  levels[42] = {
    title: '第 42 关',
    questions: [
      { id: 'g3_42_1', type: 'input', question: '50×80 =', answer: '4000', answerLength: 4 },
      { id: 'g3_42_2', type: 'input', question: '12×6 =', answer: '72', answerLength: 2 },
      { id: 'g3_42_3', type: 'input', question: '(  )÷5=6 =', answer: '30', answerLength: 2 },
      { id: 'g3_42_4', type: 'choice', question: '427÷4=', options: ["101……9", "106……3", "105……9", "108……8"], answer: '106……3', answerLength: 4 },
      { id: 'g3_42_5', type: 'choice', question: '513÷5=', options: ["107……7", "102……3", "99……9", "105……6"], answer: '102……3', answerLength: 4 },
      { id: 'g3_42_6', type: 'choice', question: '809÷3=', options: ["270……9", "267……6", "269……2", "269……2"], answer: '269……2', answerLength: 4 },
      { id: 'g3_42_7', type: 'input', question: '23×41 =', answer: '943', answerLength: 3 },
      { id: 'g3_42_8', type: 'input', question: '56×17 =', answer: '952', answerLength: 3 },
      { id: 'g3_42_9', type: 'input', question: '38×24 =', answer: '912', answerLength: 3 },
      { id: 'g3_42_10', type: 'input', question: '(  )÷7=15 =', answer: '105', answerLength: 3 },
    ]
  };

  // 第43关
  levels[43] = {
    title: '第 43 关',
    questions: [
      { id: 'g3_43_1', type: 'input', question: '144÷(  )=24 =', answer: '6', answerLength: 1 },
      { id: 'g3_43_2', type: 'choice', question: '77÷6=(  )', options: ["11……8", "12……5", "15……9", "13……4"], answer: '12……5', answerLength: 3 },
      { id: 'g3_43_3', type: 'input', question: '60×20 =', answer: '1200', answerLength: 4 },
      { id: 'g3_43_4', type: 'input', question: '18×3 =', answer: '54', answerLength: 2 },
      { id: 'g3_43_5', type: 'input', question: '350÷7 =', answer: '50', answerLength: 2 },
      { id: 'g3_43_6', type: 'input', question: '6×2×5 =', answer: '60', answerLength: 2 },
      { id: 'g3_43_7', type: 'input', question: '40÷(  )=8 =', answer: '5', answerLength: 1 },
      { id: 'g3_43_8', type: 'input', question: '11×8 =', answer: '88', answerLength: 2 },
      { id: 'g3_43_9', type: 'input', question: '720÷8 =', answer: '90', answerLength: 2 },
      { id: 'g3_43_10', type: 'input', question: '5×5×4 =', answer: '100', answerLength: 3 },
    ]
  };

  // 第44关
  levels[44] = {
    title: '第 44 关',
    questions: [
      { id: 'g3_44_1', type: 'input', question: '30×90 =', answer: '2700', answerLength: 4 },
      { id: 'g3_44_2', type: 'input', question: '15×4 =', answer: '60', answerLength: 2 },
      { id: 'g3_44_3', type: 'input', question: '(  )÷3=9 =', answer: '27', answerLength: 2 },
      { id: 'g3_44_4', type: 'choice', question: '625÷6=', options: ["104……1", "103……4", "100……3", "108……7"], answer: '104……1', answerLength: 4 },
      { id: 'g3_44_5', type: 'choice', question: '298÷7=', options: ["42……4", "39……5", "45……6", "44……2"], answer: '42……4', answerLength: 3 },
      { id: 'g3_44_6', type: 'choice', question: '914÷8=', options: ["114……2", "113……5", "118……6", "117……5"], answer: '114……2', answerLength: 4 },
      { id: 'g3_44_7', type: 'input', question: '19×34 =', answer: '646', answerLength: 3 },
      { id: 'g3_44_8', type: 'input', question: '72×15 =', answer: '1080', answerLength: 4 },
      { id: 'g3_44_9', type: 'input', question: '46×23 =', answer: '1058', answerLength: 4 },
      { id: 'g3_44_10', type: 'input', question: '(  )÷9=11 =', answer: '99', answerLength: 2 },
    ]
  };

  // 第45关
  levels[45] = {
    title: '第 45 关',
    questions: [
      { id: 'g3_45_1', type: 'input', question: '204÷(  )=34 =', answer: '6', answerLength: 1 },
      { id: 'g3_45_2', type: 'choice', question: '83÷4=(  )', options: ["15……1", "20……3", "22……5", "18……8"], answer: '20……3', answerLength: 3 },
      { id: 'g3_45_3', type: 'input', question: '40×50 =', answer: '2000', answerLength: 4 },
      { id: 'g3_45_4', type: 'input', question: '23×3 =', answer: '69', answerLength: 2 },
      { id: 'g3_45_5', type: 'input', question: '240÷4 =', answer: '60', answerLength: 2 },
      { id: 'g3_45_6', type: 'input', question: '8×1×9 =', answer: '72', answerLength: 2 },
      { id: 'g3_45_7', type: 'input', question: '18÷(  )=6 =', answer: '3', answerLength: 1 },
      { id: 'g3_45_8', type: 'input', question: '13×5 =', answer: '65', answerLength: 2 },
      { id: 'g3_45_9', type: 'input', question: '540÷6 =', answer: '90', answerLength: 2 },
      { id: 'g3_45_10', type: 'input', question: '4×2×7 =', answer: '56', answerLength: 2 },
    ]
  };

  // 第46关
  levels[46] = {
    title: '第 46 关',
    questions: [
      { id: 'g3_46_1', type: 'input', question: '70×40 =', answer: '2800', answerLength: 4 },
      { id: 'g3_46_2', type: 'input', question: '24×2 =', answer: '48', answerLength: 2 },
      { id: 'g3_46_3', type: 'input', question: '(  )÷6=7 =', answer: '42', answerLength: 2 },
      { id: 'g3_46_4', type: 'input', question: '321÷3 =', answer: '107', answerLength: 3 },
      { id: 'g3_46_5', type: 'choice', question: '435÷4=', options: ["110……4", "108……3", "105……5", "103……6"], answer: '108……3', answerLength: 4 },
      { id: 'g3_46_6', type: 'choice', question: '726÷7=', options: ["101……5", "105……6", "103……5", "106……2"], answer: '103……5', answerLength: 4 },
      { id: 'g3_46_7', type: 'input', question: '65×12 =', answer: '780', answerLength: 3 },
      { id: 'g3_46_8', type: 'input', question: '47×26 =', answer: '1222', answerLength: 4 },
      { id: 'g3_46_9', type: 'input', question: '29×38 =', answer: '1102', answerLength: 4 },
      { id: 'g3_46_10', type: 'input', question: '(  )÷6=23 =', answer: '138', answerLength: 3 },
    ]
  };

  // 第47关
  levels[47] = {
    title: '第 47 关',
    questions: [
      { id: 'g3_47_1', type: 'input', question: '315÷(  )=63 =', answer: '5', answerLength: 1 },
      { id: 'g3_47_2', type: 'choice', question: '99÷8=(  )', options: ["12……3", "15……5", "10……5", "12……7"], answer: '12……3', answerLength: 3 },
      { id: 'g3_47_3', type: 'input', question: '80×20 =', answer: '1600', answerLength: 4 },
      { id: 'g3_47_4', type: 'input', question: '17×4 =', answer: '68', answerLength: 2 },
      { id: 'g3_47_5', type: 'input', question: '810÷9 =', answer: '90', answerLength: 2 },
      { id: 'g3_47_6', type: 'input', question: '2×9×5 =', answer: '90', answerLength: 2 },
      { id: 'g3_47_7', type: 'input', question: '36÷(  )=9 =', answer: '4', answerLength: 1 },
      { id: 'g3_47_8', type: 'input', question: '21×4 =', answer: '84', answerLength: 2 },
      { id: 'g3_47_9', type: 'input', question: '400÷5 =', answer: '80', answerLength: 2 },
      { id: 'g3_47_10', type: 'input', question: '3×3×10 =', answer: '90', answerLength: 2 },
    ]
  };

  // 第48关
  levels[48] = {
    title: '第 48 关',
    questions: [
      { id: 'g3_48_1', type: 'input', question: '60×60 =', answer: '3600', answerLength: 4 },
      { id: 'g3_48_2', type: 'input', question: '16×5 =', answer: '80', answerLength: 2 },
      { id: 'g3_48_3', type: 'input', question: '(  )÷4=8 =', answer: '32', answerLength: 2 },
      { id: 'g3_48_4', type: 'choice', question: '542÷5=', options: ["108……2", "107……8", "110……5", "105……3"], answer: '108……2', answerLength: 4 },
      { id: 'g3_48_5', type: 'choice', question: '818÷9=', options: ["88……7", "87……3", "91……2", "90……8"], answer: '90……8', answerLength: 3 },
      { id: 'g3_48_6', type: 'choice', question: '239÷2=', options: ["118……1", "114……6", "121……3", "119……1"], answer: '119……1', answerLength: 4 },
      { id: 'g3_48_7', type: 'input', question: '33×27 =', answer: '891', answerLength: 3 },
      { id: 'g3_48_8', type: 'input', question: '14×52 =', answer: '728', answerLength: 3 },
      { id: 'g3_48_9', type: 'input', question: '81×11 =', answer: '891', answerLength: 3 },
      { id: 'g3_48_10', type: 'input', question: '(  )÷4=42 =', answer: '168', answerLength: 3 },
    ]
  };

  // 第49关
  levels[49] = {
    title: '第 49 关',
    questions: [
      { id: 'g3_49_1', type: 'input', question: '450÷(  )=50 =', answer: '9', answerLength: 1 },
      { id: 'g3_49_2', type: 'choice', question: '67÷5=(  )', options: ["16……1", "13……2", "10……3", "14……8"], answer: '13……2', answerLength: 3 },
      { id: 'g3_49_3', type: 'input', question: '50×60 =', answer: '3000', answerLength: 4 },
      { id: 'g3_49_4', type: 'input', question: '14×4 =', answer: '56', answerLength: 2 },
      { id: 'g3_49_5', type: 'input', question: '200÷4 =', answer: '50', answerLength: 2 },
      { id: 'g3_49_6', type: 'input', question: '3×4×5 =', answer: '60', answerLength: 2 },
      { id: 'g3_49_7', type: 'input', question: '54÷(  )=6 =', answer: '9', answerLength: 1 },
      { id: 'g3_49_8', type: 'input', question: '12×8 =', answer: '96', answerLength: 2 },
      { id: 'g3_49_9', type: 'input', question: '420÷7 =', answer: '60', answerLength: 2 },
      { id: 'g3_49_10', type: 'input', question: '8×2×5 =', answer: '80', answerLength: 2 },
    ]
  };

  // 第50关
  levels[50] = {
    title: '第 50 关',
    questions: [
      { id: 'g3_50_1', type: 'input', question: '40×80 =', answer: '3200', answerLength: 4 },
      { id: 'g3_50_2', type: 'input', question: '31×3 =', answer: '93', answerLength: 2 },
      { id: 'g3_50_3', type: 'input', question: '(  )÷5=9 =', answer: '45', answerLength: 2 },
      { id: 'g3_50_4', type: 'choice', question: '905÷3=', options: ["299……4", "299……2", "306……4", "301……2"], answer: '301……2', answerLength: 4 },
      { id: 'g3_50_5', type: 'choice', question: '423÷4=', options: ["100……9", "103……9", "105……3", "109……4"], answer: '105……3', answerLength: 4 },
      { id: 'g3_50_6', type: 'choice', question: '614÷6=', options: ["98……1", "105……9", "99……5", "102……2"], answer: '102……2', answerLength: 4 },
      { id: 'g3_50_7', type: 'input', question: '37×19 =', answer: '703', answerLength: 3 },
      { id: 'g3_50_8', type: 'input', question: '68×15 =', answer: '1020', answerLength: 4 },
      { id: 'g3_50_9', type: 'input', question: '25×44 =', answer: '1100', answerLength: 4 },
      { id: 'g3_50_10', type: 'input', question: '(  )÷8=13 =', answer: '104', answerLength: 3 },
    ]
  };

  // 第51关
  levels[51] = {
    title: '第 51 关',
    questions: [
      { id: 'g3_51_1', type: 'input', question: '184÷(  )=23 =', answer: '8', answerLength: 1 },
      { id: 'g3_51_2', type: 'choice', question: '59÷4=(  )', options: ["11……3", "14……3", "19……3", "15……2"], answer: '14……3', answerLength: 3 },
      { id: 'g3_51_3', type: 'input', question: '10×90 =', answer: '900', answerLength: 3 },
      { id: 'g3_51_4', type: 'input', question: '35×2 =', answer: '70', answerLength: 2 },
      { id: 'g3_51_5', type: 'input', question: '320÷8 =', answer: '40', answerLength: 2 },
      { id: 'g3_51_6', type: 'input', question: '5×4×5 =', answer: '100', answerLength: 3 },
      { id: 'g3_51_7', type: 'input', question: '20÷(  )=5 =', answer: '4', answerLength: 1 },
      { id: 'g3_51_8', type: 'input', question: '44×2 =', answer: '88', answerLength: 2 },
      { id: 'g3_51_9', type: 'input', question: '630÷7 =', answer: '90', answerLength: 2 },
      { id: 'g3_51_10', type: 'input', question: '7×2×3 =', answer: '42', answerLength: 2 },
    ]
  };

  // 第52关
  levels[52] = {
    title: '第 52 关',
    questions: [
      { id: 'g3_52_1', type: 'input', question: '90×40 =', answer: '3600', answerLength: 4 },
      { id: 'g3_52_2', type: 'input', question: '12×9 =', answer: '108', answerLength: 3 },
      { id: 'g3_52_3', type: 'input', question: '(  )÷9=4 =', answer: '36', answerLength: 2 },
      { id: 'g3_52_4', type: 'choice', question: '724÷7=', options: ["103……3", "104……9", "107……3", "102……9"], answer: '103……3', answerLength: 4 },
      { id: 'g3_52_5', type: 'choice', question: '125÷2=', options: ["58……3", "64……4", "57……5", "62……1"], answer: '62……1', answerLength: 3 },
      { id: 'g3_52_6', type: 'choice', question: '843÷4=', options: ["209……4", "210……3", "213……6", "205……8"], answer: '210……3', answerLength: 4 },
      { id: 'g3_52_7', type: 'input', question: '54×18 =', answer: '972', answerLength: 3 },
      { id: 'g3_52_8', type: 'input', question: '27×32 =', answer: '864', answerLength: 3 },
      { id: 'g3_52_9', type: 'input', question: '36×25 =', answer: '900', answerLength: 3 },
      { id: 'g3_52_10', type: 'input', question: '(  )÷5=44 =', answer: '220', answerLength: 3 },
    ]
  };

  // 第53关
  levels[53] = {
    title: '第 53 关',
    questions: [
      { id: 'g3_53_1', type: 'input', question: '280÷(  )=40 =', answer: '7', answerLength: 1 },
      { id: 'g3_53_2', type: 'choice', question: '94÷7=(  )', options: ["10……3", "12……2", "18……7", "13……3"], answer: '13……3', answerLength: 3 },
      { id: 'g3_53_3', type: 'input', question: '30×70 =', answer: '2100', answerLength: 4 },
      { id: 'g3_53_4', type: 'input', question: '19×2 =', answer: '38', answerLength: 2 },
      { id: 'g3_53_5', type: 'input', question: '560÷8 =', answer: '70', answerLength: 2 },
      { id: 'g3_53_6', type: 'input', question: '4×4×4 =', answer: '64', answerLength: 2 },
      { id: 'g3_53_7', type: 'input', question: '28÷(  )=4 =', answer: '7', answerLength: 1 },
      { id: 'g3_53_8', type: 'input', question: '15×5 =', answer: '75', answerLength: 2 },
      { id: 'g3_53_9', type: 'input', question: '180÷3 =', answer: '60', answerLength: 2 },
      { id: 'g3_53_10', type: 'input', question: '6×5×2 =', answer: '60', answerLength: 2 },
    ]
  };

  // 第54关
  levels[54] = {
    title: '第 54 关',
    questions: [
      { id: 'g3_54_1', type: 'input', question: '20×50 =', answer: '1000', answerLength: 4 },
      { id: 'g3_54_2', type: 'input', question: '26×3 =', answer: '78', answerLength: 2 },
      { id: 'g3_54_3', type: 'input', question: '(  )÷7=6 =', answer: '42', answerLength: 2 },
      { id: 'g3_54_4', type: 'choice', question: '638÷3=', options: ["212……2", "213……1", "208……5", "211……7"], answer: '212……2', answerLength: 4 },
      { id: 'g3_54_5', type: 'choice', question: '407÷5=', options: ["77……6", "81……2", "85……7", "83……4"], answer: '81……2', answerLength: 3 },
      { id: 'g3_54_6', type: 'choice', question: '925÷9=', options: ["104……8", "97……7", "102……7", "107……9"], answer: '102……7', answerLength: 4 },
      { id: 'g3_54_7', type: 'input', question: '42×22 =', answer: '924', answerLength: 3 },
      { id: 'g3_54_8', type: 'input', question: '35×14 =', answer: '490', answerLength: 3 },
      { id: 'g3_54_9', type: 'input', question: '13×76 =', answer: '988', answerLength: 3 },
      { id: 'g3_54_10', type: 'input', question: '(  )÷3=82 =', answer: '246', answerLength: 3 },
    ]
  };

  // 第55关
  levels[55] = {
    title: '第 55 关',
    questions: [
      { id: 'g3_55_1', type: 'input', question: '560÷(  )=80 =', answer: '7', answerLength: 1 },
      { id: 'g3_55_2', type: 'choice', question: '88÷6=(  )', options: ["17……7", "14……4", "15……5", "11……1"], answer: '14……4', answerLength: 3 },
      { id: 'g3_55_3', type: 'input', question: '70×70 =', answer: '4900', answerLength: 4 },
      { id: 'g3_55_4', type: 'input', question: '25×3 =', answer: '75', answerLength: 2 },
      { id: 'g3_55_5', type: 'input', question: '270÷3 =', answer: '90', answerLength: 2 },
      { id: 'g3_55_6', type: 'input', question: '2×2×2 =', answer: '8', answerLength: 1 },
      { id: 'g3_55_7', type: 'input', question: '42÷(  )=7 =', answer: '6', answerLength: 1 },
      { id: 'g3_55_8', type: 'input', question: '11×9 =', answer: '99', answerLength: 2 },
      { id: 'g3_55_9', type: 'input', question: '360÷9 =', answer: '40', answerLength: 2 },
      { id: 'g3_55_10', type: 'input', question: '9×1×8 =', answer: '72', answerLength: 2 },
    ]
  };

  // 第56关
  levels[56] = {
    title: '第 56 关',
    questions: [
      { id: 'g3_56_1', type: 'input', question: '30×30 =', answer: '900', answerLength: 3 },
      { id: 'g3_56_2', type: 'input', question: '18×4 =', answer: '72', answerLength: 2 },
      { id: 'g3_56_3', type: 'input', question: '(  )÷8=5 =', answer: '40', answerLength: 2 },
      { id: 'g3_56_4', type: 'choice', question: '311÷3=', options: ["103……2", "99……4", "100……9", "108……8"], answer: '103……2', answerLength: 4 },
      { id: 'g3_56_5', type: 'choice', question: '845÷8=', options: ["107……6", "103……7", "109……6", "105……5"], answer: '105……5', answerLength: 4 },
      { id: 'g3_56_6', type: 'choice', question: '526÷5=', options: ["105……1", "102……7", "107……3", "105……4"], answer: '105……1', answerLength: 4 },
      { id: 'g3_56_7', type: 'input', question: '17×43 =', answer: '731', answerLength: 3 },
      { id: 'g3_56_8', type: 'input', question: '62×13 =', answer: '806', answerLength: 3 },
      { id: 'g3_56_9', type: 'input', question: '24×35 =', answer: '840', answerLength: 3 },
      { id: 'g3_56_10', type: 'input', question: '(  )÷7=31 =', answer: '217', answerLength: 3 },
    ]
  };

  // 第57关
  levels[57] = {
    title: '第 57 关',
    questions: [
      { id: 'g3_57_1', type: 'input', question: '196÷(  )=49 =', answer: '4', answerLength: 1 },
      { id: 'g3_57_2', type: 'choice', question: '75÷4=(  )', options: ["20……9", "18……8", "18……3", "13……9"], answer: '18……3', answerLength: 3 },
      { id: 'g3_57_3', type: 'input', question: '20×90 =', answer: '1800', answerLength: 4 },
      { id: 'g3_57_4', type: 'input', question: '16×3 =', answer: '48', answerLength: 2 },
      { id: 'g3_57_5', type: 'input', question: '300÷6 =', answer: '50', answerLength: 2 },
      { id: 'g3_57_6', type: 'input', question: '4×3×5 =', answer: '60', answerLength: 2 },
      { id: 'g3_57_7', type: 'input', question: '64÷(  )=8 =', answer: '8', answerLength: 1 },
      { id: 'g3_57_8', type: 'input', question: '13×6 =', answer: '78', answerLength: 2 },
      { id: 'g3_57_9', type: 'input', question: '450÷5 =', answer: '90', answerLength: 2 },
      { id: 'g3_57_10', type: 'input', question: '5×6×3 =', answer: '90', answerLength: 2 },
    ]
  };

  // 第58关
  levels[58] = {
    title: '第 58 关',
    questions: [
      { id: 'g3_58_1', type: 'input', question: '80×30 =', answer: '2400', answerLength: 4 },
      { id: 'g3_58_2', type: 'input', question: '22×4 =', answer: '88', answerLength: 2 },
      { id: 'g3_58_3', type: 'input', question: '(  )÷4=7 =', answer: '28', answerLength: 2 },
      { id: 'g3_58_4', type: 'choice', question: '643÷8=', options: ["77……2", "83……8", "80……3", "76……8"], answer: '80……3', answerLength: 3 },
      { id: 'g3_58_5', type: 'choice', question: '215÷2=', options: ["107……1", "105……5", "108……9", "105……3"], answer: '107……1', answerLength: 4 },
      { id: 'g3_58_6', type: 'choice', question: '708÷7=', options: ["104……3", "101……1", "96……7", "104……8"], answer: '101……1', answerLength: 4 },
      { id: 'g3_58_7', type: 'input', question: '46×25 =', answer: '1150', answerLength: 4 },
      { id: 'g3_58_8', type: 'input', question: '31×42 =', answer: '1302', answerLength: 4 },
      { id: 'g3_58_9', type: 'input', question: '58×22 =', answer: '1276', answerLength: 4 },
      { id: 'g3_58_10', type: 'input', question: '(  )÷9=20 =', answer: '180', answerLength: 3 },
    ]
  };

  // 第59关
  levels[59] = {
    title: '第 59 关',
    questions: [
      { id: 'g3_59_1', type: 'input', question: '352÷(  )=88 =', answer: '4', answerLength: 1 },
      { id: 'g3_59_2', type: 'choice', question: '86÷3=(  )', options: ["28……2", "25……4", "32……8", "26……5"], answer: '28……2', answerLength: 3 },
      { id: 'g3_59_3', type: 'input', question: '40×40 =', answer: '1600', answerLength: 4 },
      { id: 'g3_59_4', type: 'input', question: '27×2 =', answer: '54', answerLength: 2 },
      { id: 'g3_59_5', type: 'input', question: '120÷4 =', answer: '30', answerLength: 2 },
      { id: 'g3_59_6', type: 'input', question: '6×3×2 =', answer: '36', answerLength: 2 },
      { id: 'g3_59_7', type: 'input', question: '24÷(  )=8 =', answer: '3', answerLength: 1 },
      { id: 'g3_59_8', type: 'input', question: '12×5 =', answer: '60', answerLength: 2 },
      { id: 'g3_59_9', type: 'input', question: '490÷7 =', answer: '70', answerLength: 2 },
      { id: 'g3_59_10', type: 'input', question: '2×8×5 =', answer: '80', answerLength: 2 },
    ]
  };

  // 第60关
  levels[60] = {
    title: '第 60 关',
    questions: [
      { id: 'g3_60_1', type: 'input', question: '50×90 =', answer: '4500', answerLength: 4 },
      { id: 'g3_60_2', type: 'input', question: '15×6 =', answer: '90', answerLength: 2 },
      { id: 'g3_60_3', type: 'input', question: '(  )÷6=4 =', answer: '24', answerLength: 2 },
      { id: 'g3_60_4', type: 'choice', question: '916÷3=', options: ["305……1", "306……1", "310……1", "300……5"], answer: '305……1', answerLength: 4 },
      { id: 'g3_60_5', type: 'choice', question: '439÷4=', options: ["109……3", "112……8", "105……8", "111……5"], answer: '109……3', answerLength: 4 },
      { id: 'g3_60_6', type: 'choice', question: '508÷5=', options: ["97……4", "99……6", "101……3", "102……3"], answer: '101……3', answerLength: 4 },
      { id: 'g3_60_7', type: 'input', question: '15×62 =', answer: '930', answerLength: 3 },
      { id: 'g3_60_8', type: 'input', question: '28×34 =', answer: '952', answerLength: 3 },
      { id: 'g3_60_9', type: 'input', question: '74×13 =', answer: '962', answerLength: 3 },
      { id: 'g3_60_10', type: 'input', question: '(  )÷6=101 =', answer: '606', answerLength: 3 },
    ]
  };

  // 第61关
  levels[61] = {
    title: '第 61 关',
    questions: [
      { id: 'g3_61_1', type: 'input', question: '426÷(  )=71 =', answer: '6', answerLength: 1 },
      { id: 'g3_61_2', type: 'choice', question: '97÷8=(  )', options: ["13……5", "12……1", "7……1", "11……7"], answer: '12……1', answerLength: 3 },
      { id: 'g3_61_3', type: 'input', question: '60×30 =', answer: '1800', answerLength: 4 },
      { id: 'g3_61_4', type: 'input', question: '18×2 =', answer: '36', answerLength: 2 },
      { id: 'g3_61_5', type: 'input', question: '150÷3 =', answer: '50', answerLength: 2 },
      { id: 'g3_61_6', type: 'input', question: '5×7×2 =', answer: '70', answerLength: 2 },
      { id: 'g3_61_7', type: 'input', question: '35÷(  )=7 =', answer: '5', answerLength: 1 },
      { id: 'g3_61_8', type: 'input', question: '33×3 =', answer: '99', answerLength: 2 },
      { id: 'g3_61_9', type: 'input', question: '640÷8 =', answer: '80', answerLength: 2 },
      { id: 'g3_61_10', type: 'input', question: '7×3×2 =', answer: '42', answerLength: 2 },
    ]
  };

  // 第62关
  levels[62] = {
    title: '第 62 关',
    questions: [
      { id: 'g3_62_1', type: 'input', question: '30×60 =', answer: '1800', answerLength: 4 },
      { id: 'g3_62_2', type: 'input', question: '14×7 =', answer: '98', answerLength: 2 },
      { id: 'g3_62_3', type: 'input', question: '(  )÷8=9 =', answer: '72', answerLength: 2 },
      { id: 'g3_62_4', type: 'choice', question: '826÷8=', options: ["103……2", "101……5", "104……6", "99……9"], answer: '103……2', answerLength: 4 },
      { id: 'g3_62_5', type: 'choice', question: '319÷3=', options: ["106……1", "103……1", "111……7", "106……4"], answer: '106……1', answerLength: 4 },
      { id: 'g3_62_6', type: 'choice', question: '604÷6=', options: ["97……7", "100……4", "101……7", "100……6"], answer: '100……4', answerLength: 4 },
      { id: 'g3_62_7', type: 'input', question: '45×16 =', answer: '720', answerLength: 3 },
      { id: 'g3_62_8', type: 'input', question: '53×21 =', answer: '1113', answerLength: 4 },
      { id: 'g3_62_9', type: 'input', question: '39×26 =', answer: '1014', answerLength: 4 },
      { id: 'g3_62_10', type: 'input', question: '(  )÷4=125 =', answer: '500', answerLength: 3 },
    ]
  };

  // 第63关
  levels[63] = {
    title: '第 63 关',
    questions: [
      { id: 'g3_63_1', type: 'input', question: '246÷(  )=82 =', answer: '3', answerLength: 1 },
      { id: 'g3_63_2', type: 'choice', question: '53÷4=(  )', options: ["8……5", "11……2", "16……2", "13……1"], answer: '13……1', answerLength: 3 },
      { id: 'g3_63_3', type: 'input', question: '90×20 =', answer: '1800', answerLength: 4 },
      { id: 'g3_63_4', type: 'input', question: '13×7 =', answer: '91', answerLength: 2 },
      { id: 'g3_63_5', type: 'input', question: '160÷8 =', answer: '20', answerLength: 2 },
      { id: 'g3_63_6', type: 'input', question: '1×9×9 =', answer: '81', answerLength: 2 },
      { id: 'g3_63_7', type: 'input', question: '32÷(  )=8 =', answer: '4', answerLength: 1 },
      { id: 'g3_63_8', type: 'input', question: '45×2 =', answer: '90', answerLength: 2 },
      { id: 'g3_63_9', type: 'input', question: '210÷7 =', answer: '30', answerLength: 2 },
      { id: 'g3_63_10', type: 'input', question: '4×5×6 =', answer: '120', answerLength: 3 },
    ]
  };

  // 第64关
  levels[64] = {
    title: '第 64 关',
    questions: [
      { id: 'g3_64_1', type: 'input', question: '70×50 =', answer: '3500', answerLength: 4 },
      { id: 'g3_64_2', type: 'input', question: '12×4 =', answer: '48', answerLength: 2 },
      { id: 'g3_64_3', type: 'input', question: '(  )÷5=7 =', answer: '35', answerLength: 2 },
      { id: 'g3_64_4', type: 'choice', question: '413÷2=', options: ["208……9", "206……7", "206……1", "205……2"], answer: '206……1', answerLength: 4 },
      { id: 'g3_64_5', type: 'choice', question: '745÷7=', options: ["107……2", "101……6", "106……3", "110……5"], answer: '106……3', answerLength: 4 },
      { id: 'g3_64_6', type: 'choice', question: '906÷9=', options: ["95……3", "99……3", "100……6", "103……4"], answer: '100……6', answerLength: 4 },
      { id: 'g3_64_7', type: 'input', question: '24×53 =', answer: '1272', answerLength: 4 },
      { id: 'g3_64_8', type: 'input', question: '67×14 =', answer: '938', answerLength: 3 },
      { id: 'g3_64_9', type: 'input', question: '82×12 =', answer: '984', answerLength: 3 },
      { id: 'g3_64_10', type: 'input', question: '(  )÷8=104 =', answer: '832', answerLength: 3 },
    ]
  };

  // 第65关
  levels[65] = {
    title: '第 65 关',
    questions: [
      { id: 'g3_65_1', type: 'input', question: '155÷(  )=31 =', answer: '5', answerLength: 1 },
      { id: 'g3_65_2', type: 'choice', question: '61÷6=(  )', options: ["10……1", "11……3", "8……7", "5……4"], answer: '10……1', answerLength: 3 },
      { id: 'g3_65_3', type: 'input', question: '50×40 =', answer: '2000', answerLength: 4 },
      { id: 'g3_65_4', type: 'input', question: '16×4 =', answer: '64', answerLength: 2 },
      { id: 'g3_65_5', type: 'input', question: '540÷9 =', answer: '60', answerLength: 2 },
      { id: 'g3_65_6', type: 'input', question: '6×4×1 =', answer: '24', answerLength: 2 },
      { id: 'g3_65_7', type: 'input', question: '45÷(  )=5 =', answer: '9', answerLength: 1 },
      { id: 'g3_65_8', type: 'input', question: '12×3 =', answer: '36', answerLength: 2 },
      { id: 'g3_65_9', type: 'input', question: '280÷4 =', answer: '70', answerLength: 2 },
      { id: 'g3_65_10', type: 'input', question: '2×5×7 =', answer: '70', answerLength: 2 },
    ]
  };

  // 第66关
  levels[66] = {
    title: '第 66 关',
    questions: [
      { id: 'g3_66_1', type: 'input', question: '20×80 =', answer: '1600', answerLength: 4 },
      { id: 'g3_66_2', type: 'input', question: '23×4 =', answer: '92', answerLength: 2 },
      { id: 'g3_66_3', type: 'input', question: '(  )÷3=8 =', answer: '24', answerLength: 2 },
      { id: 'g3_66_4', type: 'choice', question: '619÷3=', options: ["205……5", "210……9", "206……1", "209……1"], answer: '206……1', answerLength: 4 },
      { id: 'g3_66_5', type: 'choice', question: '834÷4=', options: ["207……4", "213……2", "208……2", "213……3"], answer: '208……2', answerLength: 4 },
      { id: 'g3_66_6', type: 'choice', question: '512÷5=', options: ["103……3", "102……2", "99……4", "105……7"], answer: '102……2', answerLength: 4 },
      { id: 'g3_66_7', type: 'input', question: '48×21 =', answer: '1008', answerLength: 4 },
      { id: 'g3_66_8', type: 'input', question: '19×55 =', answer: '1045', answerLength: 4 },
      { id: 'g3_66_9', type: 'input', question: '34×44 =', answer: '1496', answerLength: 4 },
      { id: 'g3_66_10', type: 'input', question: '(  )÷5=201 =', answer: '1005', answerLength: 4 },
    ]
  };

  // 第67关
  levels[67] = {
    title: '第 67 关',
    questions: [
      { id: 'g3_67_1', type: 'input', question: '420÷(  )=60 =', answer: '7', answerLength: 1 },
      { id: 'g3_67_2', type: 'choice', question: '79÷3=(  )', options: ["21……7", "29……5", "26……1", "27……8"], answer: '26……1', answerLength: 3 },
      { id: 'g3_67_3', type: 'input', question: '80×40 =', answer: '3200', answerLength: 4 },
      { id: 'g3_67_4', type: 'input', question: '15×3 =', answer: '45', answerLength: 2 },
      { id: 'g3_67_5', type: 'input', question: '250÷5 =', answer: '50', answerLength: 2 },
      { id: 'g3_67_6', type: 'input', question: '5×2×8 =', answer: '80', answerLength: 2 },
      { id: 'g3_67_7', type: 'input', question: '36÷(  )=9 =', answer: '4', answerLength: 1 },
      { id: 'g3_67_8', type: 'input', question: '32×2 =', answer: '64', answerLength: 2 },
      { id: 'g3_67_9', type: 'input', question: '320÷4 =', answer: '80', answerLength: 2 },
      { id: 'g3_67_10', type: 'input', question: '3×3×3 =', answer: '27', answerLength: 2 },
    ]
  };

  // 第68关
  levels[68] = {
    title: '第 68 关',
    questions: [
      { id: 'g3_68_1', type: 'input', question: '60×90 =', answer: '5400', answerLength: 4 },
      { id: 'g3_68_2', type: 'input', question: '11×7 =', answer: '77', answerLength: 2 },
      { id: 'g3_68_3', type: 'input', question: '(  )÷7=4 =', answer: '28', answerLength: 2 },
      { id: 'g3_68_4', type: 'choice', question: '723÷6=', options: ["120……3", "121……9", "119……5", "122……3"], answer: '120……3', answerLength: 4 },
      { id: 'g3_68_5', type: 'choice', question: '314÷3=', options: ["109……4", "101……4", "107……1", "104……2"], answer: '104……2', answerLength: 4 },
      { id: 'g3_68_6', type: 'choice', question: '441÷4=', options: ["114……5", "106……2", "110……1", "106……1"], answer: '110……1', answerLength: 4 },
      { id: 'g3_68_7', type: 'input', question: '27×36 =', answer: '972', answerLength: 3 },
      { id: 'g3_68_8', type: 'input', question: '42×18 =', answer: '756', answerLength: 3 },
      { id: 'g3_68_9', type: 'input', question: '63×15 =', answer: '945', answerLength: 3 },
      { id: 'g3_68_10', type: 'input', question: '(  )÷9=32 =', answer: '288', answerLength: 3 },
    ]
  };

  // 第69关
  levels[69] = {
    title: '第 69 关',
    questions: [
      { id: 'g3_69_1', type: 'input', question: '328÷(  )=82 =', answer: '4', answerLength: 1 },
      { id: 'g3_69_2', type: 'choice', question: '58÷8=(  )', options: ["2……1", "12……4", "9……6", "7……2"], answer: '7……2', answerLength: 2 },
      { id: 'g3_69_3', type: 'input', question: '30×50 =', answer: '1500', answerLength: 4 },
      { id: 'g3_69_4', type: 'input', question: '17×5 =', answer: '85', answerLength: 2 },
      { id: 'g3_69_5', type: 'input', question: '400÷8 =', answer: '50', answerLength: 2 },
      { id: 'g3_69_6', type: 'input', question: '9×0×5 =', answer: '0', answerLength: 1 },
      { id: 'g3_69_7', type: 'input', question: '48÷(  )=8 =', answer: '6', answerLength: 1 },
      { id: 'g3_69_8', type: 'input', question: '14×6 =', answer: '84', answerLength: 2 },
      { id: 'g3_69_9', type: 'input', question: '140÷2 =', answer: '70', answerLength: 2 },
      { id: 'g3_69_10', type: 'input', question: '4×2×6 =', answer: '48', answerLength: 2 },
    ]
  };

  // 第70关
  levels[70] = {
    title: '第 70 关',
    questions: [
      { id: 'g3_70_1', type: 'input', question: '70×30 =', answer: '2100', answerLength: 4 },
      { id: 'g3_70_2', type: 'input', question: '25×2 =', answer: '50', answerLength: 2 },
      { id: 'g3_70_3', type: 'input', question: '(  )÷9=3 =', answer: '27', answerLength: 2 },
      { id: 'g3_70_4', type: 'choice', question: '912÷9=', options: ["104……1", "104……5", "101……3", "97……2"], answer: '101……3', answerLength: 4 },
      { id: 'g3_70_5', type: 'choice', question: '524÷5=', options: ["104……4", "102……2", "106……8", "102……8"], answer: '104……4', answerLength: 4 },
      { id: 'g3_70_6', type: 'choice', question: '819÷8=', options: ["99……6", "106……3", "102……3", "100……5"], answer: '102……3', answerLength: 4 },
      { id: 'g3_70_7', type: 'input', question: '31×29 =', answer: '899', answerLength: 3 },
      { id: 'g3_70_8', type: 'input', question: '56×13 =', answer: '728', answerLength: 3 },
      { id: 'g3_70_9', type: 'input', question: '22×45 =', answer: '990', answerLength: 3 },
      { id: 'g3_70_10', type: 'input', question: '(  )÷6=150 =', answer: '900', answerLength: 3 },
    ]
  };

  // 第71关
  levels[71] = {
    title: '第 71 关',
    questions: [
      { id: 'g3_71_1', type: 'input', question: '243÷(  )=81 =', answer: '3', answerLength: 1 },
      { id: 'g3_71_2', type: 'choice', question: '44÷7=(  )', options: ["3……5", "6……2", "1……6", "8……8"], answer: '6……2', answerLength: 2 },
      { id: 'g3_71_3', type: 'input', question: '40×90 =', answer: '3600', answerLength: 4 },
      { id: 'g3_71_4', type: 'input', question: '21×3 =', answer: '63', answerLength: 2 },
      { id: 'g3_71_5', type: 'input', question: '480÷8 =', answer: '60', answerLength: 2 },
      { id: 'g3_71_6', type: 'input', question: '2×3×4 =', answer: '24', answerLength: 2 },
      { id: 'g3_71_7', type: 'input', question: '32÷(  )=4 =', answer: '8', answerLength: 1 },
      { id: 'g3_71_8', type: 'input', question: '12×2 =', answer: '24', answerLength: 2 },
      { id: 'g3_71_9', type: 'input', question: '360÷6 =', answer: '60', answerLength: 2 },
      { id: 'g3_71_10', type: 'input', question: '5×5×2 =', answer: '50', answerLength: 2 },
    ]
  };

  // 第72关
  levels[72] = {
    title: '第 72 关',
    questions: [
      { id: 'g3_72_1', type: 'input', question: '10×50 =', answer: '500', answerLength: 3 },
      { id: 'g3_72_2', type: 'input', question: '19×3 =', answer: '57', answerLength: 2 },
      { id: 'g3_72_3', type: 'input', question: '(  )÷6=9 =', answer: '54', answerLength: 2 },
      { id: 'g3_72_4', type: 'choice', question: '426÷4=', options: ["111……6", "105……8", "106……2", "106……9"], answer: '106……2', answerLength: 4 },
      { id: 'g3_72_5', type: 'choice', question: '613÷2=', options: ["307……7", "307……5", "302……5", "306……1"], answer: '306……1', answerLength: 4 },
      { id: 'g3_72_6', type: 'choice', question: '305÷3=', options: ["98……9", "101……2", "104……8", "98……3"], answer: '101……2', answerLength: 4 },
      { id: 'g3_72_7', type: 'input', question: '72×11 =', answer: '792', answerLength: 3 },
      { id: 'g3_72_8', type: 'input', question: '35×24 =', answer: '840', answerLength: 3 },
      { id: 'g3_72_9', type: 'input', question: '14×68 =', answer: '952', answerLength: 3 },
      { id: 'g3_72_10', type: 'input', question: '(  )÷3=302 =', answer: '906', answerLength: 3 },
    ]
  };

  // 第73关
  levels[73] = {
    title: '第 73 关',
    questions: [
      { id: 'g3_73_1', type: 'input', question: '567÷(  )=81 =', answer: '7', answerLength: 1 },
      { id: 'g3_73_2', type: 'choice', question: '91÷4=(  )', options: ["24……1", "26……6", "22……3", "19……9"], answer: '22……3', answerLength: 3 },
      { id: 'g3_73_3', type: 'input', question: '60×40 =', answer: '2400', answerLength: 4 },
      { id: 'g3_73_4', type: 'input', question: '18×5 =', answer: '90', answerLength: 2 },
      { id: 'g3_73_5', type: 'input', question: '450÷9 =', answer: '50', answerLength: 2 },
      { id: 'g3_73_6', type: 'input', question: '6×1×7 =', answer: '42', answerLength: 2 },
      { id: 'g3_73_7', type: 'input', question: '24÷(  )=6 =', answer: '4', answerLength: 1 },
      { id: 'g3_73_8', type: 'input', question: '50×10 =', answer: '500', answerLength: 3 },
      { id: 'g3_73_9', type: 'input', question: '210÷3 =', answer: '70', answerLength: 2 },
      { id: 'g3_73_10', type: 'input', question: '3×5×2 =', answer: '30', answerLength: 2 },
    ]
  };

  // 第74关
  levels[74] = {
    title: '第 74 关',
    questions: [
      { id: 'g3_74_1', type: 'input', question: '90×90 =', answer: '8100', answerLength: 4 },
      { id: 'g3_74_2', type: 'input', question: '13×4 =', answer: '52', answerLength: 2 },
      { id: 'g3_74_3', type: 'input', question: '(  )÷4=6 =', answer: '24', answerLength: 2 },
      { id: 'g3_74_4', type: 'choice', question: '842÷4=', options: ["210……2", "211……4", "208……7", "209……1"], answer: '210……2', answerLength: 4 },
      { id: 'g3_74_5', type: 'choice', question: '519÷5=', options: ["103……4", "102……1", "101……4", "105……2"], answer: '103……4', answerLength: 4 },
      { id: 'g3_74_6', type: 'choice', question: '625÷6=', options: ["104……1", "103……4", "100……3", "108……7"], answer: '104……1', answerLength: 4 },
      { id: 'g3_74_7', type: 'input', question: '36×15 =', answer: '540', answerLength: 3 },
      { id: 'g3_74_8', type: 'input', question: '27×42 =', answer: '1134', answerLength: 4 },
      { id: 'g3_74_9', type: 'input', question: '43×21 =', answer: '903', answerLength: 3 },
      { id: 'g3_74_10', type: 'input', question: '(  )÷8=120 =', answer: '960', answerLength: 3 },
    ]
  };

  // 第75关
  levels[75] = {
    title: '第 75 关',
    questions: [
      { id: 'g3_75_1', type: 'input', question: '184÷(  )=46 =', answer: '4', answerLength: 1 },
      { id: 'g3_75_2', type: 'choice', question: '62÷5=(  )', options: ["11……3", "12……2", "15……9", "14……8"], answer: '12……2', answerLength: 3 },
      { id: 'g3_75_3', type: 'input', question: '80×50 =', answer: '4000', answerLength: 4 },
      { id: 'g3_75_4', type: 'input', question: '12×7 =', answer: '84', answerLength: 2 },
      { id: 'g3_75_5', type: 'input', question: '560÷7 =', answer: '80', answerLength: 2 },
      { id: 'g3_75_6', type: 'input', question: '8×2×3 =', answer: '48', answerLength: 2 },
      { id: 'g3_75_7', type: 'input', question: '40÷(  )=5 =', answer: '8', answerLength: 1 },
      { id: 'g3_75_8', type: 'input', question: '11×6 =', answer: '66', answerLength: 2 },
      { id: 'g3_75_9', type: 'input', question: '320÷8 =', answer: '40', answerLength: 2 },
      { id: 'g3_75_10', type: 'input', question: '4×4×5 =', answer: '80', answerLength: 2 },
    ]
  };

  // 第76关
  levels[76] = {
    title: '第 76 关',
    questions: [
      { id: 'g3_76_1', type: 'input', question: '20×20 =', answer: '400', answerLength: 3 },
      { id: 'g3_76_2', type: 'input', question: '15×2 =', answer: '30', answerLength: 2 },
      { id: 'g3_76_3', type: 'input', question: '(  )÷5=8 =', answer: '40', answerLength: 2 },
      { id: 'g3_76_4', type: 'choice', question: '317÷3=', options: ["105……2", "100……2", "108……9", "102……2"], answer: '105……2', answerLength: 4 },
      { id: 'g3_76_5', type: 'choice', question: '409÷4=', options: ["106……8", "102……1", "100……8", "102……6"], answer: '102……1', answerLength: 4 },
      { id: 'g3_76_6', type: 'choice', question: '921÷9=', options: ["107……1", "101……8", "106……9", "102……3"], answer: '102……3', answerLength: 4 },
      { id: 'g3_76_7', type: 'input', question: '12×84 =', answer: '1008', answerLength: 4 },
      { id: 'g3_76_8', type: 'input', question: '65×14 =', answer: '910', answerLength: 3 },
      { id: 'g3_76_9', type: 'input', question: '54×19 =', answer: '1026', answerLength: 4 },
      { id: 'g3_76_10', type: 'input', question: '(  )÷7=105 =', answer: '735', answerLength: 3 },
    ]
  };

  // 第77关
  levels[77] = {
    title: '第 77 关',
    questions: [
      { id: 'g3_77_1', type: 'input', question: '640÷(  )=80 =', answer: '8', answerLength: 1 },
      { id: 'g3_77_2', type: 'choice', question: '89÷6=(  )', options: ["16……1", "11……3", "14……5", "15……9"], answer: '14……5', answerLength: 3 },
      { id: 'g3_77_3', type: 'input', question: '30×80 =', answer: '2400', answerLength: 4 },
      { id: 'g3_77_4', type: 'input', question: '24×3 =', answer: '72', answerLength: 2 },
      { id: 'g3_77_5', type: 'input', question: '720÷9 =', answer: '80', answerLength: 2 },
      { id: 'g3_77_6', type: 'input', question: '5×3×4 =', answer: '60', answerLength: 2 },
      { id: 'g3_77_7', type: 'input', question: '18÷(  )=6 =', answer: '3', answerLength: 1 },
      { id: 'g3_77_8', type: 'input', question: '14×5 =', answer: '70', answerLength: 2 },
      { id: 'g3_77_9', type: 'input', question: '180÷6 =', answer: '30', answerLength: 2 },
      { id: 'g3_77_10', type: 'input', question: '2×2×9 =', answer: '36', answerLength: 2 },
    ]
  };

  // 第78关
  levels[78] = {
    title: '第 78 关',
    questions: [
      { id: 'g3_78_1', type: 'input', question: '40×60 =', answer: '2400', answerLength: 4 },
      { id: 'g3_78_2', type: 'input', question: '17×2 =', answer: '34', answerLength: 2 },
      { id: 'g3_78_3', type: 'input', question: '(  )÷3=9 =', answer: '27', answerLength: 2 },
      { id: 'g3_78_4', type: 'choice', question: '716÷7=', options: ["102……2", "107……5", "97……1", "101……6"], answer: '102……2', answerLength: 4 },
      { id: 'g3_78_5', type: 'choice', question: '523÷5=', options: ["99……7", "104……3", "108……5", "108……2"], answer: '104……3', answerLength: 4 },
      { id: 'g3_78_6', type: 'choice', question: '835÷8=', options: ["104……3", "109……9", "109……3", "102……2"], answer: '104……3', answerLength: 4 },
      { id: 'g3_78_7', type: 'input', question: '26×35 =', answer: '910', answerLength: 3 },
      { id: 'g3_78_8', type: 'input', question: '18×52 =', answer: '936', answerLength: 3 },
      { id: 'g3_78_9', type: 'input', question: '31×46 =', answer: '1426', answerLength: 4 },
      { id: 'g3_78_10', type: 'input', question: '(  )÷4=215 =', answer: '860', answerLength: 3 },
    ]
  };

  // 第79关
  levels[79] = {
    title: '第 79 关',
    questions: [
      { id: 'g3_79_1', type: 'input', question: '288÷(  )=32 =', answer: '9', answerLength: 1 },
      { id: 'g3_79_2', type: 'choice', question: '52÷3=(  )', options: ["17……1", "21……4", "15……5", "12……1"], answer: '17……1', answerLength: 3 },
      { id: 'g3_79_3', type: 'input', question: '5600+4400 =', answer: '10000', answerLength: 5 },
      { id: 'g3_79_4', type: 'input', question: '4000−1250 =', answer: '2750', answerLength: 4 },
      { id: 'g3_79_5', type: 'input', question: '780+950 =', answer: '1730', answerLength: 4 },
      { id: 'g3_79_6', type: 'input', question: '1000−365 =', answer: '635', answerLength: 3 },
      { id: 'g3_79_7', type: 'input', question: '2100−850 =', answer: '1250', answerLength: 4 },
      { id: 'g3_79_8', type: 'input', question: '25×40 =', answer: '1000', answerLength: 4 },
      { id: 'g3_79_9', type: 'input', question: '125×80 =', answer: '10000', answerLength: 5 },
      { id: 'g3_79_10', type: 'input', question: '45×20 =', answer: '900', answerLength: 3 },
    ]
  };

  // 第80关
  levels[80] = {
    title: '第 80 关',
    questions: [
      { id: 'g3_80_1', type: 'input', question: '14×500 =', answer: '7000', answerLength: 4 },
      { id: 'g3_80_2', type: 'input', question: '50×60 =', answer: '3000', answerLength: 4 },
      { id: 'g3_80_3', type: 'input', question: '800×15 =', answer: '12000', answerLength: 5 },
      { id: 'g3_80_4', type: 'input', question: '102×30 =', answer: '3060', answerLength: 4 },
      { id: 'g3_80_5', type: 'input', question: '89×76 =', answer: '6764', answerLength: 4 },
      { id: 'g3_80_6', type: 'input', question: '45×82 =', answer: '3690', answerLength: 4 },
      { id: 'g3_80_7', type: 'input', question: '92×58 =', answer: '5336', answerLength: 4 },
      { id: 'g3_80_8', type: 'input', question: '70×93 =', answer: '6510', answerLength: 4 },
      { id: 'g3_80_9', type: 'input', question: '36×47 =', answer: '1692', answerLength: 4 },
      { id: 'g3_80_10', type: 'input', question: '804÷4 =', answer: '201', answerLength: 3 },
    ]
  };

  // 第81关
  levels[81] = {
    title: '第 81 关',
    questions: [
      { id: 'g3_81_1', type: 'input', question: '720÷6 =', answer: '120', answerLength: 3 },
      { id: 'g3_81_2', type: 'input', question: '156÷6 =', answer: '26', answerLength: 2 },
      { id: 'g3_81_3', type: 'input', question: '918÷9 =', answer: '102', answerLength: 3 },
      { id: 'g3_81_4', type: 'input', question: '470+380 =', answer: '850', answerLength: 3 },
      { id: 'g3_81_5', type: 'input', question: '560+290 =', answer: '850', answerLength: 3 },
      { id: 'g3_81_6', type: 'input', question: '640−370 =', answer: '270', answerLength: 3 },
      { id: 'g3_81_7', type: 'input', question: '45×40 =', answer: '1800', answerLength: 4 },
      { id: 'g3_81_8', type: 'input', question: '3100−850 =', answer: '2250', answerLength: 4 },
      { id: 'g3_81_9', type: 'input', question: '14×500 =', answer: '7000', answerLength: 4 },
      { id: 'g3_81_10', type: 'input', question: '920−470 =', answer: '450', answerLength: 3 },
    ]
  };

  // 第82关
  levels[82] = {
    title: '第 82 关',
    questions: [
      { id: 'g3_82_1', type: 'input', question: '125×8 =', answer: '1000', answerLength: 4 },
      { id: 'g3_82_2', type: 'input', question: '670+440 =', answer: '1110', answerLength: 4 },
      { id: 'g3_82_3', type: 'input', question: '5000−1250 =', answer: '3750', answerLength: 4 },
      { id: 'g3_82_4', type: 'input', question: '22×300 =', answer: '6600', answerLength: 4 },
      { id: 'g3_82_5', type: 'input', question: '750+850 =', answer: '1600', answerLength: 4 },
      { id: 'g3_82_6', type: 'input', question: '43×27 =', answer: '1161', answerLength: 4 },
      { id: 'g3_82_7', type: 'input', question: '612÷6 =', answer: '102', answerLength: 3 },
      { id: 'g3_82_8', type: 'input', question: '58×34 =', answer: '1972', answerLength: 4 },
      { id: 'g3_82_9', type: 'input', question: '804÷4 =', answer: '201', answerLength: 3 },
      { id: 'g3_82_10', type: 'input', question: '92×15 =', answer: '1380', answerLength: 4 },
    ]
  };

  // 第83关
  levels[83] = {
    title: '第 83 关',
    questions: [
      { id: 'g3_83_1', type: 'input', question: '425÷5 =', answer: '85', answerLength: 2 },
      { id: 'g3_83_2', type: 'input', question: '76×39 =', answer: '2964', answerLength: 4 },
      { id: 'g3_83_3', type: 'input', question: '918÷9 =', answer: '102', answerLength: 3 },
      { id: 'g3_83_4', type: 'input', question: '28×64 =', answer: '1792', answerLength: 4 },
      { id: 'g3_83_5', type: 'input', question: '1200−450 =', answer: '750', answerLength: 3 },
      { id: 'g3_83_6', type: 'input', question: '3000−1200 =', answer: '1800', answerLength: 4 },
      { id: 'g3_83_7', type: 'input', question: '13×600 =', answer: '7800', answerLength: 4 },
      { id: 'g3_83_8', type: 'input', question: '520+390 =', answer: '910', answerLength: 3 },
      { id: 'g3_83_9', type: 'input', question: '12×50 =', answer: '600', answerLength: 3 },
      { id: 'g3_83_10', type: 'input', question: '2200+1800 =', answer: '4000', answerLength: 4 },
    ]
  };

  // 第84关
  levels[84] = {
    title: '第 84 关',
    questions: [
      { id: 'g3_84_1', type: 'input', question: '25×400 =', answer: '10000', answerLength: 5 },
      { id: 'g3_84_2', type: 'input', question: '1000−365 =', answer: '635', answerLength: 3 },
      { id: 'g3_84_3', type: 'input', question: '90×70 =', answer: '6300', answerLength: 4 },
      { id: 'g3_84_4', type: 'input', question: '16×40 =', answer: '640', answerLength: 3 },
      { id: 'g3_84_5', type: 'input', question: '830−460 =', answer: '370', answerLength: 3 },
      { id: 'g3_84_6', type: 'input', question: '14×70 =', answer: '980', answerLength: 3 },
      { id: 'g3_84_7', type: 'input', question: '54×32 =', answer: '1728', answerLength: 4 },
      { id: 'g3_84_8', type: 'input', question: '315÷3 =', answer: '105', answerLength: 3 },
      { id: 'g3_84_9', type: 'input', question: '81×47 =', answer: '3807', answerLength: 4 },
      { id: 'g3_84_10', type: 'input', question: '720÷6 =', answer: '120', answerLength: 3 },
    ]
  };

  // 第85关
  levels[85] = {
    title: '第 85 关',
    questions: [
      { id: 'g3_85_1', type: 'input', question: '63×29 =', answer: '1827', answerLength: 4 },
      { id: 'g3_85_2', type: 'input', question: '156÷4 =', answer: '39', answerLength: 2 },
      { id: 'g3_85_3', type: 'input', question: '48×55 =', answer: '2640', answerLength: 4 },
      { id: 'g3_85_4', type: 'input', question: '840÷7 =', answer: '120', answerLength: 3 },
      { id: 'g3_85_5', type: 'input', question: '93×12 =', answer: '1116', answerLength: 4 },
      { id: 'g3_85_6', type: 'input', question: '15×30 =', answer: '450', answerLength: 3 },
      { id: 'g3_85_7', type: 'input', question: '25×20 =', answer: '500', answerLength: 3 },
      { id: 'g3_85_8', type: 'input', question: '420+590 =', answer: '1010', answerLength: 4 },
      { id: 'g3_85_9', type: 'input', question: '1600−900 =', answer: '700', answerLength: 3 },
      { id: 'g3_85_10', type: 'input', question: '880+240 =', answer: '1120', answerLength: 4 },
    ]
  };

  // 第86关
  levels[86] = {
    title: '第 86 关',
    questions: [
      { id: 'g3_86_1', type: 'input', question: '4000−150 =', answer: '3850', answerLength: 4 },
      { id: 'g3_86_2', type: 'input', question: '760+580 =', answer: '1340', answerLength: 4 },
      { id: 'g3_86_3', type: 'input', question: '18×50 =', answer: '900', answerLength: 3 },
      { id: 'g3_86_4', type: 'input', question: '2100−300 =', answer: '1800', answerLength: 4 },
      { id: 'g3_86_5', type: 'input', question: '350+950 =', answer: '1300', answerLength: 4 },
      { id: 'g3_86_6', type: 'input', question: '60×50 =', answer: '3000', answerLength: 4 },
      { id: 'g3_86_7', type: 'input', question: '1200−750 =', answer: '450', answerLength: 3 },
      { id: 'g3_86_8', type: 'input', question: '67×21 =', answer: '1407', answerLength: 4 },
      { id: 'g3_86_9', type: 'input', question: '963÷9 =', answer: '107', answerLength: 3 },
      { id: 'g3_86_10', type: 'input', question: '35×46 =', answer: '1610', answerLength: 4 },
    ]
  };

  // 第87关
  levels[87] = {
    title: '第 87 关',
    questions: [
      { id: 'g3_87_1', type: 'input', question: '545÷5 =', answer: '109', answerLength: 3 },
      { id: 'g3_87_2', type: 'input', question: '82×28 =', answer: '2296', answerLength: 4 },
      { id: 'g3_87_3', type: 'input', question: '248÷8 =', answer: '31', answerLength: 2 },
      { id: 'g3_87_4', type: 'input', question: '19×74 =', answer: '1406', answerLength: 4 },
      { id: 'g3_87_5', type: 'input', question: '609÷3 =', answer: '203', answerLength: 3 },
      { id: 'g3_87_6', type: 'input', question: '56×43 =', answer: '2408', answerLength: 4 },
      { id: 'g3_87_7', type: 'input', question: '21×400 =', answer: '8400', answerLength: 4 },
      { id: 'g3_87_8', type: 'input', question: '80×40 =', answer: '3200', answerLength: 4 },
      { id: 'g3_87_9', type: 'input', question: '1000−85 =', answer: '915', answerLength: 3 },
      { id: 'g3_87_10', type: 'input', question: '70×60 =', answer: '4200', answerLength: 4 },
    ]
  };

  // 第88关
  levels[88] = {
    title: '第 88 关',
    questions: [
      { id: 'g3_88_1', type: 'input', question: '1500−650 =', answer: '850', answerLength: 3 },
      { id: 'g3_88_2', type: 'input', question: '32×30 =', answer: '960', answerLength: 3 },
      { id: 'g3_88_3', type: 'input', question: '2400−800 =', answer: '1600', answerLength: 4 },
      { id: 'g3_88_4', type: 'input', question: '400×15 =', answer: '6000', answerLength: 4 },
      { id: 'g3_88_5', type: 'input', question: '530+280 =', answer: '810', answerLength: 3 },
      { id: 'g3_88_6', type: 'input', question: '11×800 =', answer: '8800', answerLength: 4 },
      { id: 'g3_88_7', type: 'input', question: '4100−200 =', answer: '3900', answerLength: 4 },
      { id: 'g3_88_8', type: 'input', question: '130×5 =', answer: '650', answerLength: 3 },
      { id: 'g3_88_9', type: 'input', question: '24×83 =', answer: '1992', answerLength: 4 },
      { id: 'g3_88_10', type: 'input', question: '408÷4 =', answer: '102', answerLength: 3 },
    ]
  };

  // 第89关
  levels[89] = {
    title: '第 89 关',
    questions: [
      { id: 'g3_89_1', type: 'input', question: '95×16 =', answer: '1520', answerLength: 4 },
      { id: 'g3_89_2', type: 'input', question: '714÷7 =', answer: '102', answerLength: 3 },
      { id: 'g3_89_3', type: 'input', question: '37×52 =', answer: '1924', answerLength: 4 },
      { id: 'g3_89_4', type: 'input', question: '816÷4 =', answer: '204', answerLength: 3 },
      { id: 'g3_89_5', type: 'input', question: '68×25 =', answer: '1700', answerLength: 4 },
      { id: 'g3_89_6', type: 'input', question: '324÷6 =', answer: '54', answerLength: 2 },
      { id: 'g3_89_7', type: 'input', question: '49×33 =', answer: '1617', answerLength: 4 },
      { id: 'g3_89_8', type: 'input', question: '1000−245 =', answer: '755', answerLength: 3 },
      { id: 'g3_89_9', type: 'input', question: '26×30 =', answer: '780', answerLength: 3 },
      { id: 'g3_89_10', type: 'input', question: '740+580 =', answer: '1320', answerLength: 4 },
    ]
  };

  // 第90关
  levels[90] = {
    title: '第 90 关',
    questions: [
      { id: 'g3_90_1', type: 'input', question: '820−350 =', answer: '470', answerLength: 3 },
      { id: 'g3_90_2', type: 'input', question: '13×40 =', answer: '520', answerLength: 3 },
      { id: 'g3_90_3', type: 'input', question: '5500+2500 =', answer: '8000', answerLength: 4 },
      { id: 'g3_90_4', type: 'input', question: '4000−1100 =', answer: '2900', answerLength: 4 },
      { id: 'g3_90_5', type: 'input', question: '16×300 =', answer: '4800', answerLength: 4 },
      { id: 'g3_90_6', type: 'input', question: '950−670 =', answer: '280', answerLength: 3 },
      { id: 'g3_90_7', type: 'input', question: '24×20 =', answer: '480', answerLength: 3 },
      { id: 'g3_90_8', type: 'input', question: '150+960 =', answer: '1110', answerLength: 4 },
      { id: 'g3_90_9', type: 'input', question: '1200−880 =', answer: '320', answerLength: 3 },
      { id: 'g3_90_10', type: 'input', question: '71×44 =', answer: '3124', answerLength: 4 },
    ]
  };

  // 第91关
  levels[91] = {
    title: '第 91 关',
    questions: [
      { id: 'g3_91_1', type: 'input', question: '520÷5 =', answer: '104', answerLength: 3 },
      { id: 'g3_91_2', type: 'input', question: '26×89 =', answer: '2314', answerLength: 4 },
      { id: 'g3_91_3', type: 'input', question: '903÷3 =', answer: '301', answerLength: 3 },
      { id: 'g3_91_4', type: 'input', question: '53×67 =', answer: '3551', answerLength: 4 },
      { id: 'g3_91_5', type: 'input', question: '144÷6 =', answer: '24', answerLength: 2 },
      { id: 'g3_91_6', type: 'input', question: '84×18 =', answer: '1512', answerLength: 4 },
      { id: 'g3_91_7', type: 'input', question: '728÷8 =', answer: '91', answerLength: 2 },
      { id: 'g3_91_8', type: 'input', question: '15×92 =', answer: '1380', answerLength: 4 },
      { id: 'g3_91_9', type: 'input', question: '450×2 =', answer: '900', answerLength: 3 },
      { id: 'g3_91_10', type: 'input', question: '1500−950 =', answer: '550', answerLength: 3 },
    ]
  };

  // 第92关
  levels[92] = {
    title: '第 92 关',
    questions: [
      { id: 'g3_92_1', type: 'input', question: '18×500 =', answer: '9000', answerLength: 4 },
      { id: 'g3_92_2', type: 'input', question: '60×60 =', answer: '3600', answerLength: 4 },
      { id: 'g3_92_3', type: 'input', question: '320+890 =', answer: '1210', answerLength: 4 },
      { id: 'g3_92_4', type: 'input', question: '21×40 =', answer: '840', answerLength: 3 },
      { id: 'g3_92_5', type: 'input', question: '1000−480 =', answer: '520', answerLength: 3 },
      { id: 'g3_92_6', type: 'input', question: '770+540 =', answer: '1310', answerLength: 4 },
      { id: 'g3_92_7', type: 'input', question: '125×4 =', answer: '500', answerLength: 3 },
      { id: 'g3_92_8', type: 'input', question: '4200+1900 =', answer: '6100', answerLength: 4 },
      { id: 'g3_92_9', type: 'input', question: '30×15 =', answer: '450', answerLength: 3 },
      { id: 'g3_92_10', type: 'input', question: '25×60 =', answer: '1500', answerLength: 4 },
    ]
  };

  // 第93关
  levels[93] = {
    title: '第 93 关',
    questions: [
      { id: 'g3_93_1', type: 'input', question: '38×56 =', answer: '2128', answerLength: 4 },
      { id: 'g3_93_2', type: 'input', question: '636÷6 =', answer: '106', answerLength: 3 },
      { id: 'g3_93_3', type: 'input', question: '91×23 =', answer: '2093', answerLength: 4 },
      { id: 'g3_93_4', type: 'input', question: '428÷2 =', answer: '214', answerLength: 3 },
      { id: 'g3_93_5', type: 'input', question: '47×35 =', answer: '1645', answerLength: 4 },
      { id: 'g3_93_6', type: 'input', question: '532÷7 =', answer: '76', answerLength: 2 },
      { id: 'g3_93_7', type: 'input', question: '62×49 =', answer: '3038', answerLength: 4 },
      { id: 'g3_93_8', type: 'input', question: '808÷8 =', answer: '101', answerLength: 3 },
      { id: 'g3_93_9', type: 'input', question: '27×78 =', answer: '2106', answerLength: 4 },
      { id: 'g3_93_10', type: 'input', question: '670+840 =', answer: '1510', answerLength: 4 },
    ]
  };

  // 第94关
  levels[94] = {
    title: '第 94 关',
    questions: [
      { id: 'g3_94_1', type: 'input', question: '12×800 =', answer: '9600', answerLength: 4 },
      { id: 'g3_94_2', type: 'input', question: '2000−450 =', answer: '1550', answerLength: 4 },
      { id: 'g3_94_3', type: 'input', question: '35×20 =', answer: '700', answerLength: 3 },
      { id: 'g3_94_4', type: 'input', question: '1400−600 =', answer: '800', answerLength: 3 },
      { id: 'g3_94_5', type: 'input', question: '910−480 =', answer: '430', answerLength: 3 },
      { id: 'g3_94_6', type: 'input', question: '25×80 =', answer: '2000', answerLength: 4 },
      { id: 'g3_94_7', type: 'input', question: '4400−900 =', answer: '3500', answerLength: 4 },
      { id: 'g3_94_8', type: 'input', question: '19×30 =', answer: '570', answerLength: 3 },
      { id: 'g3_94_9', type: 'input', question: '800−350 =', answer: '450', answerLength: 3 },
      { id: 'g3_94_10', type: 'input', question: '560+470 =', answer: '1030', answerLength: 4 },
    ]
  };

  // 第95关
  levels[95] = {
    title: '第 95 关',
    questions: [
      { id: 'g3_95_1', type: 'input', question: '70×70 =', answer: '4900', answerLength: 4 },
      { id: 'g3_95_2', type: 'input', question: '85×14 =', answer: '1190', answerLength: 4 },
      { id: 'g3_95_3', type: 'input', question: '915÷3 =', answer: '305', answerLength: 3 },
      { id: 'g3_95_4', type: 'input', question: '42×66 =', answer: '2772', answerLength: 4 },
      { id: 'g3_95_5', type: 'input', question: '318÷6 =', answer: '53', answerLength: 2 },
      { id: 'g3_95_6', type: 'input', question: '73×22 =', answer: '1606', answerLength: 4 },
      { id: 'g3_95_7', type: 'input', question: '605÷5 =', answer: '121', answerLength: 3 },
      { id: 'g3_95_8', type: 'input', question: '16×95 =', answer: '1520', answerLength: 4 },
      { id: 'g3_95_9', type: 'input', question: '824÷4 =', answer: '206', answerLength: 3 },
      { id: 'g3_95_10', type: 'input', question: '59×37 =', answer: '2183', answerLength: 4 },
    ]
  };

  // 第96关
  levels[96] = {
    title: '第 96 关',
    questions: [
      { id: 'g3_96_1', type: 'input', question: '3100−1250 =', answer: '1850', answerLength: 4 },
      { id: 'g3_96_2', type: 'input', question: '40×90 =', answer: '3600', answerLength: 4 },
      { id: 'g3_96_3', type: 'input', question: '620+390 =', answer: '1010', answerLength: 4 },
      { id: 'g3_96_4', type: 'input', question: '1000−75 =', answer: '925', answerLength: 3 },
      { id: 'g3_96_5', type: 'input', question: '17×400 =', answer: '6800', answerLength: 4 },
      { id: 'g3_96_6', type: 'input', question: '800+750 =', answer: '1550', answerLength: 4 },
      { id: 'g3_96_7', type: 'input', question: '15×60 =', answer: '900', answerLength: 3 },
      { id: 'g3_96_8', type: 'input', question: '50×80 =', answer: '4000', answerLength: 4 },
      { id: 'g3_96_9', type: 'input', question: '360+550 =', answer: '910', answerLength: 3 },
      { id: 'g3_96_10', type: 'input', question: '11×900 =', answer: '9900', answerLength: 4 },
    ]
  };

  // 第97关
  levels[97] = {
    title: '第 97 关',
    questions: [
      { id: 'g3_97_1', type: 'input', question: '2200−450 =', answer: '1750', answerLength: 4 },
      { id: 'g3_97_2', type: 'input', question: '14×50 =', answer: '700', answerLength: 3 },
      { id: 'g3_97_3', type: 'input', question: '64×41 =', answer: '2624', answerLength: 4 },
      { id: 'g3_97_4', type: 'input', question: '707÷7 =', answer: '101', answerLength: 3 },
      { id: 'g3_97_5', type: 'input', question: '28×93 =', answer: '2604', answerLength: 4 },
      { id: 'g3_97_6', type: 'input', question: '416÷4 =', answer: '104', answerLength: 3 },
      { id: 'g3_97_7', type: 'input', question: '55×36 =', answer: '1980', answerLength: 4 },
      { id: 'g3_97_8', type: 'input', question: '927÷9 =', answer: '103', answerLength: 3 },
      { id: 'g3_97_9', type: 'input', question: '83×25 =', answer: '2075', answerLength: 4 },
      { id: 'g3_97_10', type: 'input', question: '125÷5 =', answer: '25', answerLength: 2 },
    ]
  };

  // 第98关
  levels[98] = {
    title: '第 98 关',
    questions: [
      { id: 'g3_98_1', type: 'input', question: '46×58 =', answer: '2668', answerLength: 4 },
      { id: 'g3_98_2', type: 'input', question: '32×200 =', answer: '6400', answerLength: 4 },
      { id: 'g3_98_3', type: 'input', question: '850+550 =', answer: '1400', answerLength: 4 },
      { id: 'g3_98_4', type: 'input', question: '4000−1800 =', answer: '2200', answerLength: 4 },
      { id: 'g3_98_5', type: 'input', question: '15×40 =', answer: '600', answerLength: 3 },
      { id: 'g3_98_6', type: 'input', question: '660+570 =', answer: '1230', answerLength: 4 },
      { id: 'g3_98_7', type: 'input', question: '2200−800 =', answer: '1400', answerLength: 4 },
      { id: 'g3_98_8', type: 'input', question: '90×40 =', answer: '3600', answerLength: 4 },
      { id: 'g3_98_9', type: 'input', question: '480+630 =', answer: '1110', answerLength: 4 },
      { id: 'g3_98_10', type: 'input', question: '1500−750 =', answer: '750', answerLength: 3 },
    ]
  };

  // 第99关
  levels[99] = {
    title: '第 99 关',
    questions: [
      { id: 'g3_99_1', type: 'input', question: '25×40 =', answer: '1000', answerLength: 4 },
      { id: 'g3_99_2', type: 'input', question: '14×200 =', answer: '2800', answerLength: 4 },
      { id: 'g3_99_3', type: 'input', question: '870+340 =', answer: '1210', answerLength: 4 },
      { id: 'g3_99_4', type: 'input', question: '92×48 =', answer: '4416', answerLength: 4 },
      { id: 'g3_99_5', type: 'input', question: '618÷2 =', answer: '309', answerLength: 3 },
      { id: 'g3_99_6', type: 'input', question: '34×75 =', answer: '2550', answerLength: 4 },
      { id: 'g3_99_7', type: 'input', question: '840÷8 =', answer: '105', answerLength: 3 },
      { id: 'g3_99_8', type: 'input', question: '67×13 =', answer: '871', answerLength: 3 },
      { id: 'g3_99_9', type: 'input', question: '450÷9 =', answer: '50', answerLength: 2 },
      { id: 'g3_99_10', type: 'input', question: '29×81 =', answer: '2349', answerLength: 4 },
    ]
  };

  // 第100关
  levels[100] = {
    title: '第 100 关',
    questions: [
      { id: 'g3_100_1', type: 'input', question: '714÷2 =', answer: '357', answerLength: 3 },
      { id: 'g3_100_2', type: 'input', question: '52×52 =', answer: '2704', answerLength: 4 },
      { id: 'g3_100_3', type: 'input', question: '1000−128 =', answer: '872', answerLength: 3 },
      { id: 'g3_100_4', type: 'input', question: '13×70 =', answer: '910', answerLength: 3 },
      { id: 'g3_100_5', type: 'input', question: '520+790 =', answer: '1310', answerLength: 4 },
      { id: 'g3_100_6', type: 'input', question: '820−440 =', answer: '380', answerLength: 3 },
      { id: 'g3_100_7', type: 'input', question: '11×600 =', answer: '6600', answerLength: 4 },
      { id: 'g3_100_8', type: 'input', question: '24×50 =', answer: '1200', answerLength: 4 },
      { id: 'g3_100_9', type: 'input', question: '3000−1150 =', answer: '1850', answerLength: 4 },
      { id: 'g3_100_10', type: 'input', question: '18×20 =', answer: '360', answerLength: 3 },
    ]
  };

  // 第101关
  levels[101] = {
    title: '第 101 关',
    questions: [
      { id: 'g3_101_1', type: 'input', question: '460+550 =', answer: '1010', answerLength: 4 },
      { id: 'g3_101_2', type: 'input', question: '900−430 =', answer: '470', answerLength: 3 },
      { id: 'g3_101_3', type: 'input', question: '70×80 =', answer: '5600', answerLength: 4 },
      { id: 'g3_101_4', type: 'input', question: '15×400 =', answer: '6000', answerLength: 4 },
      { id: 'g3_101_5', type: 'input', question: '17×88 =', answer: '1496', answerLength: 4 },
      { id: 'g3_101_6', type: 'input', question: '309÷3 =', answer: '103', answerLength: 3 },
      { id: 'g3_101_7', type: 'input', question: '76×42 =', answer: '3192', answerLength: 4 },
      { id: 'g3_101_8', type: 'input', question: '960÷8 =', answer: '120', answerLength: 3 },
      { id: 'g3_101_9', type: 'input', question: '89×31 =', answer: '2759', answerLength: 4 },
      { id: 'g3_101_10', type: 'input', question: '546÷6 =', answer: '91', answerLength: 2 },
    ]
  };

  // 第102关
  levels[102] = {
    title: '第 102 关',
    questions: [
      { id: 'g3_102_1', type: 'input', question: '43×64 =', answer: '2752', answerLength: 4 },
      { id: 'g3_102_2', type: 'input', question: '812÷4 =', answer: '203', answerLength: 3 },
      { id: 'g3_102_3', type: 'input', question: '25×76 =', answer: '1900', answerLength: 4 },
      { id: 'g3_102_4', type: 'input', question: '45×20 =', answer: '900', answerLength: 3 },
      { id: 'g3_102_5', type: 'input', question: '3100−1900 =', answer: '1200', answerLength: 4 },
      { id: 'g3_102_6', type: 'input', question: '14×300 =', answer: '4200', answerLength: 4 },
      { id: 'g3_102_7', type: 'input', question: '600+950 =', answer: '1550', answerLength: 4 },
      { id: 'g3_102_8', type: 'input', question: '1000−610 =', answer: '390', answerLength: 3 },
      { id: 'g3_102_9', type: 'input', question: '23×40 =', answer: '920', answerLength: 3 },
      { id: 'g3_102_10', type: 'input', question: '850+660 =', answer: '1510', answerLength: 4 },
    ]
  };

  // 第103关
  levels[103] = {
    title: '第 103 关',
    questions: [
      { id: 'g3_103_1', type: 'input', question: '42×200 =', answer: '8400', answerLength: 4 },
      { id: 'g3_103_2', type: 'input', question: '7000−2500 =', answer: '4500', answerLength: 4 },
      { id: 'g3_103_3', type: 'input', question: '13×30 =', answer: '390', answerLength: 3 },
      { id: 'g3_103_4', type: 'input', question: '520+490 =', answer: '1010', answerLength: 4 },
      { id: 'g3_103_5', type: 'input', question: '1200−850 =', answer: '350', answerLength: 3 },
      { id: 'g3_103_6', type: 'input', question: '33×94 =', answer: '3102', answerLength: 4 },
      { id: 'g3_103_7', type: 'input', question: '420÷4 =', answer: '105', answerLength: 3 },
      { id: 'g3_103_8', type: 'input', question: '68×15 =', answer: '1020', answerLength: 4 },
      { id: 'g3_103_9', type: 'input', question: '515÷5 =', answer: '103', answerLength: 3 },
      { id: 'g3_103_10', type: 'input', question: '92×26 =', answer: '2392', answerLength: 4 },
    ]
  };

  // 第104关
  levels[104] = {
    title: '第 104 关',
    questions: [
      { id: 'g3_104_1', type: 'input', question: '735÷7 =', answer: '105', answerLength: 3 },
      { id: 'g3_104_2', type: 'input', question: '47×58 =', answer: '2726', answerLength: 4 },
      { id: 'g3_104_3', type: 'input', question: '906÷3 =', answer: '302', answerLength: 3 },
      { id: 'g3_104_4', type: 'input', question: '14×85 =', answer: '1190', answerLength: 4 },
      { id: 'g3_104_5', type: 'input', question: '780+440 =', answer: '1220', answerLength: 4 },
      { id: 'g3_104_6', type: 'input', question: '12×600 =', answer: '7200', answerLength: 4 },
      { id: 'g3_104_7', type: 'input', question: '900−350 =', answer: '550', answerLength: 3 },
      { id: 'g3_104_8', type: 'input', question: '25×8 =', answer: '200', answerLength: 3 },
      { id: 'g3_104_9', type: 'input', question: '40×40 =', answer: '1600', answerLength: 4 },
      { id: 'g3_104_10', type: 'input', question: '560+890 =', answer: '1450', answerLength: 4 },
    ]
  };

  // 第105关
  levels[105] = {
    title: '第 105 关',
    questions: [
      { id: 'g3_105_1', type: 'input', question: '1200−350 =', answer: '850', answerLength: 3 },
      { id: 'g3_105_2', type: 'input', question: '15×100 =', answer: '1500', answerLength: 4 },
      { id: 'g3_105_3', type: 'input', question: '810−460 =', answer: '350', answerLength: 3 },
      { id: 'g3_105_4', type: 'input', question: '16×50 =', answer: '800', answerLength: 3 },
      { id: 'g3_105_5', type: 'input', question: '1000−55 =', answer: '945', answerLength: 3 },
      { id: 'g3_105_6', type: 'input', question: '21×30 =', answer: '630', answerLength: 3 },
      { id: 'g3_105_7', type: 'input', question: '56×63 =', answer: '3528', answerLength: 4 },
      { id: 'g3_105_8', type: 'input', question: '824÷8 =', answer: '103', answerLength: 3 },
      { id: 'g3_105_9', type: 'input', question: '19×49 =', answer: '931', answerLength: 3 },
      { id: 'g3_105_10', type: 'input', question: '612÷3 =', answer: '204', answerLength: 3 },
    ]
  };

  // 第106关
  levels[106] = {
    title: '第 106 关',
    questions: [
      { id: 'g3_106_1', type: 'input', question: '87×34 =', answer: '2958', answerLength: 4 },
      { id: 'g3_106_2', type: 'input', question: '440÷8 =', answer: '55', answerLength: 2 },
      { id: 'g3_106_3', type: 'input', question: '32×77 =', answer: '2464', answerLength: 4 },
      { id: 'g3_106_4', type: 'input', question: '918÷6 =', answer: '153', answerLength: 3 },
      { id: 'g3_106_5', type: 'input', question: '65×25 =', answer: '1625', answerLength: 4 },
      { id: 'g3_106_6', type: 'input', question: '60×80 =', answer: '4800', answerLength: 4 },
      { id: 'g3_106_7', type: 'input', question: '2100−900 =', answer: '1200', answerLength: 4 },
      { id: 'g3_106_8', type: 'input', question: '34×20 =', answer: '680', answerLength: 3 },
      { id: 'g3_106_9', type: 'input', question: '1000−420 =', answer: '580', answerLength: 3 },
      { id: 'g3_106_10', type: 'input', question: '780+560 =', answer: '1340', answerLength: 4 },
    ]
  };

  // 第107关
  levels[107] = {
    title: '第 107 关',
    questions: [
      { id: 'g3_107_1', type: 'input', question: '15×300 =', answer: '4500', answerLength: 4 },
      { id: 'g3_107_2', type: 'input', question: '810−450 =', answer: '360', answerLength: 3 },
      { id: 'g3_107_3', type: 'input', question: '22×400 =', answer: '8800', answerLength: 4 },
      { id: 'g3_107_4', type: 'input', question: '500+950 =', answer: '1450', answerLength: 4 },
      { id: 'g3_107_5', type: 'input', question: '12×40 =', answer: '480', answerLength: 3 },
      { id: 'g3_107_6', type: 'input', question: '4000−1200 =', answer: '2800', answerLength: 4 },
      { id: 'g3_107_7', type: 'input', question: '25×30 =', answer: '750', answerLength: 3 },
      { id: 'g3_107_8', type: 'input', question: '28×54 =', answer: '1512', answerLength: 4 },
      { id: 'g3_107_9', type: 'input', question: '700÷5 =', answer: '140', answerLength: 3 },
      { id: 'g3_107_10', type: 'input', question: '93×19 =', answer: '1767', answerLength: 4 },
    ]
  };

  // 第108关
  levels[108] = {
    title: '第 108 关',
    questions: [
      { id: 'g3_108_1', type: 'input', question: '804÷2 =', answer: '402', answerLength: 3 },
      { id: 'g3_108_2', type: 'input', question: '41×67 =', answer: '2747', answerLength: 4 },
      { id: 'g3_108_3', type: 'input', question: '312÷4 =', answer: '78', answerLength: 2 },
      { id: 'g3_108_4', type: 'input', question: '74×36 =', answer: '2664', answerLength: 4 },
      { id: 'g3_108_5', type: 'input', question: '505÷5 =', answer: '101', answerLength: 3 },
      { id: 'g3_108_6', type: 'input', question: '22×91 =', answer: '2002', answerLength: 4 },
      { id: 'g3_108_7', type: 'input', question: '470+650 =', answer: '1120', answerLength: 4 },
      { id: 'g3_108_8', type: 'input', question: '12×90 =', answer: '1080', answerLength: 4 },
      { id: 'g3_108_9', type: 'input', question: '4000−1650 =', answer: '2350', answerLength: 4 },
      { id: 'g3_108_10', type: 'input', question: '25×40 =', answer: '1000', answerLength: 4 },
    ]
  };

  // 第109关
  levels[109] = {
    title: '第 109 关',
    questions: [
      { id: 'g3_109_1', type: 'input', question: '550+670 =', answer: '1220', answerLength: 4 },
      { id: 'g3_109_2', type: 'input', question: '1200−950 =', answer: '250', answerLength: 3 },
      { id: 'g3_109_3', type: 'input', question: '16×50 =', answer: '800', answerLength: 3 },
      { id: 'g3_109_4', type: 'input', question: '310+890 =', answer: '1200', answerLength: 4 },
      { id: 'g3_109_5', type: 'input', question: '900−360 =', answer: '540', answerLength: 3 },
      { id: 'g3_109_6', type: 'input', question: '15×200 =', answer: '3000', answerLength: 4 },
      { id: 'g3_109_7', type: 'input', question: '530+680 =', answer: '1210', answerLength: 4 },
      { id: 'g3_109_8', type: 'input', question: '80×30 =', answer: '2400', answerLength: 4 },
      { id: 'g3_109_9', type: 'input', question: '81×53 =', answer: '4293', answerLength: 4 },
      { id: 'g3_109_10', type: 'input', question: '630÷6 =', answer: '105', answerLength: 3 },
    ]
  };

  // 第110关
  levels[110] = {
    title: '第 110 关',
    questions: [
      { id: 'g3_110_1', type: 'input', question: '35×82 =', answer: '2870', answerLength: 4 },
      { id: 'g3_110_2', type: 'input', question: '927÷3 =', answer: '309', answerLength: 3 },
      { id: 'g3_110_3', type: 'input', question: '66×47 =', answer: '3102', answerLength: 4 },
      { id: 'g3_110_4', type: 'input', question: '152÷8 =', answer: '19', answerLength: 2 },
      { id: 'g3_110_5', type: 'input', question: '13×99 =', answer: '1287', answerLength: 4 },
      { id: 'g3_110_6', type: 'input', question: '412÷4 =', answer: '103', answerLength: 3 },
      { id: 'g3_110_7', type: 'input', question: '57×28 =', answer: '1596', answerLength: 4 },
      { id: 'g3_110_8', type: 'input', question: '1500−880 =', answer: '620', answerLength: 3 },
      { id: 'g3_110_9', type: 'input', question: '850+270 =', answer: '1120', answerLength: 4 },
      { id: 'g3_110_10', type: 'input', question: '14×400 =', answer: '5600', answerLength: 4 },
    ]
  };

  // 第111关
  levels[111] = {
    title: '第 111 关',
    questions: [
      { id: 'g3_111_1', type: 'input', question: '900−540 =', answer: '360', answerLength: 3 },
      { id: 'g3_111_2', type: 'input', question: '11×700 =', answer: '7700', answerLength: 4 },
      { id: 'g3_111_3', type: 'input', question: '640+580 =', answer: '1220', answerLength: 4 },
      { id: 'g3_111_4', type: 'input', question: '30×90 =', answer: '2700', answerLength: 4 },
      { id: 'g3_111_5', type: 'input', question: '1000−45 =', answer: '955', answerLength: 3 },
      { id: 'g3_111_6', type: 'input', question: '12×70 =', answer: '840', answerLength: 3 },
      { id: 'g3_111_7', type: 'input', question: '420+790 =', answer: '1210', answerLength: 4 },
      { id: 'g3_111_8', type: 'input', question: '25×12 =', answer: '300', answerLength: 3 },
      { id: 'g3_111_9', type: 'input', question: '1300−450 =', answer: '850', answerLength: 3 },
      { id: 'g3_111_10', type: 'input', question: '49×71 =', answer: '3479', answerLength: 4 },
    ]
  };

  // 第112关
  levels[112] = {
    title: '第 112 关',
    questions: [
      { id: 'g3_112_1', type: 'input', question: '816÷8 =', answer: '102', answerLength: 3 },
      { id: 'g3_112_2', type: 'input', question: '23×65 =', answer: '1495', answerLength: 4 },
      { id: 'g3_112_3', type: 'input', question: '618÷6 =', answer: '103', answerLength: 3 },
      { id: 'g3_112_4', type: 'input', question: '95×34 =', answer: '3230', answerLength: 4 },
      { id: 'g3_112_5', type: 'input', question: '435÷5 =', answer: '87', answerLength: 2 },
      { id: 'g3_112_6', type: 'input', question: '62×16 =', answer: '992', answerLength: 3 },
      { id: 'g3_112_7', type: 'input', question: '909÷9 =', answer: '101', answerLength: 3 },
      { id: 'g3_112_8', type: 'input', question: '38×45 =', answer: '1710', answerLength: 4 },
      { id: 'g3_112_9', type: 'input', question: '13×50 =', answer: '650', answerLength: 3 },
      { id: 'g3_112_10', type: 'input', question: '4000−2100 =', answer: '1900', answerLength: 4 },
    ]
  };

  // 第113关
  levels[113] = {
    title: '第 113 关',
    questions: [
      { id: 'g3_113_1', type: 'input', question: '520+690 =', answer: '1210', answerLength: 4 },
      { id: 'g3_113_2', type: 'input', question: '18×300 =', answer: '5400', answerLength: 4 },
      { id: 'g3_113_3', type: 'input', question: '35×20 =', answer: '700', answerLength: 3 },
      { id: 'g3_113_4', type: 'input', question: '1000−730 =', answer: '270', answerLength: 3 },
      { id: 'g3_113_5', type: 'input', question: '22×40 =', answer: '880', answerLength: 3 },
      { id: 'g3_113_6', type: 'input', question: '450+660 =', answer: '1110', answerLength: 4 },
      { id: 'g3_113_7', type: 'input', question: '14×60 =', answer: '840', answerLength: 3 },
      { id: 'g3_113_8', type: 'input', question: '2100−850 =', answer: '1250', answerLength: 4 },
      { id: 'g3_113_9', type: 'input', question: '80×50 =', answer: '4000', answerLength: 4 },
      { id: 'g3_113_10', type: 'input', question: '160+950 =', answer: '1110', answerLength: 4 },
    ]
  };

  // 第114关
  levels[114] = {
    title: '第 114 关',
    questions: [
      { id: 'g3_114_1', type: 'input', question: '77×24 =', answer: '1848', answerLength: 4 },
      { id: 'g3_114_2', type: 'input', question: '540÷9 =', answer: '60', answerLength: 2 },
      { id: 'g3_114_3', type: 'input', question: '18×83 =', answer: '1494', answerLength: 4 },
      { id: 'g3_114_4', type: 'input', question: '721÷7 =', answer: '103', answerLength: 3 },
      { id: 'g3_114_5', type: 'input', question: '46×62 =', answer: '2852', answerLength: 4 },
      { id: 'g3_114_6', type: 'input', question: '306÷3 =', answer: '102', answerLength: 3 },
      { id: 'g3_114_7', type: 'input', question: '89×21 =', answer: '1869', answerLength: 4 },
      { id: 'g3_114_8', type: 'input', question: '840÷6 =', answer: '140', answerLength: 3 },
      { id: 'g3_114_9', type: 'input', question: '33×56 =', answer: '1848', answerLength: 4 },
      { id: 'g3_114_10', type: 'input', question: '1000−315 =', answer: '685', answerLength: 3 },
    ]
  };

  // 第115关
  levels[115] = {
    title: '第 115 关',
    questions: [
      { id: 'g3_115_1', type: 'input', question: '14×70 =', answer: '980', answerLength: 3 },
      { id: 'g3_115_2', type: 'input', question: '560+770 =', answer: '1330', answerLength: 4 },
      { id: 'g3_115_3', type: 'input', question: '21×40 =', answer: '840', answerLength: 3 },
      { id: 'g3_115_4', type: 'input', question: '4000−1450 =', answer: '2550', answerLength: 4 },
      { id: 'g3_115_5', type: 'input', question: '16×300 =', answer: '4800', answerLength: 4 },
      { id: 'g3_115_6', type: 'input', question: '920−550 =', answer: '370', answerLength: 3 },
      { id: 'g3_115_7', type: 'input', question: '12×80 =', answer: '960', answerLength: 3 },
      { id: 'g3_115_8', type: 'input', question: '450+960 =', answer: '1410', answerLength: 4 },
      { id: 'g3_115_9', type: 'input', question: '25×20 =', answer: '500', answerLength: 3 },
      { id: 'g3_115_10', type: 'input', question: '1000−740 =', answer: '260', answerLength: 3 },
    ]
  };

  // 第116关
  levels[116] = {
    title: '第 116 关',
    questions: [
      { id: 'g3_116_1', type: 'input', question: '33×30 =', answer: '990', answerLength: 3 },
      { id: 'g3_116_2', type: 'input', question: '61×59 =', answer: '3599', answerLength: 4 },
      { id: 'g3_116_3', type: 'input', question: '424÷4 =', answer: '106', answerLength: 3 },
      { id: 'g3_116_4', type: 'input', question: '25×73 =', answer: '1825', answerLength: 4 },
      { id: 'g3_116_5', type: 'input', question: '912÷8 =', answer: '114', answerLength: 3 },
      { id: 'g3_116_6', type: 'input', question: '84×35 =', answer: '2940', answerLength: 4 },
      { id: 'g3_116_7', type: 'input', question: '525÷7 =', answer: '75', answerLength: 2 },
      { id: 'g3_116_8', type: 'input', question: '39×47 =', answer: '1833', answerLength: 4 },
      { id: 'g3_116_9', type: 'input', question: '606÷6 =', answer: '101', answerLength: 3 },
      { id: 'g3_116_10', type: 'input', question: '92×18 =', answer: '1656', answerLength: 4 },
    ]
  };

  // 第117关
  levels[117] = {
    title: '第 117 关',
    questions: [
      { id: 'g3_117_1', type: 'input', question: '25×80 =', answer: '2000', answerLength: 4 },
      { id: 'g3_117_2', type: 'input', question: '410+890 =', answer: '1300', answerLength: 4 },
      { id: 'g3_117_3', type: 'input', question: '1200−850 =', answer: '350', answerLength: 3 },
      { id: 'g3_117_4', type: 'input', question: '11×50 =', answer: '550', answerLength: 3 },
      { id: 'g3_117_5', type: 'input', question: '760+450 =', answer: '1210', answerLength: 4 },
      { id: 'g3_117_6', type: 'input', question: '90×60 =', answer: '5400', answerLength: 4 },
      { id: 'g3_117_7', type: 'input', question: '1000−82 =', answer: '918', answerLength: 3 },
      { id: 'g3_117_8', type: 'input', question: '13×400 =', answer: '5200', answerLength: 4 },
      { id: 'g3_117_9', type: 'input', question: '320+690 =', answer: '1010', answerLength: 4 },
      { id: 'g3_117_10', type: 'input', question: '1200−650 =', answer: '550', answerLength: 3 },
    ]
  };

  // 第118关
  levels[118] = {
    title: '第 118 关',
    questions: [
      { id: 'g3_118_1', type: 'input', question: '15×50 =', answer: '750', answerLength: 3 },
      { id: 'g3_118_2', type: 'input', question: '540+880 =', answer: '1420', answerLength: 4 },
      { id: 'g3_118_3', type: 'input', question: '55×84 =', answer: '4620', answerLength: 4 },
      { id: 'g3_118_4', type: 'input', question: '318÷3 =', answer: '106', answerLength: 3 },
      { id: 'g3_118_5', type: 'input', question: '43×29 =', answer: '1247', answerLength: 4 },
      { id: 'g3_118_6', type: 'input', question: '816÷2 =', answer: '408', answerLength: 3 },
      { id: 'g3_118_7', type: 'input', question: '76×12 =', answer: '912', answerLength: 3 },
      { id: 'g3_118_8', type: 'input', question: '648÷8 =', answer: '81', answerLength: 2 },
      { id: 'g3_118_9', type: 'input', question: '14×96 =', answer: '1344', answerLength: 4 },
      { id: 'g3_118_10', type: 'input', question: '742÷7 =', answer: '106', answerLength: 3 },
    ]
  };

  // 第119关
  levels[119] = {
    title: '第 119 关',
    questions: [
      { id: 'g3_119_1', type: 'input', question: '68×37 =', answer: '2516', answerLength: 4 },
      { id: 'g3_119_2', type: 'input', question: '840+570 =', answer: '1410', answerLength: 4 },
      { id: 'g3_119_3', type: 'input', question: '15×600 =', answer: '9000', answerLength: 4 },
      { id: 'g3_119_4', type: 'input', question: '1000−640 =', answer: '360', answerLength: 3 },
      { id: 'g3_119_5', type: 'input', question: '25×40 =', answer: '1000', answerLength: 4 },
      { id: 'g3_119_6', type: 'input', question: '12×500 =', answer: '6000', answerLength: 4 },
      { id: 'g3_119_7', type: 'input', question: '3100−1800 =', answer: '1300', answerLength: 4 },
      { id: 'g3_119_8', type: 'input', question: '440+780 =', answer: '1220', answerLength: 4 },
      { id: 'g3_119_9', type: 'input', question: '16×40 =', answer: '640', answerLength: 3 },
      { id: 'g3_119_10', type: 'input', question: '1500−850 =', answer: '650', answerLength: 3 },
    ]
  };

  // 第120关
  levels[120] = {
    title: '第 120 关',
    questions: [
      { id: 'g3_120_1', type: 'input', question: '22×30 =', answer: '660', answerLength: 3 },
      { id: 'g3_120_2', type: 'input', question: '70×90 =', answer: '6300', answerLength: 4 },
      { id: 'g3_120_3', type: 'input', question: '600+750 =', answer: '1350', answerLength: 4 },
      { id: 'g3_120_4', type: 'input', question: '26×74 =', answer: '1924', answerLength: 4 },
      { id: 'g3_120_5', type: 'input', question: '900÷4 =', answer: '225', answerLength: 3 },
      { id: 'g3_120_6', type: 'input', question: '82×51 =', answer: '4182', answerLength: 4 },
      { id: 'g3_120_7', type: 'input', question: '510÷5 =', answer: '102', answerLength: 3 },
      { id: 'g3_120_8', type: 'input', question: '37×63 =', answer: '2331', answerLength: 4 },
      { id: 'g3_120_9', type: 'input', question: '832÷8 =', answer: '104', answerLength: 3 },
      { id: 'g3_120_10', type: 'input', question: '91×19 =', answer: '1729', answerLength: 4 },
    ]
  };

  // 第121关
  levels[121] = {
    title: '第 121 关',
    questions: [
      { id: 'g3_121_1', type: 'input', question: '408÷2 =', answer: '204', answerLength: 3 },
      { id: 'g3_121_2', type: 'input', question: '45×44 =', answer: '1980', answerLength: 4 },
      { id: 'g3_121_3', type: 'input', question: '25×4 =', answer: '100', answerLength: 3 },
      { id: 'g3_121_4', type: 'input', question: '125×8 =', answer: '1000', answerLength: 4 },
      { id: 'g3_121_5', type: 'input', question: '12×6 =', answer: '72', answerLength: 2 },
      { id: 'g3_121_6', type: 'input', question: '720÷8 =', answer: '90', answerLength: 2 },
      { id: 'g3_121_7', type: 'input', question: '14×5 =', answer: '70', answerLength: 2 },
      { id: 'g3_121_8', type: 'input', question: '450÷9 =', answer: '50', answerLength: 2 },
      { id: 'g3_121_9', type: 'input', question: '13×4 =', answer: '52', answerLength: 2 },
      { id: 'g3_121_10', type: 'input', question: '210×3 =', answer: '630', answerLength: 3 },
    ]
  };

  // 第122关
  levels[122] = {
    title: '第 122 关',
    questions: [
      { id: 'g3_122_1', type: 'input', question: '360÷6 =', answer: '60', answerLength: 2 },
      { id: 'g3_122_2', type: 'input', question: '100−64 =', answer: '36', answerLength: 2 },
      { id: 'g3_122_3', type: 'input', question: '48+52 =', answer: '100', answerLength: 3 },
      { id: 'g3_122_4', type: 'input', question: '数串25、26、27…105一共有几个数？ =', answer: '81', answerLength: 2 },
      { id: 'g3_122_5', type: 'input', question: '数串1、2、3…120一共有几个数？ =', answer: '120', answerLength: 3 },
      { id: 'g3_122_6', type: 'input', question: '25×4 =', answer: '100', answerLength: 3 },
      { id: 'g3_122_7', type: 'input', question: '125×8 =', answer: '1000', answerLength: 4 },
      { id: 'g3_122_8', type: 'input', question: '100−37 =', answer: '63', answerLength: 2 },
      { id: 'g3_122_9', type: 'input', question: '480÷4 =', answer: '120', answerLength: 3 },
      { id: 'g3_122_10', type: 'input', question: '90×7 =', answer: '630', answerLength: 3 },
    ]
  };

  // 第123关
  levels[123] = {
    title: '第 123 关',
    questions: [
      { id: 'g3_123_1', type: 'input', question: '200−155 =', answer: '45', answerLength: 2 },
      { id: 'g3_123_2', type: 'input', question: '360÷6 =', answer: '60', answerLength: 2 },
      { id: 'g3_123_3', type: 'input', question: '42+58 =', answer: '100', answerLength: 3 },
      { id: 'g3_123_4', type: 'input', question: '11×13 =', answer: '143', answerLength: 3 },
      { id: 'g3_123_5', type: 'input', question: '15×6 =', answer: '90', answerLength: 2 },
      { id: 'g3_123_6', type: 'input', question: '720÷8 =', answer: '90', answerLength: 2 },
      { id: 'g3_123_7', type: 'input', question: '14×5 =', answer: '70', answerLength: 2 },
      { id: 'g3_123_8', type: 'input', question: '66+44 =', answer: '110', answerLength: 3 },
      { id: 'g3_123_9', type: 'input', question: '25×2 =', answer: '50', answerLength: 2 },
      { id: 'g3_123_10', type: 'input', question: '17×3 =', answer: '51', answerLength: 2 },
    ]
  };

  // 第124关
  levels[124] = {
    title: '第 124 关',
    questions: [
      { id: 'g3_124_1', type: 'input', question: '81−29 =', answer: '52', answerLength: 2 },
      { id: 'g3_124_2', type: 'input', question: '400÷5 =', answer: '80', answerLength: 2 },
      { id: 'g3_124_3', type: 'input', question: '210÷3 =', answer: '70', answerLength: 2 },
      { id: 'g3_124_4', type: 'input', question: '300−158 =', answer: '142', answerLength: 3 },
      { id: 'g3_124_5', type: 'input', question: '540÷6 =', answer: '90', answerLength: 2 },
      { id: 'g3_124_6', type: 'input', question: '96÷4 =', answer: '24', answerLength: 2 },
      { id: 'g3_124_7', type: 'input', question: '11×12 =', answer: '132', answerLength: 3 },
      { id: 'g3_124_8', type: 'input', question: '130+70 =', answer: '200', answerLength: 3 },
      { id: 'g3_124_9', type: 'input', question: '16×5 =', answer: '80', answerLength: 2 },
      { id: 'g3_124_10', type: 'input', question: '150−75 =', answer: '75', answerLength: 2 },
    ]
  };

  // 第125关
  levels[125] = {
    title: '第 125 关',
    questions: [
      { id: 'g3_125_1', type: 'input', question: '48+52 =', answer: '100', answerLength: 3 },
      { id: 'g3_125_2', type: 'input', question: '19×4 =', answer: '76', answerLength: 2 },
      { id: 'g3_125_3', type: 'input', question: '310−140 =', answer: '170', answerLength: 3 },
      { id: 'g3_125_4', type: 'input', question: '450÷9 =', answer: '50', answerLength: 2 },
      { id: 'g3_125_5', type: 'input', question: '630÷7 =', answer: '90', answerLength: 2 },
      { id: 'g3_125_6', type: 'input', question: '24×3 =', answer: '72', answerLength: 2 },
      { id: 'g3_125_7', type: 'input', question: '88÷2 =', answer: '44', answerLength: 2 },
      { id: 'g3_125_8', type: 'input', question: '720÷9 =', answer: '80', answerLength: 2 },
      { id: 'g3_125_9', type: 'input', question: '12×8 =', answer: '96', answerLength: 2 },
      { id: 'g3_125_10', type: 'input', question: '8×25 =', answer: '200', answerLength: 3 },
    ]
  };

  // 第126关
  levels[126] = {
    title: '第 126 关',
    questions: [
      { id: 'g3_126_1', type: 'input', question: '11×15 =', answer: '165', answerLength: 3 },
      { id: 'g3_126_2', type: 'input', question: '220+80 =', answer: '300', answerLength: 3 },
      { id: 'g3_126_3', type: 'input', question: '18×3 =', answer: '54', answerLength: 2 },
      { id: 'g3_126_4', type: 'input', question: '14×4 =', answer: '56', answerLength: 2 },
      { id: 'g3_126_5', type: 'input', question: '65+35 =', answer: '100', answerLength: 3 },
      { id: 'g3_126_6', type: 'input', question: '17×5 =', answer: '85', answerLength: 2 },
      { id: 'g3_126_7', type: 'input', question: '900÷9 =', answer: '100', answerLength: 3 },
      { id: 'g3_126_8', type: 'input', question: '105−36 =', answer: '69', answerLength: 2 },
      { id: 'g3_126_9', type: 'input', question: '420÷6 =', answer: '70', answerLength: 2 },
      { id: 'g3_126_10', type: 'input', question: '280÷7 =', answer: '40', answerLength: 2 },
    ]
  };

  // 第127关
  levels[127] = {
    title: '第 127 关',
    questions: [
      { id: 'g3_127_1', type: 'input', question: '500−240 =', answer: '260', answerLength: 3 },
      { id: 'g3_127_2', type: 'input', question: '120×3 =', answer: '360', answerLength: 3 },
      { id: 'g3_127_3', type: 'input', question: '26×3 =', answer: '78', answerLength: 2 },
      { id: 'g3_127_4', type: 'input', question: '155+45 =', answer: '200', answerLength: 3 },
      { id: 'g3_127_5', type: 'input', question: '12×11 =', answer: '132', answerLength: 3 },
      { id: 'g3_127_6', type: 'input', question: '24×2 =', answer: '48', answerLength: 2 },
      { id: 'g3_127_7', type: 'input', question: '92−48 =', answer: '44', answerLength: 2 },
      { id: 'g3_127_8', type: 'input', question: '640÷8 =', answer: '80', answerLength: 2 },
      { id: 'g3_127_9', type: 'input', question: '160÷4 =', answer: '40', answerLength: 2 },
      { id: 'g3_127_10', type: 'input', question: '400−230 =', answer: '170', answerLength: 3 },
    ]
  };

  // 第128关
  levels[128] = {
    title: '第 128 关',
    questions: [
      { id: 'g3_128_1', type: 'input', question: '350÷5 =', answer: '70', answerLength: 2 },
      { id: 'g3_128_2', type: 'input', question: '84÷6 =', answer: '14', answerLength: 2 },
      { id: 'g3_128_3', type: 'input', question: '15×8 =', answer: '120', answerLength: 3 },
      { id: 'g3_128_4', type: 'input', question: '110×4 =', answer: '440', answerLength: 3 },
      { id: 'g3_128_5', type: 'input', question: '13×9 =', answer: '117', answerLength: 3 },
      { id: 'g3_128_6', type: 'input', question: '75+125 =', answer: '200', answerLength: 3 },
      { id: 'g3_128_7', type: 'input', question: '22×4 =', answer: '88', answerLength: 2 },
      { id: 'g3_128_8', type: 'input', question: '16×6 =', answer: '96', answerLength: 2 },
      { id: 'g3_128_9', type: 'input', question: '180−95 =', answer: '85', answerLength: 2 },
      { id: 'g3_128_10', type: 'input', question: '810÷9 =', answer: '90', answerLength: 2 },
    ]
  };

  // 第129关
  levels[129] = {
    title: '第 129 关',
    questions: [
      { id: 'g3_129_1', type: 'input', question: '270÷3 =', answer: '90', answerLength: 2 },
      { id: 'g3_129_2', type: 'input', question: '500−199 =', answer: '301', answerLength: 3 },
      { id: 'g3_129_3', type: 'input', question: '320÷4 =', answer: '80', answerLength: 2 },
      { id: 'g3_129_4', type: 'input', question: '91÷7 =', answer: '13', answerLength: 2 },
      { id: 'g3_129_5', type: 'input', question: '14×6 =', answer: '84', answerLength: 2 },
      { id: 'g3_129_6', type: 'input', question: '150×2 =', answer: '300', answerLength: 3 },
      { id: 'g3_129_7', type: 'input', question: '17×4 =', answer: '68', answerLength: 2 },
      { id: 'g3_129_8', type: 'input', question: '230+70 =', answer: '300', answerLength: 3 },
      { id: 'g3_129_9', type: 'input', question: '25×3 =', answer: '75', answerLength: 2 },
      { id: 'g3_129_10', type: 'input', question: '12×8 =', answer: '96', answerLength: 2 },
    ]
  };

  // 第130关
  levels[130] = {
    title: '第 130 关',
    questions: [
      { id: 'g3_130_1', type: 'input', question: '63+87 =', answer: '150', answerLength: 3 },
      { id: 'g3_130_2', type: 'input', question: '560÷7 =', answer: '80', answerLength: 2 },
      { id: 'g3_130_3', type: 'input', question: '400÷8 =', answer: '50', answerLength: 2 },
      { id: 'g3_130_4', type: 'input', question: '1000−650 =', answer: '350', answerLength: 3 },
      { id: 'g3_130_5', type: 'input', question: '480÷6 =', answer: '80', answerLength: 2 },
      { id: 'g3_130_6', type: 'input', question: '72÷3 =', answer: '24', answerLength: 2 },
      { id: 'g3_130_7', type: 'input', question: '19×2 =', answer: '38', answerLength: 2 },
      { id: 'g3_130_8', type: 'input', question: '11×14 =', answer: '154', answerLength: 3 },
      { id: 'g3_130_9', type: 'input', question: '15×7 =', answer: '105', answerLength: 3 },
      { id: 'g3_130_10', type: 'input', question: '88+112 =', answer: '200', answerLength: 3 },
    ]
  };

  // 第131关
  levels[131] = {
    title: '第 131 关',
    questions: [
      { id: 'g3_131_1', type: 'input', question: '21×5 =', answer: '105', answerLength: 3 },
      { id: 'g3_131_2', type: 'input', question: '13×8 =', answer: '104', answerLength: 3 },
      { id: 'g3_131_3', type: 'input', question: '200−134 =', answer: '66', answerLength: 2 },
      { id: 'g3_131_4', type: 'input', question: '300÷6 =', answer: '50', answerLength: 2 },
      { id: 'g3_131_5', type: 'input', question: '360÷4 =', answer: '90', answerLength: 2 },
      { id: 'g3_131_6', type: 'input', question: '420−180 =', answer: '240', answerLength: 3 },
      { id: 'g3_131_7', type: 'input', question: '450÷5 =', answer: '90', answerLength: 2 },
      { id: 'g3_131_8', type: 'input', question: '96÷8 =', answer: '12', answerLength: 2 },
      { id: 'g3_131_9', type: 'input', question: '12×9 =', answer: '108', answerLength: 3 },
      { id: 'g3_131_10', type: 'input', question: '16×4 =', answer: '64', answerLength: 2 },
    ]
  };

  // 第132关
  levels[132] = {
    title: '第 132 关',
    questions: [
      { id: 'g3_132_1', type: 'input', question: '35×2 =', answer: '70', answerLength: 2 },
      { id: 'g3_132_2', type: 'input', question: '142+58 =', answer: '200', answerLength: 3 },
      { id: 'g3_132_3', type: 'input', question: '11×18 =', answer: '198', answerLength: 3 },
      { id: 'g3_132_4', type: 'input', question: '14×7 =', answer: '98', answerLength: 2 },
      { id: 'g3_132_5', type: 'input', question: '150−66 =', answer: '84', answerLength: 2 },
      { id: 'g3_132_6', type: 'input', question: '490÷7 =', answer: '70', answerLength: 2 },
      { id: 'g3_132_7', type: 'input', question: '180÷2 =', answer: '90', answerLength: 2 },
      { id: 'g3_132_8', type: 'input', question: '600−245 =', answer: '355', answerLength: 3 },
      { id: 'g3_132_9', type: 'input', question: '720÷9 =', answer: '80', answerLength: 2 },
      { id: 'g3_132_10', type: 'input', question: '80÷5 =', answer: '16', answerLength: 2 },
    ]
  };

  // 第133关
  levels[133] = {
    title: '第 133 关',
    questions: [
      { id: 'g3_133_1', type: 'input', question: '23×3 =', answer: '69', answerLength: 2 },
      { id: 'g3_133_2', type: 'input', question: '12×12 =', answer: '144', answerLength: 3 },
      { id: 'g3_133_3', type: 'input', question: '16×3 =', answer: '48', answerLength: 2 },
      { id: 'g3_133_4', type: 'input', question: '85+115 =', answer: '200', answerLength: 3 },
      { id: 'g3_133_5', type: 'input', question: '25×6 =', answer: '150', answerLength: 3 },
      { id: 'g3_133_6', type: 'input', question: '18×5 =', answer: '90', answerLength: 2 },
      { id: 'g3_133_7', type: 'input', question: '190−45 =', answer: '145', answerLength: 3 },
      { id: 'g3_133_8', type: 'input', question: '320÷8 =', answer: '40', answerLength: 2 },
      { id: 'g3_133_9', type: 'input', question: '540÷9 =', answer: '60', answerLength: 2 },
      { id: 'g3_133_10', type: 'input', question: '700−320 =', answer: '380', answerLength: 3 },
    ]
  };

  // 第134关
  levels[134] = {
    title: '第 134 关',
    questions: [
      { id: 'g3_134_1', type: 'input', question: '240÷4 =', answer: '60', answerLength: 2 },
      { id: 'g3_134_2', type: 'input', question: '78÷2 =', answer: '39', answerLength: 2 },
      { id: 'g3_134_3', type: 'input', question: '13×10 =', answer: '130', answerLength: 3 },
      { id: 'g3_134_4', type: 'input', question: '15×4 =', answer: '60', answerLength: 2 },
      { id: 'g3_134_5', type: 'input', question: '17×6 =', answer: '102', answerLength: 3 },
      { id: 'g3_134_6', type: 'input', question: '99+101 =', answer: '200', answerLength: 3 },
      { id: 'g3_134_7', type: 'input', question: '12×15 =', answer: '180', answerLength: 3 },
      { id: 'g3_134_8', type: 'input', question: '22×3 =', answer: '66', answerLength: 2 },
      { id: 'g3_134_9', type: 'input', question: '210−85 =', answer: '125', answerLength: 3 },
      { id: 'g3_134_10', type: 'input', question: '480÷4 =', answer: '120', answerLength: 3 },
    ]
  };

  // 第135关
  levels[135] = {
    title: '第 135 关',
    questions: [
      { id: 'g3_135_1', type: 'input', question: '400÷5 =', answer: '80', answerLength: 2 },
      { id: 'g3_135_2', type: 'input', question: '800−460 =', answer: '340', answerLength: 3 },
      { id: 'g3_135_3', type: 'input', question: '360÷6 =', answer: '60', answerLength: 2 },
      { id: 'g3_135_4', type: 'input', question: '65÷5 =', answer: '13', answerLength: 2 },
      { id: 'g3_135_5', type: 'input', question: '14×8 =', answer: '112', answerLength: 3 },
      { id: 'g3_135_6', type: 'input', question: '25×4 =', answer: '100', answerLength: 3 },
      { id: 'g3_135_7', type: 'input', question: '11×16 =', answer: '176', answerLength: 3 },
      { id: 'g3_135_8', type: 'input', question: '156+44 =', answer: '200', answerLength: 3 },
      { id: 'g3_135_9', type: 'input', question: '13×5 =', answer: '65', answerLength: 2 },
      { id: 'g3_135_10', type: 'input', question: '19×3 =', answer: '57', answerLength: 2 },
    ]
  };

  // 第136关
  levels[136] = {
    title: '第 136 关',
    questions: [
      { id: 'g3_136_1', type: 'input', question: '300−112 =', answer: '188', answerLength: 3 },
      { id: 'g3_136_2', type: 'input', question: '420÷7 =', answer: '60', answerLength: 2 },
      { id: 'g3_136_3', type: 'input', question: '280÷4 =', answer: '70', answerLength: 2 },
      { id: 'g3_136_4', type: 'input', question: '900−550 =', answer: '350', answerLength: 3 },
      { id: 'g3_136_5', type: 'input', question: '630÷9 =', answer: '70', answerLength: 2 },
      { id: 'g3_136_6', type: 'input', question: '84÷4 =', answer: '21', answerLength: 2 },
      { id: 'g3_136_7', type: 'input', question: '15×9 =', answer: '135', answerLength: 3 },
      { id: 'g3_136_8', type: 'input', question: '18×4 =', answer: '72', answerLength: 2 },
      { id: 'g3_136_9', type: 'input', question: '14×9 =', answer: '126', answerLength: 3 },
      { id: 'g3_136_10', type: 'input', question: '67+133 =', answer: '200', answerLength: 3 },
    ]
  };

  // 第137关
  levels[137] = {
    title: '第 137 关',
    questions: [
      { id: 'g3_137_1', type: 'input', question: '24×4 =', answer: '96', answerLength: 2 },
      { id: 'g3_137_2', type: 'input', question: '12×7 =', answer: '84', answerLength: 2 },
      { id: 'g3_137_3', type: 'input', question: '180−67 =', answer: '113', answerLength: 3 },
      { id: 'g3_137_4', type: 'input', question: '810÷9 =', answer: '90', answerLength: 2 },
      { id: 'g3_137_5', type: 'input', question: '350÷7 =', answer: '50', answerLength: 2 },
      { id: 'g3_137_6', type: 'input', question: '1000−280 =', answer: '720', answerLength: 3 },
      { id: 'g3_137_7', type: 'input', question: '210÷7 =', answer: '30', answerLength: 2 },
      { id: 'g3_137_8', type: 'input', question: '52÷4 =', answer: '13', answerLength: 2 },
      { id: 'g3_137_9', type: 'input', question: '16×2 =', answer: '32', answerLength: 2 },
      { id: 'g3_137_10', type: 'input', question: '25×8 =', answer: '200', answerLength: 3 },
    ]
  };

  // 第138关
  levels[138] = {
    title: '第 138 关',
    questions: [
      { id: 'g3_138_1', type: 'input', question: '17×3 =', answer: '51', answerLength: 2 },
      { id: 'g3_138_2', type: 'input', question: '245+55 =', answer: '300', answerLength: 3 },
      { id: 'g3_138_3', type: 'input', question: '11×19 =', answer: '209', answerLength: 3 },
      { id: 'g3_138_4', type: 'input', question: '13×6 =', answer: '78', answerLength: 2 },
      { id: 'g3_138_5', type: 'input', question: '320−150 =', answer: '170', answerLength: 3 },
      { id: 'g3_138_6', type: 'input', question: '240÷3 =', answer: '80', answerLength: 2 },
      { id: 'g3_138_7', type: 'input', question: '120÷5 =', answer: '24', answerLength: 2 },
      { id: 'g3_138_8', type: 'input', question: '400−165 =', answer: '235', answerLength: 3 },
      { id: 'g3_138_9', type: 'input', question: '560÷8 =', answer: '70', answerLength: 2 },
      { id: 'g3_138_10', type: 'input', question: '90÷6 =', answer: '15', answerLength: 2 },
    ]
  };

  // 第139关
  levels[139] = {
    title: '第 139 关',
    questions: [
      { id: 'g3_139_1', type: 'input', question: '15×5 =', answer: '75', answerLength: 2 },
      { id: 'g3_139_2', type: 'input', question: '14×11 =', answer: '154', answerLength: 3 },
      { id: 'g3_139_3', type: 'input', question: '18×6 =', answer: '108', answerLength: 3 },
      { id: 'g3_139_4', type: 'input', question: '128+72 =', answer: '200', answerLength: 3 },
      { id: 'g3_139_5', type: 'input', question: '26×2 =', answer: '52', answerLength: 2 },
      { id: 'g3_139_6', type: 'input', question: '14×5 =', answer: '70', answerLength: 2 },
      { id: 'g3_139_7', type: 'input', question: '210−49 =', answer: '161', answerLength: 3 },
      { id: 'g3_139_8', type: 'input', question: '450÷5 =', answer: '90', answerLength: 2 },
      { id: 'g3_139_9', type: 'input', question: '480÷4 =', answer: '120', answerLength: 3 },
      { id: 'g3_139_10', type: 'input', question: '600−425 =', answer: '175', answerLength: 3 },
    ]
  };

  // 第140关
  levels[140] = {
    title: '第 140 关',
    questions: [
      { id: 'g3_140_1', type: 'input', question: '360÷3 =', answer: '120', answerLength: 3 },
      { id: 'g3_140_2', type: 'input', question: '76÷4 =', answer: '19', answerLength: 2 },
      { id: 'g3_140_3', type: 'input', question: '12×13 =', answer: '156', answerLength: 3 },
      { id: 'g3_140_4', type: 'input', question: '19×5 =', answer: '95', answerLength: 2 },
      { id: 'g3_140_5', type: 'input', question: '11×17 =', answer: '187', answerLength: 3 },
      { id: 'g3_140_6', type: 'input', question: '88+212 =', answer: '300', answerLength: 3 },
      { id: 'g3_140_7', type: 'input', question: '13×4 =', answer: '52', answerLength: 2 },
      { id: 'g3_140_8', type: 'input', question: '15×3 =', answer: '45', answerLength: 2 },
      { id: 'g3_140_9', type: 'input', question: '400−285 =', answer: '115', answerLength: 3 },
      { id: 'g3_140_10', type: 'input', question: '720÷9 =', answer: '80', answerLength: 2 },
    ]
  };

  // 第141关
  levels[141] = {
    title: '第 141 关',
    questions: [
      { id: 'g3_141_1', type: 'input', question: '300÷2 =', answer: '150', answerLength: 3 },
      { id: 'g3_141_2', type: 'input', question: '800−370 =', answer: '430', answerLength: 3 },
      { id: 'g3_141_3', type: 'input', question: '540÷6 =', answer: '90', answerLength: 2 },
      { id: 'g3_141_4', type: 'input', question: '92÷2 =', answer: '46', answerLength: 2 },
      { id: 'g3_141_5', type: 'input', question: '25×4 =', answer: '100', answerLength: 3 },
      { id: 'g3_141_6', type: 'input', question: '125×8 =', answer: '1000', answerLength: 4 },
      { id: 'g3_141_7', type: 'input', question: '12×5 =', answer: '60', answerLength: 2 },
      { id: 'g3_141_8', type: 'input', question: '15×6 =', answer: '90', answerLength: 2 },
      { id: 'g3_141_9', type: 'input', question: '24×5 =', answer: '120', answerLength: 3 },
      { id: 'g3_141_10', type: 'input', question: '30×40 =', answer: '1200', answerLength: 4 },
    ]
  };

  // 第142关
  levels[142] = {
    title: '第 142 关',
    questions: [
      { id: 'g3_142_1', type: 'input', question: '420÷6 =', answer: '70', answerLength: 2 },
      { id: 'g3_142_2', type: 'input', question: '630÷9 =', answer: '70', answerLength: 2 },
      { id: 'g3_142_3', type: 'input', question: '150×2 =', answer: '300', answerLength: 3 },
      { id: 'g3_142_4', type: 'input', question: '18×4 =', answer: '72', answerLength: 2 },
      { id: 'g3_142_5', type: 'input', question: '125×4 =', answer: '500', answerLength: 3 },
      { id: 'g3_142_6', type: 'input', question: '25×8 =', answer: '200', answerLength: 3 },
      { id: 'g3_142_7', type: 'input', question: '125×(8+4) =', answer: '1500', answerLength: 4 },
      { id: 'g3_142_8', type: 'input', question: '36×72+36×28 =', answer: '3600', answerLength: 4 },
      { id: 'g3_142_9', type: 'input', question: '17×25+17×45+17×3 =', answer: '1241', answerLength: 4 },
      { id: 'g3_142_10', type: 'input', question: '26×15+13×70 =', answer: '1300', answerLength: 4 },
    ]
  };

  // 第143关
  levels[143] = {
    title: '第 143 关',
    questions: [
      { id: 'g3_143_1', type: 'input', question: '48×37 =', answer: '1776', answerLength: 4 },
      { id: 'g3_143_2', type: 'input', question: '825÷3 =', answer: '275', answerLength: 3 },
      { id: 'g3_143_3', type: 'input', question: '数串3,7,11,15...的第20项是多少？ =', answer: '79', answerLength: 2 },
      { id: 'g3_143_4', type: 'input', question: '数串5,10,15...105共有多少项？ =', answer: '21', answerLength: 2 },
      { id: 'g3_143_5', type: 'input', question: '25×5 =', answer: '125', answerLength: 3 },
      { id: 'g3_143_6', type: 'input', question: '125×8 =', answer: '1000', answerLength: 4 },
      { id: 'g3_143_7', type: 'input', question: '15×6 =', answer: '90', answerLength: 2 },
      { id: 'g3_143_8', type: 'input', question: '240÷6 =', answer: '40', answerLength: 2 },
      { id: 'g3_143_9', type: 'input', question: '11×50 =', answer: '550', answerLength: 3 },
      { id: 'g3_143_10', type: 'input', question: '80×90 =', answer: '7200', answerLength: 4 },
    ]
  };

  // 第144关
  levels[144] = {
    title: '第 144 关',
    questions: [
      { id: 'g3_144_1', type: 'input', question: '450÷5 =', answer: '90', answerLength: 2 },
      { id: 'g3_144_2', type: 'input', question: '13×4 =', answer: '52', answerLength: 2 },
      { id: 'g3_144_3', type: 'input', question: '32+68×0 =', answer: '32', answerLength: 2 },
      { id: 'g3_144_4', type: 'input', question: '35×2 =', answer: '70', answerLength: 2 },
      { id: 'g3_144_5', type: 'input', question: '1000÷8 =', answer: '125', answerLength: 3 },
      { id: 'g3_144_6', type: 'input', question: '12×5 =', answer: '60', answerLength: 2 },
      { id: 'g3_144_7', type: 'input', question: '25×(4+8) =', answer: '300', answerLength: 3 },
      { id: 'g3_144_8', type: 'input', question: '36×75+36×25 =', answer: '3600', answerLength: 4 },
      { id: 'g3_144_9', type: 'input', question: '12×15+12×35+12×50 =', answer: '1200', answerLength: 4 },
      { id: 'g3_144_10', type: 'input', question: '24×15+12×70 =', answer: '1200', answerLength: 4 },
    ]
  };

  // 第145关
  levels[145] = {
    title: '第 145 关',
    questions: [
      { id: 'g3_145_1', type: 'input', question: '43×26 =', answer: '1118', answerLength: 4 },
      { id: 'g3_145_2', type: 'input', question: '848÷4 =', answer: '212', answerLength: 3 },
      { id: 'g3_145_3', type: 'input', question: '数串1,4,7,10...第15个数是几？ =', answer: '43', answerLength: 2 },
      { id: 'g3_145_4', type: 'input', question: '数串2,4,6,8...40共有多少个数？ =', answer: '20', answerLength: 2 },
      { id: 'g3_145_5', type: 'input', question: '25×2 =', answer: '50', answerLength: 2 },
      { id: 'g3_145_6', type: 'input', question: '125×16 =', answer: '2000', answerLength: 4 },
      { id: 'g3_145_7', type: 'input', question: '50×4 =', answer: '200', answerLength: 3 },
      { id: 'g3_145_8', type: 'input', question: '250×8 =', answer: '2000', answerLength: 4 },
      { id: 'g3_145_9', type: 'input', question: '13×5 =', answer: '65', answerLength: 2 },
      { id: 'g3_145_10', type: 'input', question: '360÷9 =', answer: '40', answerLength: 2 },
    ]
  };

  // 第146关
  levels[146] = {
    title: '第 146 关',
    questions: [
      { id: 'g3_146_1', type: 'input', question: '22×3 =', answer: '66', answerLength: 2 },
      { id: 'g3_146_2', type: 'input', question: '70×6 =', answer: '420', answerLength: 3 },
      { id: 'g3_146_3', type: 'input', question: '150×2 =', answer: '300', answerLength: 3 },
      { id: 'g3_146_4', type: 'input', question: '640÷8 =', answer: '80', answerLength: 2 },
      { id: 'g3_146_5', type: 'input', question: '18×3 =', answer: '54', answerLength: 2 },
      { id: 'g3_146_6', type: 'input', question: '40×15 =', answer: '600', answerLength: 3 },
      { id: 'g3_146_7', type: 'input', question: '125×(8+6) =', answer: '1750', answerLength: 4 },
      { id: 'g3_146_8', type: 'input', question: '58×64+58×36 =', answer: '5800', answerLength: 4 },
      { id: 'g3_146_9', type: 'input', question: '27×18+27×32+27×50 =', answer: '2700', answerLength: 4 },
      { id: 'g3_146_10', type: 'input', question: '36×14+18×72 =', answer: '1800', answerLength: 4 },
    ]
  };

  // 第147关
  levels[147] = {
    title: '第 147 关',
    questions: [
      { id: 'g3_147_1', type: 'input', question: '57×32 =', answer: '1824', answerLength: 4 },
      { id: 'g3_147_2', type: 'input', question: '735÷3 =', answer: '245', answerLength: 3 },
      { id: 'g3_147_3', type: 'input', question: '数串3,8,13,18...第12个数是几？ =', answer: '58', answerLength: 2 },
      { id: 'g3_147_4', type: 'input', question: '500÷4 =', answer: '125', answerLength: 3 },
      { id: 'g3_147_5', type: 'input', question: '25×16 =', answer: '400', answerLength: 3 },
      { id: 'g3_147_6', type: 'input', question: '125×24 =', answer: '3000', answerLength: 4 },
      { id: 'g3_147_7', type: 'input', question: '16×5 =', answer: '80', answerLength: 2 },
      { id: 'g3_147_8', type: 'input', question: '280÷7 =', answer: '40', answerLength: 2 },
      { id: 'g3_147_9', type: 'input', question: '33×3 =', answer: '99', answerLength: 2 },
      { id: 'g3_147_10', type: 'input', question: '90×4 =', answer: '360', answerLength: 3 },
    ]
  };

  // 第148关
  levels[148] = {
    title: '第 148 关',
    questions: [
      { id: 'g3_148_1', type: 'input', question: '250×4 =', answer: '1000', answerLength: 4 },
      { id: 'g3_148_2', type: 'input', question: '480÷6 =', answer: '80', answerLength: 2 },
      { id: 'g3_148_3', type: 'input', question: '12×8 =', answer: '96', answerLength: 2 },
      { id: 'g3_148_4', type: 'input', question: '60×11 =', answer: '660', answerLength: 3 },
      { id: 'g3_148_5', type: 'input', question: '800÷5 =', answer: '160', answerLength: 3 },
      { id: 'g3_148_6', type: 'input', question: '25×(40+4) =', answer: '1100', answerLength: 4 },
      { id: 'g3_148_7', type: 'input', question: '47×123−47×23 =', answer: '4700', answerLength: 4 },
      { id: 'g3_148_8', type: 'input', question: '15×14+15×26+15×60 =', answer: '1500', answerLength: 4 },
      { id: 'g3_148_9', type: 'input', question: '46×12+23×76 =', answer: '2300', answerLength: 4 },
      { id: 'g3_148_10', type: 'input', question: '28×49 =', answer: '1372', answerLength: 4 },
    ]
  };

  // 第149关
  levels[149] = {
    title: '第 149 关',
    questions: [
      { id: 'g3_149_1', type: 'input', question: '912÷6 =', answer: '152', answerLength: 3 },
      { id: 'g3_149_2', type: 'input', question: '数串5,10,15,20...105共有几项？ =', answer: '21', answerLength: 2 },
      { id: 'g3_149_3', type: 'input', question: '24×2 =', answer: '48', answerLength: 2 },
      { id: 'g3_149_4', type: 'input', question: '50×2 =', answer: '100', answerLength: 3 },
      { id: 'g3_149_5', type: 'input', question: '40×25 =', answer: '1000', answerLength: 4 },
      { id: 'g3_149_6', type: 'input', question: '80×125 =', answer: '10000', answerLength: 5 },
      { id: 'g3_149_7', type: 'input', question: '25×40 =', answer: '1000', answerLength: 4 },
      { id: 'g3_149_8', type: 'input', question: '15×4 =', answer: '60', answerLength: 2 },
      { id: 'g3_149_9', type: 'input', question: '810÷9 =', answer: '90', answerLength: 2 },
      { id: 'g3_149_10', type: 'input', question: '11×8 =', answer: '88', answerLength: 2 },
    ]
  };

  // 第150关
  levels[150] = {
    title: '第 150 关',
    questions: [
      { id: 'g3_150_1', type: 'input', question: '60×7 =', answer: '420', answerLength: 3 },
      { id: 'g3_150_2', type: 'input', question: '450×2 =', answer: '900', answerLength: 3 },
      { id: 'g3_150_3', type: 'input', question: '560÷7 =', answer: '80', answerLength: 2 },
      { id: 'g3_150_4', type: 'input', question: '13×3 =', answer: '39', answerLength: 2 },
      { id: 'g3_150_5', type: 'input', question: '125×(80+8) =', answer: '11000', answerLength: 5 },
      { id: 'g3_150_6', type: 'input', question: '82×45+82×55 =', answer: '8200', answerLength: 4 },
      { id: 'g3_150_7', type: 'input', question: '34×25+34×45+34×30 =', answer: '3400', answerLength: 4 },
      { id: 'g3_150_8', type: 'input', question: '28×15+14×70 =', answer: '1400', answerLength: 4 },
      { id: 'g3_150_9', type: 'input', question: '36×54 =', answer: '1944', answerLength: 4 },
      { id: 'g3_150_10', type: 'input', question: '625÷5 =', answer: '125', answerLength: 3 },
    ]
  };

  // 第151关
  levels[151] = {
    title: '第 151 关',
    questions: [
      { id: 'g3_151_1', type: 'input', question: '数串10,13,16,19...第20个数是几？ =', answer: '67', answerLength: 2 },
      { id: 'g3_151_2', type: 'input', question: '30×13 =', answer: '390', answerLength: 3 },
      { id: 'g3_151_3', type: 'input', question: '100÷4 =', answer: '25', answerLength: 2 },
      { id: 'g3_151_4', type: 'input', question: '14×5 =', answer: '70', answerLength: 2 },
      { id: 'g3_151_5', type: 'input', question: '250×4 =', answer: '1000', answerLength: 4 },
      { id: 'g3_151_6', type: 'input', question: '810÷9 =', answer: '90', answerLength: 2 },
      { id: 'g3_151_7', type: 'input', question: '13×3 =', answer: '39', answerLength: 2 },
      { id: 'g3_151_8', type: 'input', question: '1000÷8 =', answer: '125', answerLength: 3 },
      { id: 'g3_151_9', type: 'input', question: '40×25 =', answer: '1000', answerLength: 4 },
      { id: 'g3_151_10', type: 'input', question: '60×11 =', answer: '660', answerLength: 3 },
    ]
  };

  // 第152关
  levels[152] = {
    title: '第 152 关',
    questions: [
      { id: 'g3_152_1', type: 'input', question: '75×2 =', answer: '150', answerLength: 3 },
      { id: 'g3_152_2', type: 'input', question: '420÷7 =', answer: '60', answerLength: 2 },
      { id: 'g3_152_3', type: 'input', question: '125×3 =', answer: '375', answerLength: 3 },
      { id: 'g3_152_4', type: 'input', question: '25×(4+12) =', answer: '400', answerLength: 3 },
      { id: 'g3_152_5', type: 'input', question: '19×72+19×28 =', answer: '1900', answerLength: 4 },
      { id: 'g3_152_6', type: 'input', question: '41×16+41×24+41×60 =', answer: '4100', answerLength: 4 },
      { id: 'g3_152_7', type: 'input', question: '52×14+26×72 =', answer: '2600', answerLength: 4 },
      { id: 'g3_152_8', type: 'input', question: '78×21 =', answer: '1638', answerLength: 4 },
      { id: 'g3_152_9', type: 'input', question: '544÷8 =', answer: '68', answerLength: 2 },
      { id: 'g3_152_10', type: 'input', question: '58×4 =', answer: '232', answerLength: 3 },
    ]
  };

  // 第153关
  levels[153] = {
    title: '第 153 关',
    questions: [
      { id: 'g3_153_1', type: 'input', question: '86×3 =', answer: '258', answerLength: 3 },
      { id: 'g3_153_2', type: 'input', question: '74×3 =', answer: '222', answerLength: 3 },
      { id: 'g3_153_3', type: 'input', question: '99×9 =', answer: '891', answerLength: 3 },
      { id: 'g3_153_4', type: 'input', question: '80×7 =', answer: '560', answerLength: 3 },
      { id: 'g3_153_5', type: 'input', question: '75×2 =', answer: '150', answerLength: 3 },
      { id: 'g3_153_6', type: 'input', question: '54×8 =', answer: '432', answerLength: 3 },
      { id: 'g3_153_7', type: 'input', question: '11×7 =', answer: '77', answerLength: 2 },
      { id: 'g3_153_8', type: 'input', question: '23×7 =', answer: '161', answerLength: 3 },
      { id: 'g3_153_9', type: 'input', question: '18×7 =', answer: '126', answerLength: 3 },
      { id: 'g3_153_10', type: 'input', question: '69×4 =', answer: '276', answerLength: 3 },
    ]
  };

  // 第154关
  levels[154] = {
    title: '第 154 关',
    questions: [
      { id: 'g3_154_1', type: 'input', question: '74×3 =', answer: '222', answerLength: 3 },
      { id: 'g3_154_2', type: 'input', question: '26×6 =', answer: '156', answerLength: 3 },
      { id: 'g3_154_3', type: 'input', question: '37×7 =', answer: '259', answerLength: 3 },
      { id: 'g3_154_4', type: 'input', question: '38×3 =', answer: '114', answerLength: 3 },
      { id: 'g3_154_5', type: 'input', question: '35×5 =', answer: '175', answerLength: 3 },
      { id: 'g3_154_6', type: 'input', question: '27×3 =', answer: '81', answerLength: 2 },
      { id: 'g3_154_7', type: 'input', question: '65×6 =', answer: '390', answerLength: 3 },
      { id: 'g3_154_8', type: 'input', question: '11×2 =', answer: '22', answerLength: 2 },
      { id: 'g3_154_9', type: 'input', question: '94×3 =', answer: '282', answerLength: 3 },
      { id: 'g3_154_10', type: 'input', question: '14×8 =', answer: '112', answerLength: 3 },
    ]
  };

  // 第155关
  levels[155] = {
    title: '第 155 关',
    questions: [
      { id: 'g3_155_1', type: 'input', question: '13×3 =', answer: '39', answerLength: 2 },
      { id: 'g3_155_2', type: 'input', question: '20×7 =', answer: '140', answerLength: 3 },
      { id: 'g3_155_3', type: 'input', question: '20×9 =', answer: '180', answerLength: 3 },
      { id: 'g3_155_4', type: 'input', question: '79×3 =', answer: '237', answerLength: 3 },
      { id: 'g3_155_5', type: 'input', question: '26×4 =', answer: '104', answerLength: 3 },
      { id: 'g3_155_6', type: 'input', question: '60×9 =', answer: '540', answerLength: 3 },
      { id: 'g3_155_7', type: 'input', question: '29×3 =', answer: '87', answerLength: 2 },
      { id: 'g3_155_8', type: 'input', question: '60×3 =', answer: '180', answerLength: 3 },
      { id: 'g3_155_9', type: 'input', question: '12×8 =', answer: '96', answerLength: 2 },
      { id: 'g3_155_10', type: 'input', question: '41×9 =', answer: '369', answerLength: 3 },
    ]
  };

  // 第156关
  levels[156] = {
    title: '第 156 关',
    questions: [
      { id: 'g3_156_1', type: 'input', question: '70×9 =', answer: '630', answerLength: 3 },
      { id: 'g3_156_2', type: 'input', question: '62×2 =', answer: '124', answerLength: 3 },
      { id: 'g3_156_3', type: 'input', question: '24×2 =', answer: '48', answerLength: 2 },
      { id: 'g3_156_4', type: 'input', question: '81×6 =', answer: '486', answerLength: 3 },
      { id: 'g3_156_5', type: 'input', question: '87×5 =', answer: '435', answerLength: 3 },
      { id: 'g3_156_6', type: 'input', question: '52×8 =', answer: '416', answerLength: 3 },
      { id: 'g3_156_7', type: 'input', question: '74×5 =', answer: '370', answerLength: 3 },
      { id: 'g3_156_8', type: 'input', question: '77×9 =', answer: '693', answerLength: 3 },
      { id: 'g3_156_9', type: 'input', question: '48×8 =', answer: '384', answerLength: 3 },
      { id: 'g3_156_10', type: 'input', question: '25×5 =', answer: '125', answerLength: 3 },
    ]
  };

  // 第157关
  levels[157] = {
    title: '第 157 关',
    questions: [
      { id: 'g3_157_1', type: 'input', question: '98×9 =', answer: '882', answerLength: 3 },
      { id: 'g3_157_2', type: 'input', question: '56×5 =', answer: '280', answerLength: 3 },
      { id: 'g3_157_3', type: 'input', question: '58×4 =', answer: '232', answerLength: 3 },
      { id: 'g3_157_4', type: 'input', question: '11×7 =', answer: '77', answerLength: 2 },
      { id: 'g3_157_5', type: 'input', question: '20×2 =', answer: '40', answerLength: 2 },
      { id: 'g3_157_6', type: 'input', question: '78×9 =', answer: '702', answerLength: 3 },
      { id: 'g3_157_7', type: 'input', question: '94×2 =', answer: '188', answerLength: 3 },
      { id: 'g3_157_8', type: 'input', question: '95×7 =', answer: '665', answerLength: 3 },
      { id: 'g3_157_9', type: 'input', question: '89×9 =', answer: '801', answerLength: 3 },
      { id: 'g3_157_10', type: 'input', question: '15×9 =', answer: '135', answerLength: 3 },
    ]
  };

  // 第158关
  levels[158] = {
    title: '第 158 关',
    questions: [
      { id: 'g3_158_1', type: 'input', question: '95×6 =', answer: '570', answerLength: 3 },
      { id: 'g3_158_2', type: 'input', question: '19×5 =', answer: '95', answerLength: 2 },
      { id: 'g3_158_3', type: 'input', question: '48×6 =', answer: '288', answerLength: 3 },
      { id: 'g3_158_4', type: 'input', question: '57×9 =', answer: '513', answerLength: 3 },
      { id: 'g3_158_5', type: 'input', question: '31×4 =', answer: '124', answerLength: 3 },
      { id: 'g3_158_6', type: 'input', question: '23×6 =', answer: '138', answerLength: 3 },
      { id: 'g3_158_7', type: 'input', question: '74×5 =', answer: '370', answerLength: 3 },
      { id: 'g3_158_8', type: 'input', question: '65×7 =', answer: '455', answerLength: 3 },
      { id: 'g3_158_9', type: 'input', question: '98×5 =', answer: '490', answerLength: 3 },
      { id: 'g3_158_10', type: 'input', question: '79×2 =', answer: '158', answerLength: 3 },
    ]
  };

  // 第159关
  levels[159] = {
    title: '第 159 关',
    questions: [
      { id: 'g3_159_1', type: 'input', question: '15×5 =', answer: '75', answerLength: 2 },
      { id: 'g3_159_2', type: 'input', question: '22×7 =', answer: '154', answerLength: 3 },
      { id: 'g3_159_3', type: 'input', question: '45×3 =', answer: '135', answerLength: 3 },
      { id: 'g3_159_4', type: 'input', question: '11×3 =', answer: '33', answerLength: 2 },
      { id: 'g3_159_5', type: 'input', question: '11×6 =', answer: '66', answerLength: 2 },
      { id: 'g3_159_6', type: 'input', question: '89×3 =', answer: '267', answerLength: 3 },
      { id: 'g3_159_7', type: 'input', question: '91×6 =', answer: '546', answerLength: 3 },
      { id: 'g3_159_8', type: 'input', question: '63×2 =', answer: '126', answerLength: 3 },
      { id: 'g3_159_9', type: 'input', question: '76×5 =', answer: '380', answerLength: 3 },
      { id: 'g3_159_10', type: 'input', question: '68×8 =', answer: '544', answerLength: 3 },
    ]
  };

  return levels;
}

// ============================================
// 导出所有数据
// ============================================

export const allLevelsData = {
  k: generateKindergartenLevels(),
  '1': generateGrade1Levels(),
  '2': generateGrade2Levels(),
  '3': generateGrade3Levels()
};

// 兼容旧接口 - 使用一年级第1关
export const levelsData: Record<number, LevelData> = {
  1: demoLevel,
  2: allLevelsData['1'][1],
  3: allLevelsData['1'][2],
  4: allLevelsData['1'][3],
  5: allLevelsData['1'][4],
  6: allLevelsData['1'][5],
  7: allLevelsData['1'][6]
};
