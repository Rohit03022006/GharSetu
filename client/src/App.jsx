import React from 'react'
import { Button } from './components/ui/button'
import { ModeToggle } from './components/ui/mode-toggle'

const App = () => {
  return (
    <div className=''>
      <ModeToggle />
      <Button>Test</Button>
    </div>
  )
}

export default App