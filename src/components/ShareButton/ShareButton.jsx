import { useState } from 'react'
import { encodeShareData } from '../../utils/shareUtils'
import styles from './ShareButton.module.css'

export default function ShareButton({ entries, activityTypes, raceDate }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const encoded = await encodeShareData(entries, activityTypes, raceDate)
    const url = `${window.location.origin}${window.location.pathname}#data=${encoded}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      className={`${styles.shareBtn} ${copied ? styles.copied : ''}`}
      onClick={handleShare}
    >
      {copied ? '✓ Copied!' : '🔗 Share'}
    </button>
  )
}
