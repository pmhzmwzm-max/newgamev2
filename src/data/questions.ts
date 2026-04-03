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
// 三年级 50关
// ============================================

function generateGrade3Levels(): Record<number, LevelData> {
  const levels: Record<number, LevelData> = {};

  // 第1-10关：万以内加减
  for (let level = 1; level <= 10; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const isAdd = ((level - 1) * 10 + q) % 2 === 0;

      if (isAdd) {
        const a = ((level - 1) * 10 + q) * 127 % 500 + 200;
        const b = ((level - 1) * 10 + q) * 89 % 300 + 100;
        const sum = a + b;
        questions.push({
          id: generateId('g3', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '+',
          answer: sum.toString(),
          answerLength: sum >= 1000 ? 4 : 3
        });
      } else {
        const a = ((level - 1) * 10 + q) * 97 % 500 + 500;
        const b = ((level - 1) * 10 + q) * 53 % 300 + 100;
        const diff = a - b;
        questions.push({
          id: generateId('g3', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '-',
          answer: diff.toString(),
          answerLength: diff >= 100 ? 3 : diff >= 10 ? 2 : 1
        });
      }
    }
    levels[level] = { title: `万以内加减 ${level}`, questions };
  }

  // 第11-18关：单位换算
  for (let level = 11; level <= 18; level++) {
    const questions: Question[] = [];
    const unitConversions = [
      { question: '厘米', factor: 10, suffix: '毫米' },
      { question: '米', factor: 100, suffix: '厘米' },
      { question: '千米', factor: 1000, suffix: '米' },
      { question: '吨', factor: 1000, suffix: '千克' },
      { question: '千克', factor: 1000, suffix: '克' },
    ];

    for (let q = 1; q <= 10; q++) {
      const conv = unitConversions[((level - 11) * 10 + q) % unitConversions.length];
      const value = ((level - 11) * 10 + q) % 9 + 1;
      const result = value * conv.factor;

      questions.push({
        id: generateId('g3', level, q),
        type: 'input',
        question: `${value}${conv.question} = `,
        answer: result.toString(),
        answerLength: result.toString().length
      });
    }
    levels[level] = { title: `单位换算 ${level - 10}`, questions };
  }

  // 第19-24关：倍的认识
  for (let level = 19; level <= 24; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const base = ((level - 19) * 10 + q) % 9 + 1;
      const multiple = ((level - 19) * 10 + q) % 5 + 2;
      const result = base * multiple;

      questions.push({
        id: generateId('g3', level, q),
        type: 'input',
        question: `${base}的${multiple}倍 =`,
        answer: result.toString(),
        answerLength: result >= 10 ? 2 : 1
      });
    }
    levels[level] = { title: `倍的认识 ${level - 18}`, questions };
  }

  // 第25-32关：多位乘一位
  for (let level = 25; level <= 32; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const a = ((level - 25) * 10 + q) * 37 % 900 + 100;
      const b = ((level - 25) * 10 + q) % 9 + 1;
      const product = a * b;

      questions.push({
        id: generateId('g3', level, q),
        type: 'input',
        question: `${a} × ${b} =`,
        answer: product.toString(),
        answerLength: product.toString().length
      });
    }
    levels[level] = { title: `多位乘一位 ${level - 24}`, questions };
  }

  // 第33-40关：除数一位数
  for (let level = 33; level <= 40; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const divisor = ((level - 33) * 10 + q) % 8 + 2;
      const quotient = ((level - 33) * 10 + q) * 17 % 100 + 10;
      const dividend = divisor * quotient;

      questions.push({
        id: generateId('g3', level, q),
        type: 'input',
        question: `${dividend} ÷ ${divisor} =`,
        answer: quotient.toString(),
        answerLength: quotient >= 100 ? 3 : quotient >= 10 ? 2 : 1
      });
    }
    levels[level] = { title: `除数一位数 ${level - 32}`, questions };
  }

  // 第41-50关：综合练习
  for (let level = 41; level <= 50; level++) {
    const questions: Question[] = [];
    for (let q = 1; q <= 10; q++) {
      const type = ((level - 41) * 10 + q) % 4;

      if (type === 0) {
        const a = ((level - 41) * 10 + q) * 43 % 900 + 100;
        const b = ((level - 41) * 10 + q) % 9 + 1;
        const product = a * b;
        questions.push({
          id: generateId('g3', level, q),
          type: 'input',
          question: `${a} × ${b} =`,
          answer: product.toString(),
          answerLength: product.toString().length
        });
      } else if (type === 1) {
        const b = ((level - 41) * 10 + q) % 8 + 2;
        const quotient = ((level - 41) * 10 + q) * 13 % 100 + 10;
        const a = b * quotient;
        questions.push({
          id: generateId('g3', level, q),
          type: 'input',
          question: `${a} ÷ ${b} =`,
          answer: quotient.toString(),
          answerLength: quotient.toString().length
        });
      } else if (type === 2) {
        const a = ((level - 41) * 10 + q) * 67 % 500 + 300;
        const b = ((level - 41) * 10 + q) * 31 % 200 + 100;
        const sum = a + b;
        questions.push({
          id: generateId('g3', level, q),
          type: 'vertical_addition',
          num1: a,
          num2: b,
          operator: '+',
          answer: sum.toString(),
          answerLength: sum.toString().length
        });
      } else {
        const num1 = ((level - 41) * 10 + q) * 47 + 100;
        const num2 = ((level - 41) * 10 + q) * 43 + 150;
        questions.push({
          id: generateId('g3', level, q),
          type: 'number_comparison',
          num1,
          num2,
          answer: num1 > num2 ? '>' : num1 < num2 ? '<' : '=',
          answerLength: 1
        });
      }
    }
    levels[level] = { title: `综合练习 ${level - 40}`, questions };
  }

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