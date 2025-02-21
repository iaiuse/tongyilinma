import './style.css'
import { GameState } from './types'
import { gameConfig, riddles } from './data'

class RiddleGame {
  private gameState: GameState = {
    currentLevel: 1,
    score: 0,
    maxLevel: 10,
    hintsUsed: 0,
    timeLeft: 60,
    combo: 0,
    energy: 100,
    lastAnswerTime: Date.now()
  }

  private elements = {
    door: null as HTMLElement | null,
    riddleText: null as HTMLElement | null,
    answerInput: null as HTMLInputElement | null,
    submitButton: null as HTMLElement | null,
    feedback: null as HTMLElement | null,
    level: null as HTMLElement | null,
    score: null as HTMLElement | null,
  }

  constructor() {
    this.initializeDOM()
    this.initGame()
  }

  private initializeDOM() {
    const app = document.querySelector<HTMLDivElement>('#app')
    if (app) {
      app.innerHTML = `
        <div class="game-container">
          <div class="game-header">
            <h1>谜语之旅 | Riddle Quest</h1>
          </div>
          <div class="scene-container">
            <div class="castle-bg"></div>
            <div class="torch torch-left">
              <div class="torch-flame"></div>
              <div class="torch-stick"></div>
            </div>
            <div class="torch torch-right">
              <div class="torch-flame"></div>
              <div class="torch-stick"></div>
            </div>
            <div class="game-status">
              <div class="level-indicator">关卡: <span id="level">1</span></div>
              <div class="score-indicator">分数: <span id="score">0</span></div>
            </div>
            <div class="castle-door" id="door">
              <div class="door-handle"></div>
            </div>
            <div class="riddle-container">
              <div class="riddle-text" id="riddle-text">
                正在加载谜题...
              </div>
              <div class="input-container">
                <input type="text" id="answer-input" placeholder="输入你的答案">
                <button id="submit-btn">提交</button>
              </div>
              <div class="feedback" id="feedback"></div>
            </div>
          </div>
        </div>
      `
    }

    this.elements = {
      door: document.getElementById('door'),
      riddleText: document.getElementById('riddle-text'),
      answerInput: document.getElementById('answer-input') as HTMLInputElement,
      submitButton: document.getElementById('submit-btn'),
      feedback: document.getElementById('feedback'),
      level: document.getElementById('level'),
      score: document.getElementById('score')
    }
  }

  private updateUI(): void {
    if (this.elements.level) {
      this.elements.level.textContent = this.gameState.currentLevel.toString()
    }
    if (this.elements.score) {
      this.elements.score.textContent = this.gameState.score.toString()
    }
  }

  private loadRiddle(level: number): void {
    const index = level - 1
    if (index < riddles.length) {
      if (this.elements.riddleText) {
        this.elements.riddleText.textContent = riddles[index].question
      }
      if (this.elements.answerInput) {
        this.elements.answerInput.value = ''
      }
      if (this.elements.feedback) {
        this.elements.feedback.style.display = 'none'
      }
      
      if (this.elements.door?.classList.contains('door-opened')) {
        this.elements.door.classList.remove('door-opened')
      }
    } else {
      this.gameCompleted()
    }
  }

  private checkAnswer(): void {
    const userAnswer = this.elements.answerInput?.value.trim().toLowerCase() || ''
    const index = this.gameState.currentLevel - 1
    const currentTime = Date.now()
    
    if (index < riddles.length) {
      const correctAnswers = riddles[index].answer.map(a => a.toLowerCase())
      
      if (userAnswer === '') {
        this.showFeedback('请输入你的答案！', false)
        return
      }
      
      if (correctAnswers.includes(userAnswer)) {
        this.handleCorrectAnswer(currentTime)
      } else {
        this.handleWrongAnswer(index)
      }
    }
  }

  private handleCorrectAnswer(currentTime: number): void {
    const timeTaken = Math.max(0, (currentTime - this.gameState.lastAnswerTime) / 1000)
    const timeBonus = Math.max(0, Math.floor((gameConfig.baseTimePerQuestion - timeTaken) / 2))
    
    this.gameState.combo = Math.min(this.gameState.combo + 1, gameConfig.maxCombo)
    const comboBonus = this.gameState.combo * gameConfig.comboBonus
    
    this.gameState.score += 10 + timeBonus + comboBonus
    this.gameState.energy = Math.min(100, this.gameState.energy + 10)
    
    this.showFeedback(`回答正确！获得基础分10分 + 时间奖励${timeBonus}分 + 连击奖励${comboBonus}分！`, true)
    this.elements.door?.classList.add('door-opened')
    
    setTimeout(() => {
      this.gameState.currentLevel++
      this.updateUI()
      if (this.gameState.currentLevel <= riddles.length) {
        this.loadRiddle(this.gameState.currentLevel)
      } else {
        this.gameCompleted()
      }
    }, 2000)
  }

  private handleWrongAnswer(index: number): void {
    this.gameState.combo = 0
    this.gameState.energy = Math.max(0, this.gameState.energy - 5)
    this.showFeedback(`答案不对，请继续思考。提示：${riddles[index].hint}`, false)
    this.gameState.score = Math.max(0, this.gameState.score - 2)
    this.updateUI()
  }

  private showFeedback(message: string, isSuccess: boolean): void {
    if (this.elements.feedback) {
      this.elements.feedback.textContent = message
      this.elements.feedback.className = 'feedback ' + (isSuccess ? 'success' : 'error')
      this.elements.feedback.style.display = 'block'
    }
  }

  private gameCompleted(): void {
    if (this.elements.riddleText) {
      this.elements.riddleText.textContent = 
        `恭喜！你已经完成了所有${this.gameState.maxLevel}关的谜题！你的最终得分是: ${this.gameState.score}分！`
    }
    if (this.elements.answerInput) {
      this.elements.answerInput.style.display = 'none'
    }
    if (this.elements.submitButton) {
      this.elements.submitButton.style.display = 'none'
    }
    this.elements.door?.classList.add('door-opened')
  }

  private initGame(): void {
    this.updateUI()
    this.loadRiddle(this.gameState.currentLevel)
    
    this.elements.submitButton?.addEventListener('click', () => this.checkAnswer())
    this.elements.answerInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.checkAnswer()
      }
    })
  }
}

// 启动游戏
new RiddleGame() 