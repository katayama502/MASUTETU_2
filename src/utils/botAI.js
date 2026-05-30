/**
 * Bot decision-making for ます鉄.
 *
 * Called when it is a bot player's turn to decide:
 *   - Whether to buy a property (yes if affordable and unowned)
 *   - Which card to use and when
 */

/**
 * Decide whether a bot should buy a property.
 * Strategy: buy if the bot can afford it while keeping at least ¥3000 as safety margin.
 *
 * @param {object} bot - The bot player object
 * @param {object} shop - The shop object (from shops.json, includes cost/income/rent)
 * @param {object} gameState - Current game state from the store
 * @param {number} [discountedCost] - Override cost if a discount card is in effect
 * @returns {boolean} True if the bot should buy
 */
export function botShouldBuyProperty(bot, shop, gameState, discountedCost = null) {
  const cost = discountedCost ?? shop.cost
  const remainingAfterPurchase = bot.money - cost

  // Must have at least ¥3000 left after purchase
  if (remainingAfterPurchase < 3000) return false

  // Extra caution: don't buy in the first two years if it leaves less than ¥5000
  const currentYear = gameState.year ?? gameState.round ?? 1
  if (currentYear <= 2 && remainingAfterPurchase < 5000) return false

  // Prefer buying higher-income properties when money is limited
  const incomeRatio = shop.income / cost
  if (remainingAfterPurchase < 6000 && incomeRatio < 0.1) return false

  return true
}

/**
 * Choose the best card for a bot to use, or return null to hold.
 * Priority order:
 *   1. dotabata_transfer — if ドタバタくん is attached to bot
 *   2. steal_property — if bot is behind on properties and can steal
 *   3. rent_block — if bot is about to land on a high-rent property (heuristic)
 *   4. move card — if bot is more than 5 squares from destination
 *   5. money/income cards — if bot is low on cash
 *   6. Otherwise: hold
 *
 * @param {object} bot - The bot player object
 * @param {object} gameState - Current game state from the store
 * @returns {string|null} Card/item id to use, or null to not play anything
 */
export function botChooseBestCard(bot, gameState) {
  const cards = [...(bot.cards || []), ...(bot.items || [])]
  if (cards.length === 0) return null

  const { dotabataActive, dotabataTargetId, players, currentPlayerIndex, shopOwners } = gameState

  // 1. If ドタバタくん is chasing the bot, transfer it immediately
  if (dotabataActive && (dotabataTargetId === bot.id || bot.hasDotabata)) {
    const transferCard = cards.find(id => id === 'item_020')
    if (transferCard) return transferCard
  }

  // 2. Steal property if bot has fewer properties than richest opponent
  const opponents = players.filter(p => p.id !== bot.id)
  const richestOpponent = opponents.reduce(
    (best, p) => (p.money > best.money ? p : best),
    opponents[0]
  )
  if (richestOpponent && (richestOpponent.ownedShops || []).length > (bot.ownedShops || []).length) {
    const stealCard = cards.find(id => id === 'item_016')
    if (stealCard) return stealCard
  }

  // 3. Use shop discount if bot has enough money to buy a property soon
  if (bot.money >= 4000) {
    const discountCard = cards.find(id => id === 'item_019')
    if (discountCard) return discountCard
  }

  // 4. Use move card if far from destination
  if (bot.destination) {
    const mainPath = gameState.players[0]?.position != null
      ? (gameState._boardMainPath || [])
      : []
    // Heuristic: use move cards if bot has been on the same square for a while
    // (we don't have direct "distance to destination" here, so use a simpler signal)
    const saltCard = cards.find(id => id === 'item_013') // 益田の塩 (move +3)
    const ticketCard = cards.find(id => id === 'item_010') // 山陰本線の切符 (move +5)
    if (ticketCard && bot.money < 8000) return ticketCard
    if (saltCard && bot.money < 6000) return saltCard
  }

  // 5. Cash cards if bot is low on money
  if (bot.money < 5000) {
    const ayuCard = cards.find(id => id === 'item_004') // +¥3000
    if (ayuCard) return ayuCard
    const juiceCard = cards.find(id => id === 'item_009') // +¥1500
    if (juiceCard) return juiceCard
  }

  // 6. Use income boost before year-end if owning properties
  if ((bot.ownedShops || []).length > 0) {
    const incomeCard = cards.find(id => id === 'item_015') // income_boost
    if (incomeCard) return incomeCard
  }

  // No good use case — hold all cards
  return null
}

/**
 * Decide whether the bot should use a rent_block card.
 * Use it if the square the bot is about to land on has rent > ¥800.
 *
 * @param {object} bot - Bot player
 * @param {object} shop - Shop the bot just landed on
 * @param {object} gameState - Current state
 * @returns {boolean}
 */
export function botShouldBlockRent(bot, shop, gameState) {
  const cards = [...(bot.cards || []), ...(bot.items || [])]
  const hasBlock = cards.includes('item_014')
  if (!hasBlock) return false
  return (shop.rent || 0) >= 800
}
