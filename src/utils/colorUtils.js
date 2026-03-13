export const COLOR_PALETTE = [
  '#06b6d4', '#22c55e', '#f97316', '#8b5cf6', '#ec4899',
  '#ef4444', '#eab308', '#14b8a6', '#6366f1', '#a855f7',
  '#f43f5e', '#84cc16', '#0ea5e9', '#d946ef', '#fb923c',
]

export function getNextColor(usedColors) {
  const available = COLOR_PALETTE.filter(c => !usedColors.includes(c))
  return available.length > 0 ? available[0] : COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
}

export function getContrastText(hexColor) {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}
