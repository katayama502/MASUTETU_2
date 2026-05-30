/**
 * ます鉄 Game Store (Zustand)
 * Manages the full game loop: init → roll → move → land → event/shop/buy_property → next turn
 * Includes Momotaro Dentetsu-inspired mechanics:
 *   - Destination system (目的地)
 *   - Property ownership (物件購入)
 *   - ドタバタくん (poverty spirit)
 *   - Year-end income (年収入)
 *   - Card system
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import boardData from '@data/board.json'
import shopsData from '@data/shops.json'
import eventsData from '@data/events.json'
import itemsData from '@data/items.json'
import destinationsData from '@data/destinations.json'

import { rollDice, rollDoubleDice } from '@utils/dice'
import {
  calculateMoneyChange,
  calculateShopBonus,
  applyItemEffect,
  applyEventEffect,
  checkWinCondition,
  getWrappingPath,
  pickRandomDestination,
  calculateDestBonus,
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

/**
 * Build initial destinations for all players ensuring no two players share one.
 * Returns an array of destination squareIds indexed by player index.
 */
function assignStartingDestinations(count) {
  const assigned = []
  for (let i = 0; i < count; i++) {
    const dest = pickRandomDestination(null, assigned)
    assigned.push(dest.squareId)
  }
  return assigned
}

