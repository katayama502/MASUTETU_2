/**
 * Game rules and logic helpers for ます鉄
 */

import boardData from '@data/board.json'

// ── Money helpers ──────────────────────────────────────────────────────────

/**
 * Calculate the money change when a player lands on a square.
 * @param {'plus'|'minus'|'shop'|'event'|'item'|'start'|'goal'} squareType
 * @param {number} playerMoney - Current player money (used for % calculations).
 * @returns {number} Delta to apply to player money.
 */
export function calculateMoneyChange(squareType, playerMoney) {
  switch (squareType) {
    case 'plus':
      return Math.floor(playerMoney * 0.1) + 1000   // 10% + ¥1,000 bonus
    case 'minus':
      return -(Math.floor(playerMoney * 0.08) + 500) // -8% - ¥500 penalty
    case 'start':
      return 2000                                    // pass-through bonus
    default:
      return 0
  }
}

/**
 * Apply a shop visit bonus. Each unique shop visit is worth money.
 * @param {boolean} isFirstVisit - Whether this is the first time this player visits.
 * @returns {number} Money reward.
 */
export function calculateShopBonus(isFirstVisit) {
  return isFirstVisit ? 1000 : 200
}

// ── Item effects ───────────────────────────────────────────────────────────

/**
 * Apply an item effect to the game state and return the updated state.
 * Does NOT mutate the passed state — returns a new state copy.
 *
 * @param {object} item - Item from items.json
 * @param {object} gameState - Current game state from the store
 * @returns {object} Partial state patch to apply via the store
 */
export function applyItemEffect(item, gameState) {
  const player = gameState.players[gameState.currentPlayerIndex]
  const patch = {}

  switch (item.effect.type) {
    case 'money': {
      const updatedPlayers = gameState.players.map((p, i) =>
        i === gameState.currentPlayerIndex
          ? { ...p, money: Math.max(0, p.money + item.effect.value) }
          : p
      )
      patch.players = updatedPlayers
      break
    }

    case 'double_dice': {
      patch.pendingDoubleDice = true
      break
    }

    case 'dice_bonus': {
      patch.diceBonusForCurrentTurn = (gameState.diceBonusForCurrentTurn || 0) + item.effect.value
      break
    }

    case 'skip': {
      // Skip current turn; grant extra roll next turn
      patch.skipCurrentTurn = true
      patch.extraRollNext = true
      break
    }

    case 'skip_landing': {
      patch.skipNextLanding = true
      break
    }

    case 'shield': {
      const shielded = gameState.players.map((p, i) =>
        i === gameState.currentPlayerIndex
          ? { ...p, shield: (p.shield || 0) + 1 }
          : p
      )
      patch.players = shielded
      break
    }

    case 'resist': {
      const resisting = gameState.players.map((p, i) =>
        i === gameState.currentPlayerIndex
          ? { ...p, resist: item.effect.value }
          : p
      )
      patch.players = resisting
      break
    }

    case 'move': {
      const currentSquare = boardData.squares.find(s => s.id === player.position)
      if (currentSquare) {
        const path = getSquarePath(player.position, item.effect.value, boardData)
        const destination = path[path.length - 1]
        const movedPlayers = gameState.players.map((p, i) =>
          i === gameState.currentPlayerIndex
            ? { ...p, position: destination }
            : p
        )
        patch.players = movedPlayers
        patch.pendingLanding = destination
      }
      break
    }

    case 'move_to': {
      // Move forward exactly N squares on the main path
      const idx = boardData.mainPath.indexOf(player.position)
      if (idx !== -1) {
        const newIdx = Math.min(idx + item.effect.value, boardData.mainPath.length - 1)
        const dest = boardData.mainPath[newIdx]
        const movedPlayers = gameState.players.map((p, i) =>
          i === gameState.currentPlayerIndex
            ? { ...p, position: dest }
            : p
        )
        patch.players = movedPlayers
        patch.pendingLanding = dest
      }
      break
    }

    case 'teleport': {
      // Teleport is handled by the UI prompting the player to choose a square
      patch.pendingTeleport = true
      break
    }

    case 'steal': {
      if (gameState.players.length > 1) {
        // Steal from next player (or first, cycling)
        const targetIdx = (gameState.currentPlayerIndex + 1) % gameState.players.length
        const amount = Math.min(item.effect.value, gameState.players[targetIdx].money)
        const stolenPlayers = gameState.players.map((p, i) => {
          if (i === gameState.currentPlayerIndex) return { ...p, money: p.money + amount }
          if (i === targetIdx) return { ...p, money: Math.max(0, p.money - amount) }
          return p
        })
        patch.players = stolenPlayers
      }
      break
    }

    default:
      break
  }

  // Remove the used item from the player's inventory
  if (!patch.players) {
    patch.players = gameState.players.map((p, i) =>
      i === gameState.currentPlayerIndex
        ? { ...p, items: p.items.filter(id => id !== item.id) }
        : p
    )
  } else {
    patch.players = patch.players.map((p, i) =>
      i === gameState.currentPlayerIndex
        ? { ...p, items: p.items.filter(id => id !== item.id) }
        : p
    )
  }

  return patch
}

