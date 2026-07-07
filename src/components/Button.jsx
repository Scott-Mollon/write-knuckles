import './Button.scss'

const Button = ({ type = 'button', onClick, disabled = false, children, className = '' }) => {
  if (['submit', 'reset'].includes(type)) {
    return (
      <button type={type} className={`bk-button ${className}`} disabled={disabled}>
        {children}
      </button>
    )
  }

  return (
    <button type={type} className={`bk-button ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
