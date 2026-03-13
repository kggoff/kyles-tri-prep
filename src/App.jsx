import { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTrainingData } from './hooks/useTrainingData'
import { STORAGE_KEYS } from './utils/storage'
import { toDateKey } from './utils/dateUtils'
import { decodeShareData } from './utils/shareUtils'
import Calendar from './components/Calendar/Calendar'
import CalendarHeader from './components/Calendar/CalendarHeader'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'
import ActivityModal from './components/ActivityModal/ActivityModal'
import RaceDatePicker from './components/RaceDatePicker/RaceDatePicker'
import ActivityTypeManager from './components/ActivityTypeManager/ActivityTypeManager'
import ShareButton from './components/ShareButton/ShareButton'
import Modal from './components/common/Modal'
import './App.css'

export default function App() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  const [sharedData, setSharedData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    decodeShareData(window.location.hash).then(data => {
      setSharedData(data)
      setLoading(false)
    })
  }, [])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const readOnly = sharedData !== null

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const localData = useTrainingData()

  const entries = readOnly ? sharedData.entries : localData.entries
  const activityTypes = readOnly ? sharedData.activityTypes : localData.activityTypes
  const raceDate = readOnly ? sharedData.raceDate : localData.raceDate

  const goToPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const goToNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  const handleDayClick = (date) => {
    setSelectedDate(date)
    setShowSettings(false)
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
    setSelectedDate(null)
  }

  const selectedDateEntries = selectedDate ? (entries[toDateKey(selectedDate)] || []) : []

  if (loading) return null

  return (
    <div className="app">
      <div className="topBar">
        <div className="brand">
          <span className="logo">🏊‍♂️🚴‍♂️🏃‍♂️</span>
          <h1 className="title">Kyles Triathlon Prep</h1>
        </div>
        <div className="topActions">
          {!readOnly && (
            <>
              <ShareButton entries={entries} activityTypes={activityTypes} raceDate={raceDate} />
              <button className="settingsBtn" onClick={handleOpenSettings} title="Settings">
                &#9881;
              </button>
            </>
          )}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      {readOnly && (
        <div className="viewerBanner">
          👁 Viewing Kyles training schedule (read-only)
        </div>
      )}

      <CalendarHeader
        year={viewYear}
        month={viewMonth}
        raceDate={raceDate}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
      />

      <Calendar
        year={viewYear}
        month={viewMonth}
        entries={entries}
        activityTypes={activityTypes}
        raceDate={raceDate}
        onDayClick={handleDayClick}
      />

      {selectedDate && (
        <ActivityModal
          date={selectedDate}
          entries={selectedDateEntries}
          activityTypes={activityTypes}
          readOnly={readOnly}
          onClose={() => setSelectedDate(null)}
          onAddEntry={readOnly ? undefined : localData.addEntry}
          onUpdateEntry={readOnly ? undefined : localData.updateEntry}
          onDeleteEntry={readOnly ? undefined : localData.deleteEntry}
        />
      )}

      {!readOnly && (
        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings">
          <div className="settingsContent">
            <RaceDatePicker raceDate={raceDate} onSetRaceDate={localData.setRaceDate} />
            <ActivityTypeManager
              activityTypes={activityTypes}
              onAdd={localData.addActivityType}
              onUpdate={localData.updateActivityType}
              onDelete={localData.deleteActivityType}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
