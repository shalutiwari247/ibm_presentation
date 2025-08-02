import React from 'react'

export default function weather() {
  return (
    <div className='App-header'>
      <input type='text' placeholder='enter city name' value={city} onChange={handlecitychange}/>
    </div>
  )
}
