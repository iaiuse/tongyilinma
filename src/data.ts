import { Riddle, GameConfig } from './types'

export const gameConfig: GameConfig = {
  comboBonus: 5,
  timePenalty: 2,
  energyPerHint: 20,
  energyRecoveryRate: 5,
  maxCombo: 5,
  baseTimePerQuestion: 60
}

export const riddles: Riddle[] = [
  { 
    question: "我有眼睛却看不见，有嘴却不能说话，有河却不流水。我是什么？", 
    answer: ["针", "针线", "缝衣针"],
    hint: "我帮助人们修补东西。"
  },
  // ... 其他谜题数据
] 