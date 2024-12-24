import React from 'react'
import TextEditor from './components/TextEditor'
import './App.css'

const App = () => {
  return (
    <>
      <h1 className='text-center text-4xl font-bold text-red-900 p-4 bg-gray-300'>Demo Editor By Altamash Shaikh</h1>
      <div className='container mx-auto'>
        <TextEditor />
      </div>
    </>
  )
}

export default App