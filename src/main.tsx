import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import WithFirestore from "./components/WithFirestore.tsx";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
      <WithFirestore>
        <App />
      </WithFirestore>
  </React.StrictMode>,
)
