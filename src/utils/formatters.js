/**
 * Formatting utility functions for ます鉄
 */

/**
 * Format a yen amount with commas and ¥ symbol.
 * @param {number} amount - Amount in yen.
 * @returns {string} e.g. "¥10,000"
 */
export function formatMoney(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '¥0'
  const abs = Math.abs(Math.round(amount))
  const formatted = abs.toLocaleString('ja-JP')
  return amount < 0 ? `-¥${formatted}` : `¥${formatted}`
}

/**
 * Format a money delta for display (+ or - prefix, colored).
 * @param {number} delta - Change in yen (positive or negative).
 * @returns {{ text: string, positive: boolean }}
 */
export function formatMoneyDelta(delta) {
  const abs = Math.abs(Math.round(delta))
  const formatted = abs.toLocaleString('ja-JP')
  if (delta >= 0) {
    return { text: `+¥${formatted}`, positive: true }
  }
  return { text: `-¥${formatted}`, positive: false }
}

/**
 * Format the round indicator.
 * @param {number} current - Current round number (1-based).
 * @param {number} max - Maximum rounds.
 * @returns {string} e.g. "3 / 12ラウンド"
 */
export function formatRound(current, max) {
  return `${current} / ${max}ラウンド`
}

/**
 * Format a player name for display, truncating if too long.
 * @param {string} name
 * @param {number} maxLen - Max character length.
 * @returns {string}
 */
export function formatPlayerName(name, maxLen = 8) {
  if (!name) return 'プレイヤー'
  return name.length > maxLen ? name.slice(0, maxLen) + '…' : name
}

/**
 * Format a square type label in Japanese.
 * @param {'start'|'shop'|'event'|'item'|'plus'|'minus'|'goal'|'landmark'} type
 * @returns {string}
 */
export function formatSquareType(type) {
  const labels = {
    start:    'スタート',
    shop:     'お店',
    event:    'イベント',
    item:     'アイテム',
    plus:     'プラス',
    minus:    'マイナス',
    goal:     'ゴール',
    landmark: 'ランドマーク',
  }
  return labels[type] ?? type
}

/**
 * Format a shop category in Japanese.
 * @param {'food'|'souvenir'|'culture'|'nature'|'landmark'} category
 * @returns {string}
 */
export function formatCategory(category) {
  const labels = {
    food:     '飲食',
    souvenir: 'お土産',
    culture:  '文化',
    nature:   '自然',
    landmark: 'ランドマーク',
  }
  return labels[category] ?? category
}

/**
 * Format a number of turns remaining.
 * @param {number} turns
 * @returns {string}
 */
export function formatTurnsLeft(turns) {
  if (turns <= 0) return '最終ターン'
  return `残り${turns}ターン`
}

/**
 * Format a timestamp as HH:MM.
 * @param {Date|number} date
 * @returns {string}
 */
export function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Format a log entry timestamp as a relative label.
 * @param {number} timestamp - Unix ms timestamp.
 * @returns {string}
 */
export function formatLogTimestamp(timestamp) {
  const now = Date.now()
  const diff = Math.floor((now - timestamp) / 1000)
  if (diff < 60) return `${diff}秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`
  return formatTime(new Date(timestamp))
}

/**
 * Format an item rarity label in Japanese.
 * @param {'common'|'uncommon'|'rare'|'legendary'} rarity
 * @returns {string}
 */
export function formatRarity(rarity) {
  const labels = {
    common:    'コモン',
    uncommon:  'アンコモン',
    rare:      'レア',
    legendary: '伝説',
  }
  return labels[rarity] ?? rarity
}
