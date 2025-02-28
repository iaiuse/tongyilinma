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
            <div class="header-links">
              <a href="https://github.com/iaiuse/tongyilinma" target="_blank" class="icon-link">
                <svg height="32" viewBox="0 0 16 16" width="32" class="github-icon">
                  <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
              </a>
              <a href="https://tongyi.aliyun.com/" target="_blank" class="icon-link">
                <img src="/tongyi-logo.svg" alt="通义灵码" class="tongyi-icon" width="32" height="32">
              </a>
            </div>
            <h1>谜语之旅 | Riddle Quest</h1>
            <div class="author">by iaiuse</div>
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