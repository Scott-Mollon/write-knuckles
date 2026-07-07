import './Input.scss'

const Input = ({
  classNames = '',
  value,
  type,
  name,
  placeholder,
  required,
  onChange,
  disabled = false,
  autoComplete,
}) => (
  <input
    value={value}
    type={type}
    name={name}
    placeholder={placeholder}
    required={required}
    onChange={onChange}
    className={classNames}
    disabled={disabled}
    autoComplete={autoComplete}
  />
)

export default Input
