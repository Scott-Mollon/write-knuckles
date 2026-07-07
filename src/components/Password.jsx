import { useState } from 'react'
import Input from './Input'
import './Password.scss'

const Password = ({ value, onChange, disabled = false }) => {
  const [hidden, setHidden] = useState(true)

  return (
    <div className="viewable-password">
      <Input
        type={hidden ? 'password' : 'text'}
        autoComplete="current-password"
        value={value}
        onChange={onChange}
        placeholder="Password"
        disabled={disabled}
      />
      <button
        type="button"
        className="toggle-password"
        onClick={() => setHidden(!hidden)}
        aria-label={hidden ? 'Show password' : 'Hide password'}
      >
        <img src={hidden ? '/view.png' : '/hide.png'} alt="" />
      </button>
    </div>
  )
}

export default Password
