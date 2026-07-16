import { useState } from 'react'
import Input from './Input'
import { evaluatePassword, PASSWORD_REQUIREMENT_LABELS } from '../lib/auth/passwordPolicy'
import './Password.scss'

const REQUIREMENT_KEYS = ['length', 'lower', 'upper', 'digit', 'symbol']

const Password = ({
  value,
  onChange,
  disabled = false,
  showRequirements = false,
  autoComplete = 'current-password',
}) => {
  const [hidden, setHidden] = useState(true)
  const { checks } = evaluatePassword(value)

  return (
    <div className="password-field">
      <div className="viewable-password">
        <Input
          type={hidden ? 'password' : 'text'}
          autoComplete={autoComplete}
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
      {showRequirements && (
        <ul className="password-requirements" aria-live="polite">
          {REQUIREMENT_KEYS.map((key) => (
            <li
              key={key}
              className={checks[key] ? 'password-requirements__item--pass' : 'password-requirements__item--fail'}
            >
              {PASSWORD_REQUIREMENT_LABELS[key]}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Password