// ── Win condition ──────────────────────────────────────────────────────────

/**
 * Check if any player has won the game.
 * Win condition: player is on a goal square at end of maxRounds,
 * OR all rounds are spent and highest money wins.
 *
 * @param {object} gameState - Full game state
 * @returns {null | { winner: object, reason: string }} Null if game ongoing.
 */
export function checkWinCondition(gameState) {
  const { players, round, maxRounds, currentPlayerIndex } = gameState
  const goalSquares = boardData.goalSquares

  // Check if any player is on a goal square
  for (const player of players) {
    if (goalSquares.includes(player.position)) {
      return { winner: player, reason: 'goal' }
    }
  }

  // Check if we've exhausted all rounds
  const isLastTurn =
    round >= maxRounds &&
    currentPlayerIndex === players.length - 1

  if (isLastTurn) {
    const richest = players.reduce((best, p) => (p.money > best.money ? p : best), players[0])
    return { winner: richest, reason: 'most_money' }
  }

  return null
}

// ── Path calculation ───────────────────────────────────────────────────────

/**
 * Given a starting square ID and a number of steps, walk the board graph
 * and return the array of square IDs visited (including the destination).
 *
 * At branch points the first connection is taken by default.
 * At goal squares, movement stops.
 *
 * @param {string} fromId - Starting square ID.
 * @param {number} steps - Number of steps to take.
 * @param {object} [board] - Board data (defaults to imported boardData).
 * @returns {string[]} Array of squareIds from step 1 to the destination.
 */
export function getSquarePath(fromId, steps, board = boardData) {
  const squaresMap = Object.fromEntries(board.squares.map(s => [s.id, s]))
  const path = []
  let currentId = fromId

  for (let i = 0; i < steps; i++) {
    const current = squaresMap[currentId]
    if (!current || current.connections.length === 0) break

    const goalSquares = board.goalSquares || []

    // If current square has multiple connections, pick first non-goal unless forced
    const nextId =
      current.connections.find(c => !goalSquares.includes(c)) ||
      current.connections[0]

    path.push(nextId)
    currentId = nextId

    // Stop on goal squares
    if (goalSquares.includes(currentId)) break
  }

  return path
}

/**
 * Build a path that wraps around the main ring.
 * Used for board traversal that loops back to sq_00 after sq_29.
 *
 * @param {string} fromId - Starting square ID.
 * @param {number} steps - Number of steps.
 * @param {object} [board] - Board data.
 * @returns {string[]} Array of square IDs along the path.
 */
export function getWrappingPath(fromId, steps, board = boardData) {
  const mainPath = board.mainPath || []
  if (mainPath.length === 0) return getSquarePath(fromId, steps, board)

  const startIdx = mainPath.indexOf(fromId)
  if (startIdx === -1) return getSquarePath(fromId, steps, board)

  const path = []
  for (let i = 1; i <= steps; i++) {
    const idx = (startIdx + i) % mainPath.length
    path.push(mainPath[idx])
  }
  return path
}

// ── Event application ──────────────────────────────────────────────────────

/**
 * Apply an event effect to the current player and return a state patch.
 *
 * @param {object} event - Event from events.json
 * @param {object} gameState - Current game state
 * @returns {object} Partial state patch
 */
export function applyEventEffect(event, gameState) {
  const patch = {}

  switch (event.effect.type) {
    case 'money': {
      const updatedPlayers = gameState.players.map((p, i) => {
        if (i !== gameState.currentPlayerIndex) return p
        // Check for resist buff
        let delta = event.effect.value
        if (delta < 0 && p.resist > 0) {
          delta = Math.floor(delta / 2)
          return { ...p, money: Math.max(0, p.money + delta), resist: p.resist - 1 }
        }
        // Check for shield (blocks negative money only once)
        if (delta < 0 && p.shield > 0) {
          return { ...p, shield: p.shield - 1 }
        }
        return { ...p, money: Math.max(0, p.money + delta) }
      })
      patch.players = updatedPlayers
      break
    }

    case 'move': {
      const player = gameState.players[gameState.currentPlayerIndex]
      const steps = event.effect.value
      if (steps >= 0) {
        const path = getWrappingPath(player.position, steps, boardData)
        const dest = path[path.length - 1] || player.position
        patch.players = gameState.players.map((p, i) =>
          i === gameState.currentPlayerIndex ? { ...p, position: dest } : p
        )
        patch.pendingLanding = dest
      } else {
        // Negative move: step backward along main path
        const mainPath = boardData.mainPath
        const idx = mainPath.indexOf(player.position)
        if (idx !== -1) {
          const newIdx = Math.max(0, idx + steps)
          const dest = mainPath[newIdx]
          patch.players = gameState.players.map((p, i) =>
            i === gameState.currentPlayerIndex ? { ...p, position: dest } : p
          )
          patch.pendingLanding = dest
        }
      }
      break
    }

    case 'item': {
      // Grant a random item — handled by the store
      patch.grantRandomItem = true
      break
    }

    default:
      break
  }

  return patch
}
