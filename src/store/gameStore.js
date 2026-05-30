/**
 * ます鉄 Game Store (Zustand)
 * Manages the full game loop: init → roll → move → land → event/shop → next turn
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import boardData from '@data/board.json'
import shopsData from '@data/shops.json'
import eventsData from '@data/events.json'
import itemsData from '@data/items.json'

import { rollDice, rollDoubleDice } from '@utils/dice'
import {
  calculateMoneyChange,
  calculateShopBonus,
  applyItemEffect,
  applyEventEffect,
  checkWinCondition,
  getWrappingPath,
} from '@utils/gameRules'

// ── Constants ──────────────────────────────────────────────────────────────

const STARTING_MONEY = 10_000
const MAX_ROUNDS_DEFAULT = 12
const MOVE_DELAY_MS = 300 // ms between each step during animation

const PLAYER_COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#FFE66D', // yellow
  '#A29BFE', // purple
]

const PLAYER_ICONS = ['🚃', '🚂', '🚄', '🚅']

// ── Helper functions ───────────────────────────────────────────────────────

function makePlayer(index, name, isBot = false, customColor = null) {
  return {
    id: `p${index + 1}`,
    name: name || `プレイヤー${index + 1}`,
    color: customColor || PLAYER_COLORS[index % PLAYER_COLORS.length],
    icon: PLAYER_ICONS[index % PLAYER_ICONS.length],
    money: STARTING_MONEY,
    position: 'sq_00',
    items: [],
    visitedShops: [],
    isBot,
    shield: 0,
    resist: 0,
  }
}

function makeLogEntry(message, type = 'info') {
  return { id: Date.now() + Math.random(), message, type, timestamp: Date.now() }
}

function getSquare(squareId) {
  return boardData.squares.find(s => s.id === squareId) ?? null
}

function getShop(shopId) {
  return shopsData.find(s => s.id === shopId) ?? null
}

function getRandomEvent() {
  return eventsData[Math.floor(Math.random() * eventsData.length)]
}

function getRandomItem() {
  return itemsData[Math.floor(Math.random() * itemsData.length)]
}

function addLog(logs, message, type = 'info') {
  const entry = makeLogEntry(message, type)
  // Keep only last 50 entries
  return [...logs.slice(-49), entry]
}

// ── Initial state ──────────────────────────────────────────────────────────

const initialState = {
  // Game phase
  phase: 'waiting', // 'waiting' | 'setup' | 'rolling' | 'moving' | 'landing' | 'event' | 'shop' | 'item' | 'gameover'

  // Players
  players: [],
  currentPlayerIndex: 0,

  // Round tracking
  round: 1,
  maxRounds: MAX_ROUNDS_DEFAULT,

  // Dice
  diceResult: null,
  diceAnimating: false,

  // Active overlays / modals
  activeShop: null,        // shop object currently shown in modal
  activeEvent: null,       // event object currently shown
  activeItem: null,        // item being presented (item square reward)
  landingSquare: null,     // square object just landed on

  // Transient movement state
  movePath: [],            // array of squareIds being traversed
  moveStep: 0,             // current step index in movePath

  // Per-turn flags
  pendingDoubleDice: false,
  diceBonusForCurrentTurn: 0,
  skipCurrentTurn: false,
  extraRollNext: false,
  skipNextLanding: false,
  pendingTeleport: false,
  pendingLanding: null,

  // Winner
  winner: null,
  winReason: null,

  // Game log
  log: [],
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useGameStore = create(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ── Setup ────────────────────────────────────────────────────────────

    /**
     * Initialize a new game.
     * @param {number} playerCount - 1 or 2 human players
     * @param {string[]} playerNames - Array of player name strings
     * @param {string[]} colors - Array of hex color strings per player
     * @param {string|null} botName - Name for the bot (1P mode only)
     * @param {number} maxRounds - Override max rounds (default 12)
     */
    initGame(playerCount = 2, playerNames = [], colors = [], botName = null, maxRounds = MAX_ROUNDS_DEFAULT) {
      const count = Math.max(1, Math.min(4, playerCount))
      const players = Array.from({ length: count }, (_, i) =>
        makePlayer(i, playerNames[i], false, colors[i] || null)
      )

      // In 1P mode, add a bot as second player
      if (count === 1) {
        players.push(makePlayer(1, botName || 'ますてつBot', true, colors[1] || PLAYER_COLORS[1]))
      }

      const totalPlayers = players.length
      set({
        ...initialState,
        players,
        maxRounds,
        phase: 'rolling',
        log: addLog([], `ゲーム開始！${totalPlayers}人でプレイします。`, 'system'),
      })
    },

    /**
     * Reset to the title/waiting screen.
     */
    resetGame() {
      set({ ...initialState })
    },

    // ── Dice ─────────────────────────────────────────────────────────────

    /**
     * Roll the dice for the current player.
     * Handles double dice and bonus flags.
     */
    rollDice() {
      const state = get()
      if (state.phase !== 'rolling') return
      if (state.diceAnimating) return

      set({ diceAnimating: true, phase: 'rolling' })

      // Simulate animation delay
      setTimeout(() => {
        const { pendingDoubleDice, diceBonusForCurrentTurn } = get()

        let result
        if (pendingDoubleDice) {
          const [a, b] = rollDoubleDice()
          result = Math.max(a, b) // take the higher value
          set({ pendingDoubleDice: false })
        } else {
          result = rollDice()
        }

        // Apply bonus (clamped 1-6)
        if (diceBonusForCurrentTurn > 0) {
          result = Math.min(6, result + diceBonusForCurrentTurn)
        }

        const currentPlayer = get().players[get().currentPlayerIndex]
        const logMsg = `${currentPlayer.name} がサイコロを振りました: ${result}`

        set({
          diceResult: result,
          diceAnimating: false,
          diceBonusForCurrentTurn: 0,
          log: addLog(get().log, logMsg, 'roll'),
        })

        // Automatically begin movement
        get().movePlayer(result)
      }, 700)
    },

    // ── Movement ─────────────────────────────────────────────────────────

    /**
     * Move the current player the given number of steps along the board.
     * Updates position step-by-step with delays for animation.
     * @param {number} steps
     */
    movePlayer(steps) {
      const state = get()
      const player = state.players[state.currentPlayerIndex]
      const path = getWrappingPath(player.position, steps, boardData)

      if (path.length === 0) {
        get().landOnSquare(player.position)
        return
      }

      set({ phase: 'moving', movePath: path, moveStep: 0 })

      // Animate movement step by step
      let step = 0
      const advance = () => {
        step++
        const squareId = path[step - 1]
        const isLast = step === path.length

        set(s => ({
          moveStep: step,
          players: s.players.map((p, i) =>
            i === s.currentPlayerIndex ? { ...p, position: squareId } : p
          ),
        }))

        if (isLast) {
          // Arrived at destination
          setTimeout(() => get().landOnSquare(squareId), MOVE_DELAY_MS)
        } else {
          setTimeout(advance, MOVE_DELAY_MS)
        }
      }

      setTimeout(advance, MOVE_DELAY_MS)
    },

    // ── Landing ───────────────────────────────────────────────────────────

    /**
     * Handle landing on a square. Determines phase and triggers
     * the appropriate modal/event/item.
     * @param {string} squareId
     */
    landOnSquare(squareId) {
      const state = get()
      const square = getSquare(squareId)
      if (!square) {
        get().nextTurn()
        return
      }

      // skipNextLanding: skip effects of this square but still land
      if (state.skipNextLanding) {
        set({ skipNextLanding: false, phase: 'landing', landingSquare: square })
        setTimeout(() => get().nextTurn(), 500)
        return
      }

      set({ phase: 'landing', landingSquare: square })

      switch (square.type) {
        case 'shop': {
          const shop = getShop(square.shopId)
          if (shop) {
            const player = state.players[state.currentPlayerIndex]
            const isFirstVisit = !player.visitedShops.includes(shop.id)
            const bonus = calculateShopBonus(isFirstVisit)

            set(s => ({
              phase: 'shop',
              activeShop: shop,
              players: s.players.map((p, i) => {
                if (i !== s.currentPlayerIndex) return p
                return {
                  ...p,
                  money: p.money + bonus,
                  visitedShops: isFirstVisit ? [...p.visitedShops, shop.id] : p.visitedShops,
                }
              }),
              log: addLog(
                s.log,
                `${s.players[s.currentPlayerIndex].name} が「${shop.name}」に立ち寄りました。${isFirstVisit ? '初訪問ボーナス' : '再訪問'} +¥${bonus.toLocaleString()}`,
                'shop'
              ),
            }))
          } else {
            get().nextTurn()
          }
          break
        }

        case 'event': {
          const event = getRandomEvent()
          const patch = applyEventEffect(event, get())

          set(s => ({
            phase: 'event',
            activeEvent: event,
            ...patch,
            log: addLog(s.log, `イベント発生：「${event.title}」`, 'event'),
          }))
          break
        }

        case 'item': {
          const item = getRandomItem()
          const player = state.players[state.currentPlayerIndex]

          set(s => ({
            phase: 'item',
            activeItem: item,
            players: s.players.map((p, i) =>
              i === s.currentPlayerIndex
                ? { ...p, items: [...p.items, item.id] }
                : p
            ),
            log: addLog(
              s.log,
              `${player.name} がアイテム「${item.name}」を手に入れました！`,
              'item'
            ),
          }))
          break
        }

        case 'plus': {
          const player = state.players[state.currentPlayerIndex]
          const delta = calculateMoneyChange('plus', player.money)

          set(s => ({
            players: s.players.map((p, i) =>
              i === s.currentPlayerIndex ? { ...p, money: p.money + delta } : p
            ),
            log: addLog(
              s.log,
              `${player.name} +¥${delta.toLocaleString()} ボーナス！`,
              'plus'
            ),
          }))

          const winCheck = checkWinCondition(get())
          if (winCheck) {
            get()._endGame(winCheck)
          } else {
            setTimeout(() => get().nextTurn(), 1200)
          }
          break
        }

        case 'minus': {
          const player = state.players[state.currentPlayerIndex]
          const delta = calculateMoneyChange('minus', player.money)

          set(s => ({
            players: s.players.map((p, i) => {
              if (i !== s.currentPlayerIndex) return p
              // Shield blocks one minus event
              if (p.shield > 0) {
                return { ...p, shield: p.shield - 1 }
              }
              // Resist halves penalty
              const effective = p.resist > 0
                ? Math.floor(delta / 2)
                : delta
              return {
                ...p,
                money: Math.max(0, p.money + effective),
                resist: p.resist > 0 ? p.resist - 1 : 0,
              }
            }),
            log: addLog(
              s.log,
              `${player.name} ¥${Math.abs(delta).toLocaleString()} 減少…`,
              'minus'
            ),
          }))

          setTimeout(() => get().nextTurn(), 1200)
          break
        }

        case 'start': {
          // Passed the start: gain pass-through bonus
          const player = state.players[state.currentPlayerIndex]
          const bonus = calculateMoneyChange('start', player.money)
          set(s => ({
            players: s.players.map((p, i) =>
              i === s.currentPlayerIndex ? { ...p, money: p.money + bonus } : p
            ),
            log: addLog(
              s.log,
              `${player.name} が益田駅前を通過！ +¥${bonus.toLocaleString()}`,
              'plus'
            ),
          }))
          setTimeout(() => get().nextTurn(), 800)
          break
        }

        case 'goal': {
          const player = state.players[state.currentPlayerIndex]
          set(s => ({
            log: addLog(s.log, `🎉 ${player.name} がゴールに到達！`, 'system'),
          }))
          get()._endGame({ winner: player, reason: 'goal' })
          break
        }

        default:
          setTimeout(() => get().nextTurn(), 600)
          break
      }
    },

    // ── Dismiss overlays ──────────────────────────────────────────────────

    /**
     * Close the shop modal and advance the turn.
     */
    dismissShop() {
      const state = get()
      if (state.phase !== 'shop') return
      set({ phase: 'landing', activeShop: null })

      const winCheck = checkWinCondition(get())
      if (winCheck) {
        get()._endGame(winCheck)
      } else {
        get().nextTurn()
      }
    },

    /**
     * Close the event modal and advance the turn.
     */
    dismissEvent() {
      const state = get()
      if (state.phase !== 'event') return
      set({ phase: 'landing', activeEvent: null })

      // If event caused a pendingLanding, resolve it
      if (state.pendingLanding) {
        set({ pendingLanding: null })
        get().landOnSquare(state.pendingLanding)
      } else {
        const winCheck = checkWinCondition(get())
        if (winCheck) {
          get()._endGame(winCheck)
        } else {
          get().nextTurn()
        }
      }
    },

    /**
     * Close the item-received modal and advance the turn.
     */
    dismissItem() {
      const state = get()
      if (state.phase !== 'item') return
      set({ phase: 'landing', activeItem: null })
      get().nextTurn()
    },

    /**
     * Use an item from the current player's inventory.
     * @param {string} itemId
     */
    useItem(itemId) {
      const state = get()
      const player = state.players[state.currentPlayerIndex]
      if (!player.items.includes(itemId)) return

      const item = itemsData.find(it => it.id === itemId)
      if (!item) return

      const patch = applyItemEffect(item, state)

      set(s => ({
        ...patch,
        log: addLog(
          s.log,
          `${player.name} がアイテム「${item.name}」を使いました！`,
          'item'
        ),
      }))

      // If item causes a pending landing, resolve it
      const afterState = get()
      if (afterState.pendingLanding) {
        const dest = afterState.pendingLanding
        set({ pendingLanding: null })
        get().landOnSquare(dest)
      }
    },

    /**
     * Resolve a teleport: move current player to a chosen squareId.
     * @param {string} targetSquareId
     */
    resolveTeleport(targetSquareId) {
      const state = get()
      if (!state.pendingTeleport) return
      const goalSquares = boardData.goalSquares || []
      if (goalSquares.includes(targetSquareId)) return // disallow teleport to goal

      const player = state.players[state.currentPlayerIndex]
      set(s => ({
        pendingTeleport: false,
        players: s.players.map((p, i) =>
          i === s.currentPlayerIndex ? { ...p, position: targetSquareId } : p
        ),
        log: addLog(s.log, `${player.name} が${targetSquareId}へワープしました！`, 'item'),
      }))

      get().landOnSquare(targetSquareId)
    },

    // ── Turn management ───────────────────────────────────────────────────

    /**
     * Advance to the next player's turn (or next round).
     */
    nextTurn() {
      const state = get()
      const { players, currentPlayerIndex, round, maxRounds } = state

      const nextIndex = (currentPlayerIndex + 1) % players.length
      const nextRound = nextIndex === 0 ? round + 1 : round

      // Check round limit
      if (nextRound > maxRounds && nextIndex === 0) {
        const winCheck = checkWinCondition({ ...get(), round: nextRound })
        if (winCheck) {
          get()._endGame(winCheck)
          return
        }
      }

      const nextPlayer = players[nextIndex]

      set({
        currentPlayerIndex: nextIndex,
        round: nextRound,
        phase: 'rolling',
        landingSquare: null,
        diceResult: null,
        movePath: [],
        moveStep: 0,
        skipCurrentTurn: false,
        log: addLog(
          state.log,
          `${nextPlayer.name} のターンです（ラウンド ${nextRound}）`,
          'turn'
        ),
      })
    },

    // ── Game over ─────────────────────────────────────────────────────────

    /**
     * Internal: trigger game over state.
     * @param {{ winner: object, reason: string }} result
     */
    _endGame({ winner, reason }) {
      const reasonLabel =
        reason === 'goal'
          ? 'ゴール到達'
          : 'おこづかい最多'

      set(s => ({
        phase: 'gameover',
        winner,
        winReason: reason,
        log: addLog(
          s.log,
          `🏆 ${winner.name} の勝利！（${reasonLabel}）`,
          'system'
        ),
      }))
    },

    // ── Selectors (derived state) ─────────────────────────────────────────

    /** Get the current player object. */
    getCurrentPlayer() {
      const { players, currentPlayerIndex } = get()
      return players[currentPlayerIndex] ?? null
    },

    /** Get a square by ID. */
    getSquare(squareId) {
      return getSquare(squareId)
    },

    /** Get a shop by ID. */
    getShop(shopId) {
      return getShop(shopId)
    },

    /** Get all shops. */
    getAllShops() {
      return shopsData
    },

    /** Get all items. */
    getAllItems() {
      return itemsData
    },

    /** Get item objects for the current player's inventory. */
    getCurrentPlayerItems() {
      const player = get().getCurrentPlayer()
      if (!player) return []
      return player.items
        .map(id => itemsData.find(it => it.id === id))
        .filter(Boolean)
    },

    /** Get the ranking of players by money (descending). */
    getRanking() {
      return [...get().players].sort((a, b) => b.money - a.money)
    },

    /** Whether the current turn is the very last turn. */
    isLastTurn() {
      const { round, maxRounds, currentPlayerIndex, players } = get()
      return round >= maxRounds && currentPlayerIndex === players.length - 1
    },
  }))
)

export default useGameStore
