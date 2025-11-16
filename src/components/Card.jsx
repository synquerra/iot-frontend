import React from 'react'

export default function Card({children, className=''}){
  return <div className={`bg-card p-4 rounded-xl shadow-xl ${className}`}>{children}</div>
}