function makePlayer(index, name, isBot = false, customColor = null, destSquareId = null) {
  return {
    id: `p${index + 1}`,
    name: name || `プレイヤー${index + 1}`,
    color: customColor || PLAYER_COLORS[index % PLAYER_COLORS.length],
    icon: PLAYER_ICONS[index % PLAYER_ICONS.length],
    money: STARTING_MONEY,
    position: 'sq_00',
    items: [],
    cards: [],
    visitedShops: [],
    ownedShops: [],
    isBot,
    shield: 0,
    resist: 0,
    rentBlock: 0,
    incomeBoost: 1,
    shopDiscount: 1,
    hasDotabata: false,
    destination: destSquareId,
    destinationBonus: calculateDestBonus(1),
    destinationsReached: 0,
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
  // 'waiting' | 'setup' | 'rolling' | 'moving' | 'landing' | 'event' | 'shop'
  // | 'item' | 'buy_property' | 'destination_reached' | 'year_end' | 'gameover'
  phase: 'waiting',

  // Players
  players: [],
  currentPlayerIndex: 0,

  // Year/round tracking (year is display-facing, round is internal)
  round: 1,
  year: 1,
  maxRounds: MAX_ROUNDS_DEFAULT,

  // Dice
  diceResult: null,
  diceAnimating: false,

  // Active overlays / modals
  activeShop: null,            // shop object currently shown in modal
  activeEvent: null,           // event object currently shown
  activeItem: null,            // item being presented (item square reward)
  landingSquare: null,         // square object just landed on
  activeBuyProperty: null,     // { shop, cost } when player can buy unowned property
  activeDestinationReached: null, // { shop, bonus, playerName } when destination hit
  activeYearEnd: null,         // { year, incomes: [{playerId, playerName, amount}] }

  // Property ownership map: shopId → playerId
  shopOwners: {},

  // ドタバタくん
  dotabataActive: false,
  dotabataPosition: 'sq_00',
  dotabataTargetId: null,

  // Transient movement state
  movePath: [],
  moveStep: 0,

  // Per-turn flags
  pendingDoubleDice: false,
  diceBonusForCurrentTurn: 0,
  skipCurrentTurn: false,
  extraRollNext: false,
  skipNextLanding: false,
  pendingTeleport: false,
  pendingLanding: null,
  pendingExtraCards: 0,

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

      // Assign starting destinations ensuring no duplicates
      const totalPlayers = count === 1 ? 2 : count
      const destSquareIds = assignStartingDestinations(totalPlayers)

      const players = Array.from({ length: count }, (_, i) =>
        makePlayer(i, playerNames[i], false, colors[i] || null, destSquareIds[i])
      )

      // In 1P mode, add a bot as second player
      if (count === 1) {
        players.push(makePlayer(1, botName || 'ますてつBot', true, colors[1] || PLAYER_COLORS[1], destSquareIds[1]))
      }

      set({
        ...initialState,
        players,
        maxRounds,
        round: 1,
        year: 1,
        shopOwners: {},
        phase: 'rolling',
        log: addLog([], `ゲーム開始！${players.length}人でプレイします。`, 'system'),
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

        // Check if passing sq_00 (bank pass bonus)
        if (squareId === 'sq_00' && !isLast) {
          const passingPlayer = get().players[get().currentPlayerIndex]
          const PASS_BONUS = 2000
          set(s => ({
            players: s.players.map((p, i) =>
              i === s.currentPlayerIndex ? { ...p, money: p.money + PASS_BONUS } : p
            ),
            log: addLog(get().log, `${passingPlayer.name} が益田駅前を通過！ +¥${PASS_BONUS.toLocaleString()}`, 'plus'),
          }))
        }

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
          if (!shop) {
            get().nextTurn()
            return
          }

          const currentState = get()
          const player = currentState.players[currentState.currentPlayerIndex]
          const { shopOwners } = currentState
          const ownerId = shopOwners[shop.id]

          // Check if this is the player's current destination
          if (square.id === player.destination) {
            const bonus = player.destinationBonus
            set(s => ({
              phase: 'destination_reached',
              activeDestinationReached: { shop, bonus, playerName: player.name },
              players: s.players.map((p, i) =>
                i === s.currentPlayerIndex
                  ? { ...p, money: p.money + bonus }
                  : p
              ),
              log: addLog(
                s.log,
                `🎯 ${player.name} が目的地「${shop.name}」に到達！ +¥${bonus.toLocaleString()}`,
                'system'
              ),
            }))
            return
          }

          if (!ownerId) {
            // Unowned: offer purchase
            const discountMultiplier = player.shopDiscount || 1
            const cost = Math.floor(shop.cost * discountMultiplier)
            set(s => ({
              phase: 'buy_property',
              activeBuyProperty: { shop, cost },
              activeShop: shop,
            }))
          } else if (ownerId === player.id) {
            // Own it: just show info, grant small revisit bonus
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
                `${player.name} が自分の物件「${shop.name}」に到着。${isFirstVisit ? '初訪問ボーナス' : '収益確認'} +¥${bonus.toLocaleString()}`,
                'shop'
              ),
            }))
          } else {
            // Someone else owns it: pay rent
            const owner = currentState.players.find(p => p.id === ownerId)
            const rent = shop.rent || 500

            // rent_block card check
            if (player.rentBlock > 0) {
              set(s => ({
                phase: 'shop',
                activeShop: shop,
                players: s.players.map((p, i) => {
                  if (i !== s.currentPlayerIndex) return p
                  return { ...p, rentBlock: p.rentBlock - 1 }
                }),
                log: addLog(
                  s.log,
                  `${player.name} が ${owner ? owner.name : '他のプレイヤー'} の物件「${shop.name}」に！石見焼のお皿で家賃をブロック！`,
                  'item'
                ),
              }))
              return
            }

            // Shield check
            let actualRent = rent
            let shieldUsed = false
            if (player.shield > 0) {
              actualRent = 0
              shieldUsed = true
            }

            set(s => ({
              phase: 'shop',
              activeShop: shop,
              players: s.players.map((p, i) => {
                if (i === s.currentPlayerIndex) {
                  return {
                    ...p,
                    money: Math.max(0, p.money - actualRent),
                    shield: shieldUsed ? Math.max(0, p.shield - 1) : p.shield,
                  }
                }
                if (owner && p.id === owner.id) {
                  return { ...p, money: p.money + actualRent }
                }
                return p
              }),
              log: addLog(
                s.log,
                shieldUsed
                  ? `${player.name} が${owner ? owner.name : '他のプレイヤー'}の物件「${shop.name}」に！お守りで家賃を無効化！`
                  : `${player.name} が${owner ? owner.name : '他のプレイヤー'}の物件「${shop.name}」に！家賃 ¥${actualRent.toLocaleString()} を支払い`,
                'minus'
              ),
            }))
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
                ? { ...p, cards: [...(p.cards || []), item.id].slice(0, 5) }
                : p
            ),
            log: addLog(
              s.log,
              `${player.name} がカード「${item.name}」を手に入れました！`,
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
          // Landing directly on start: gain pass-through bonus
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

    // ── Property purchase ─────────────────────────────────────────────────

    /**
     * Player accepts property purchase.
     * @param {string} shopId
     */
    buyProperty(shopId) {
      const state = get()
      const { activeBuyProperty, players, currentPlayerIndex, shopOwners } = state
      const player = players[currentPlayerIndex]
      const shop = getShop(shopId)

      if (!shop) {
        set({ activeBuyProperty: null, phase: 'landing' })
        get().nextTurn()
        return
      }

      const cost = activeBuyProperty?.cost ?? shop.cost

      if (player.money < cost) {
        // Can't afford — log it, move to next turn
        set(s => ({
          phase: 'landing',
          activeBuyProperty: null,
          log: addLog(s.log, `${player.name} はお金が足りず「${shop.name}」を購入できません（¥${cost.toLocaleString()} 必要）`, 'minus'),
        }))
        get().nextTurn()
        return
      }

      set(s => ({
        phase: 'landing',
        activeBuyProperty: null,
        activeShop: null,
        shopOwners: { ...s.shopOwners, [shopId]: player.id },
        players: s.players.map((p, i) =>
          i === s.currentPlayerIndex
            ? {
                ...p,
                money: p.money - cost,
                ownedShops: [...p.ownedShops, shopId],
                shopDiscount: 1, // reset discount after use
              }
            : p
        ),
        log: addLog(s.log, `${player.name} が「${shop.name}」を購入！(¥${cost.toLocaleString()})`, 'shop'),
      }))

      const winCheck = checkWinCondition(get())
      if (winCheck) {
        get()._endGame(winCheck)
      } else {
        get().nextTurn()
      }
    },

    /**
     * Player declines property purchase.
     */
    skipBuyProperty() {
      set({ activeBuyProperty: null, activeShop: null, phase: 'landing' })
      get().nextTurn()
    },

    // ── Destination reached ───────────────────────────────────────────────

    /**
     * Dismiss the destination-reached modal and assign new destination.
     */
    dismissDestinationReached() {
      const state = get()
      const player = state.players[state.currentPlayerIndex]

      // Collect all other players' destination squareIds to avoid duplicates
      const otherDestinations = state.players
        .filter((_, i) => i !== state.currentPlayerIndex)
        .map(p => p.destination)
        .filter(Boolean)

      const newDest = pickRandomDestination(player.destination, otherDestinations)
      const newBonus = calculateDestBonus(state.year)

      set(s => ({
        activeDestinationReached: null,
        phase: 'landing',
        players: s.players.map((p, i) =>
          i === s.currentPlayerIndex
            ? {
                ...p,
                destination: newDest.squareId,
                destinationBonus: newBonus,
                destinationsReached: p.destinationsReached + 1,
              }
            : p
        ),
        log: addLog(
          s.log,
          `${player.name} の新しい目的地：「${newDest.name}」（ボーナス ¥${newBonus.toLocaleString()}）`,
          'system'
        ),
      }))

      const winCheck = checkWinCondition(get())
      if (winCheck) {
        get()._endGame(winCheck)
      } else {
        get().nextTurn()
      }
    },

    // ── Year-end income ───────────────────────────────────────────────────

    /**
     * Process year-end: distribute property income, move ドタバタくん.
     * @param {number} prevYear - The year that just ended.
     */
    processYearEnd(prevYear) {
      const state = get()
      const { players, shopOwners, dotabataActive, dotabataPosition, dotabataTargetId } = state
      const incomes = []

      // Calculate property income for each owner
      const updatedPlayers = players.map(p => {
        if (!p.ownedShops || p.ownedShops.length === 0) return p

        const boost = p.incomeBoost || 1
        const totalIncome = p.ownedShops.reduce((sum, shopId) => {
          const shop = shopsData.find(s => s.id === shopId)
          return sum + (shop?.income || 0)
        }, 0)

        const boostedIncome = Math.floor(totalIncome * boost)

        if (boostedIncome > 0) {
          incomes.push({ playerId: p.id, playerName: p.name, amount: boostedIncome })
        }

        return {
          ...p,
          money: p.money + boostedIncome,
          incomeBoost: 1, // reset boost after use
        }
      })

      // ドタバタくん logic: check if it should activate or move
      let newDotabataActive = dotabataActive
      let newDotabataPosition = dotabataPosition
      let newDotabataTargetId = dotabataTargetId
      let dotabataUpdatedPlayers = updatedPlayers

      if (prevYear >= 2) {
        const sorted = [...updatedPlayers].sort((a, b) => b.money - a.money)
        const poorest = sorted[sorted.length - 1]
        const richest = sorted[0]

        if (!dotabataActive && richest.money >= poorest.money * 3 && poorest.money > 0) {
          // ドタバタくん activates! targets richest player
          newDotabataActive = true
          newDotabataTargetId = richest.id
          newDotabataPosition = 'sq_00'
        }

        if (newDotabataActive && newDotabataTargetId) {
          const target = updatedPlayers.find(p => p.id === newDotabataTargetId)
          if (target) {
            // Move ドタバタくん toward target
            const diceRoll = Math.floor(Math.random() * 6) + 1
            const mainPath = boardData.mainPath
            const currentIdx = mainPath.indexOf(newDotabataPosition)
            const targetIdx = mainPath.indexOf(target.position)

            if (currentIdx !== -1 && targetIdx !== -1) {
              const stepsToTarget = (targetIdx - currentIdx + mainPath.length) % mainPath.length
              const moveSteps = Math.min(diceRoll, stepsToTarget)
              const newIdx = (currentIdx + moveSteps) % mainPath.length
              newDotabataPosition = mainPath[newIdx]

              // If ドタバタくん reaches the target player
              if (newDotabataPosition === target.position) {
                const penalty = Math.floor(target.money * 0.15)
                dotabataUpdatedPlayers = updatedPlayers.map(p => {
                  if (p.id === target.id) {
                    return { ...p, money: Math.max(0, p.money - penalty), hasDotabata: true }
                  }
                  return p
                })
              }
            }
          }
        }

        // If ドタバタくん is attached to someone: apply per-year penalty (5% of money)
        dotabataUpdatedPlayers = dotabataUpdatedPlayers.map(p => {
          if (p.hasDotabata) {
            const penalty = Math.floor(p.money * 0.05)
            return { ...p, money: Math.max(0, p.money - penalty) }
          }
          return p
        })
      }

      const hasIncomes = incomes.length > 0

      set(s => ({
        players: dotabataUpdatedPlayers,
        dotabataActive: newDotabataActive,
        dotabataPosition: newDotabataPosition,
        dotabataTargetId: newDotabataTargetId,
        activeYearEnd: hasIncomes ? { year: prevYear, incomes } : null,
        phase: hasIncomes ? 'year_end' : 'rolling',
        log: addLog(s.log, `第${prevYear}年終了！物件収入を受け取りました`, 'system'),
      }))
    },

    /**
     * Dismiss year-end income summary.
     */
    dismissYearEnd() {
      set({ activeYearEnd: null, phase: 'rolling' })
    },

    // ── Dismiss overlays ──────────────────────────────────────────────────

    /**
     * Close the shop modal and advance the turn.
     * Works for both 'shop' phase and edge cases.
     */
    dismissShop() {
      const state = get()
      // Allow dismissal from shop or buy_property phase (edge case fallback)
      if (state.phase !== 'shop' && state.phase !== 'buy_property') return
      set({ phase: 'landing', activeShop: null, activeBuyProperty: null })

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

      // Handle pending extra cards from extra_card item effect
      const afterState = get()
      if (afterState.pendingExtraCards > 0) {
        const count = afterState.pendingExtraCards
        set({ pendingExtraCards: 0 })
        const currentPlayer = afterState.players[afterState.currentPlayerIndex]
        const cardsToAdd = []
        for (let i = 0; i < count; i++) {
          cardsToAdd.push(getRandomItem().id)
        }
        set(s => ({
          players: s.players.map((p, i) =>
            i === s.currentPlayerIndex
              ? { ...p, cards: [...(p.cards || []), ...cardsToAdd].slice(0, 5) }
              : p
          ),
          log: addLog(s.log, `${currentPlayer.name} がカードを${count}枚引きました！`, 'item'),
        }))
      }

      get().nextTurn()
    },

    /**
     * Use an item/card from the current player's inventory.
     * @param {string} itemId
     */
    useItem(itemId) {
      const state = get()
      const player = state.players[state.currentPlayerIndex]

      // Check both items (backward compat) and cards arrays
      const inItems = player.items.includes(itemId)
      const inCards = (player.cards || []).includes(itemId)
      if (!inItems && !inCards) return

      const item = itemsData.find(it => it.id === itemId)
      if (!item) return

      const patch = applyItemEffect(item, state)

      set(s => ({
        ...patch,
        log: addLog(
          s.log,
          `${player.name} がカード「${item.name}」を使いました！`,
          'item'
        ),
      }))

      // Handle pending extra cards
      const afterState = get()
      if (afterState.pendingExtraCards > 0) {
        const count = afterState.pendingExtraCards
        set({ pendingExtraCards: 0 })
        const cardsToAdd = []
        for (let i = 0; i < count; i++) {
          cardsToAdd.push(getRandomItem().id)
        }
        set(s => ({
          players: s.players.map((p, i) =>
            i === s.currentPlayerIndex
              ? { ...p, cards: [...(p.cards || []), ...cardsToAdd].slice(0, 5) }
              : p
          ),
        }))
      }

      // If item causes a pending landing, resolve it
      const finalState = get()
      if (finalState.pendingLanding) {
        const dest = finalState.pendingLanding
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
     * Advance to the next player's turn (or next year).
     */
    nextTurn() {
      const state = get()
      const { players, currentPlayerIndex, round, year, maxRounds } = state

      const nextIndex = (currentPlayerIndex + 1) % players.length
      const isYearEnd = nextIndex === 0
      const nextYear = isYearEnd ? (year || round) + 1 : (year || round)
      const nextRound = isYearEnd ? round + 1 : round

      // Check year limit
      if (isYearEnd && nextYear > maxRounds) {
        const winner = [...state.players].sort((a, b) => b.money - a.money)[0]
        get()._endGame({ winner, reason: 'most_money' })
        return
      }

      const nextPlayer = players[nextIndex]

      // Year-end processing
      if (isYearEnd) {
        get().processYearEnd(year || round)
        // After year-end, set next player and advance year
        const afterYearState = get()
        set(s => ({
          currentPlayerIndex: nextIndex,
          round: nextRound,
          year: nextYear,
          landingSquare: null,
          diceResult: null,
          movePath: [],
          moveStep: 0,
          skipCurrentTurn: false,
          phase: afterYearState.activeYearEnd ? 'year_end' : 'rolling',
          log: afterYearState.activeYearEnd
            ? s.log
            : addLog(s.log, `${nextPlayer.name} のターン（第${nextYear}年）`, 'turn'),
        }))
        return
      }

      set({
        currentPlayerIndex: nextIndex,
        round: nextRound,
        year: nextYear,
        phase: 'rolling',
        landingSquare: null,
        diceResult: null,
        movePath: [],
        moveStep: 0,
        skipCurrentTurn: false,
        log: addLog(
          state.log,
          `${nextPlayer.name} のターン（第${nextYear}年）`,
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

    /** Get all destinations. */
    getAllDestinations() {
      return destinationsData
    },

    /** Get item objects for the current player's hand (cards + items). */
    getCurrentPlayerItems() {
      const player = get().getCurrentPlayer()
      if (!player) return []
      const allIds = [...(player.items || []), ...(player.cards || [])]
      return allIds
        .map(id => itemsData.find(it => it.id === id))
        .filter(Boolean)
    },

    /** Get the ranking of players by money (descending). */
    getRanking() {
      return [...get().players].sort((a, b) => b.money - a.money)
    },

    /** Whether the current turn is the very last turn. */
    isLastTurn() {
      const { round, year, maxRounds, currentPlayerIndex, players } = get()
      const currentYear = year ?? round ?? 1
      return currentYear >= maxRounds && currentPlayerIndex === players.length - 1
    },

    /** Get the destination object for a given squareId. */
    getDestinationBySquareId(squareId) {
      return destinationsData.find(d => d.squareId === squareId) ?? null
    },

    /** Get the owner player of a shop, or null. */
    getShopOwner(shopId) {
      const { shopOwners, players } = get()
      const ownerId = shopOwners[shopId]
      if (!ownerId) return null
      return players.find(p => p.id === ownerId) ?? null
    },
  }))
)

export default useGameStore
