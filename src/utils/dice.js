/**
 * Dice utility functions for ます鉄
 */

/**
 * Roll a single six-sided die.
 * @returns {number} A random integer from 1 to 6 inclusive.
 */
export function rollDice() {
  return Math.floor(Math.random() * 6) + 1
}

/**
 * Roll two six-sided dice simultaneously.
 * @returns {[number, number]} An array of two dice results.
 */
export function rollDoubleDice() {
  return [rollDice(), rollDice()]
}

/**
 * Roll a die and apply a bonus modifier, clamped to valid range 1-6.
 * @param {number} bonus - Value to add to the roll result.
 * @returns {number} A clamped integer from 1 to 6.
 */
export function rollDiceWithBonus(bonus = 0) {
  const raw = rollDice() + bonus
  return Math.max(1, Math.min(6, raw))
}

/**
 * Animate dice roll: calls callback with intermediate values before
 * resolving to a final result. Useful for showing "tumbling" animation.
 * @param {(value: number) => void} onTick - Called on each animation frame.
 * @param {number} ticks - Number of intermediate ticks to show.
 * @param {number} intervalMs - Milliseconds between ticks.
 * @returns {Promise<number>} Resolves to the final dice value.
 */
export function rollDiceAnimated(onTick, ticks = 8, intervalMs = 80) {
  return new Promise((resolve) => {
    let count = 0
    const final = rollDice()

    const interval = setInterval(() => {
      count++
      if (count < ticks) {
        onTick(rollDice())
      } else {
        clearInterval(interval)
        onTick(final)
        resolve(final)
      }
    }, intervalMs)
  })
}

/**
 * Get the emoji face of a die value.
 * @param {number} value - Die value from 1 to 6.
 * @returns {string} Dice face emoji.
 */
export function getDiceFace(value) {
  const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  return faces[value] ?? '🎲'
}
