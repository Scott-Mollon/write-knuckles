import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { evaluatePassword } from '../lib/auth/passwordPolicy'
import Input from '../components/Input'
import Button from '../components/Button'
import Divider from '../components/Divider'
import Password from '../components/Password'
import './SigninPage.scss'

const PAGE_STATES = {
  SIGNIN: 0,
  CONFIRM: 1,
}

const SigninPage = () => {
  const navigate = useNavigate()
  const { signin, signup } = useAuth()

  const [pageMode, setPageMode] = useState(PAGE_STATES.SIGNIN)
  const [errorMessage, setErrorMessage] = useState(null)
  const [pageWorking, setPageWorking] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const passwordOk = evaluatePassword(password).ok

  const signUp = async () => {
    setErrorMessage(null)
    setPageWorking(true)

    const result = await signup({ email, password })

    if (result.success) {
      setPageMode(PAGE_STATES.CONFIRM)
    } else {
      setErrorMessage(result.message)
    }

    setPageWorking(false)
  }

  const signIn = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setPageWorking(true)

    const result = await signin({ email, password })

    if (result.success) {
      navigate('/')
    } else {
      setErrorMessage(result.message)
    }

    setPageWorking(false)
  }

  return (
    <div className="centered-page signin-page">
      <div className="signin-disclaimer">
        Access to Write Knuckles is currently by invitation only.
      </div>
      <div className="page-header">Write Knuckles</div>
      <div className="page-subheader">The back room where pulp gets written.</div>

      <form onSubmit={signIn}>
        {pageMode === PAGE_STATES.SIGNIN && (
          <>
            <Input
              type="email"
              classNames="signin-email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={pageWorking}
            />
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pageWorking}
              showRequirements
              autoComplete="new-password"
            />
            <div className="signin-btns">
              <Button type="button" onClick={signUp} disabled={pageWorking || !passwordOk}>
                Sign Up
              </Button>
              <Button type="submit" disabled={pageWorking}>
                Sign In
              </Button>
            </div>
          </>
        )}
      </form>

      {pageMode === PAGE_STATES.CONFIRM && (
        <div className="signin-confirm">
          <div className="confirm-header">Please Confirm Your Email</div>
          <div className="confirm-text">
            Before signing in to Write Knuckles you must first confirm your email address.
            Please check your email for a confirmation link. You may find it in your spam folder.
          </div>
        </div>
      )}

      {errorMessage && <div className="signin-error">{errorMessage}</div>}

      {pageMode === PAGE_STATES.SIGNIN && (
        <div className="page-help">
          To create a new account enter your email and a password, and then click Sign Up.
        </div>
      )}

      <Divider />

      <div className="signin-footer">
        <Link to="/reset">Forgot My Password</Link>
        <div>
          <a href="https://bronzeknucklesmagazine.com">Bronze Knuckles Magazine</a>
        </div>
      </div>
    </div>
  )
}

export default SigninPage
