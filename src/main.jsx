import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NeuralViz from './components/NeuralViz/NeuralViz.jsx'
import NumberDrop from './components/NumberDrop/NumberDrop.jsx'

const params = new URLSearchParams(window.location.search)
const isDemo = params.has('demo')
const isGame = params.has('game')

function Root() {
  if (isGame) return <NumberDrop />
  if (isDemo) return <NeuralViz />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
