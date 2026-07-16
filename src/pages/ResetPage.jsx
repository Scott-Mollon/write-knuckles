import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, appUrl } from '../clients/supabase'
import { evaluatePassword, formatAuthPasswordError } from '../lib/auth/passwordPolicy'
import Input from '../components/Input'
import Button from '../components/Button'
import Divider from '../components/Divider'
import Password from '../components/Password'
import './ResetPage.scss'

const PAGE_STATES = {
  FORGOT: 0,
  RESET: 1,
  SENT: 2,
  SUCCESS: 3,
}

const HELP = {
  0: 'Enter your email and click Send Reset Instructions. If we have an account with the provided email you will receive reset instructions at that address.',
  1: 'Enter your new password and click Reset.',
}

const ResetPage = () => {
  const [searchParams] = useSearchParams()
  const [pageMode, setPageMode] = useState(PAGE_STATES.FORGOT)
  const [errorMessage, setErrorMessage] = useState(null)
  const [pageWorking, setPageWorking] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const passwordOk = evaluatePassword(password).ok

  useEffect(() => {
    const mode = searchParams.get('mode')
    setPageMode(mode === 'reset' ? PAGE_STATES.RESET : PAGE_STATES.FORGOT)
  }, [searchParams])

  const sendReset = async () => {
    setErrorMessage(null)
    setPageWorking(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/reset?mode=reset`,
      })

      if (error) {
        setErrorMessage(error.message)
      } else {
        setPageMode(PAGE_STATES.SENT)
      }
    } catch {
      setErrorMessage('An error was encountered while sending the reset instructions.')
    }

    setPageWorking(false)
  }

  const reset = async () => {
    setErrorMessage(null)
    setPageWorking(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setErrorMessage(formatAuthPasswordError(error))
      } else {
        setPageMode(PAGE_STATES.SUCCESS)
      }
    } catch {
      setErrorMessage('An error was encountered while resetting your password.')
    }

    setPageWorking(false)
  }

  return (
    <div className="centered-page reset-page">
      {pageMode === PAGE_STATES.FORGOT && (
        <Input
          type="email"
          classNames="reset-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          disabled={pageWorking}
        />
      )}
      {pageMode === PAGE_STATES.RESET && (
        <Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pageWorking}
          showRequirements
          autoComplete="new-password"
        />
      )}

      {pageMode === PAGE_STATES.FORGOT && (
        <Button onClick={sendReset} disabled={pageWorking}>
          Send Reset Instructions
        </Button>
      )}
      {pageMode === PAGE_STATES.RESET && (
        <Button onClick={reset} disabled={pageWorking || !passwordOk}>
          Reset
        </Button>
      )}

      {pageMode === PAGE_STATES.SENT && (
        <div className="reset-confirm">
          <div className="confirm-header">Please Check Your Email</div>
          <div className="confirm-text">
            If the email you entered is associated with a Bronze Knuckles account,
            an email containing a link to reset your password has been sent.
          </div>
        </div>
      )}

      {pageMode === PAGE_STATES.SUCCESS && (
        <div className="reset-confirm">
          <div className="confirm-header">Password Reset</div>
          <div className="confirm-text">
            Your password has been reset. Please <Link to="/signin">Sign in</Link>.
          </div>
        </div>
      )}

      {errorMessage && <div className="signin-error">{errorMessage}</div>}

      <div className="page-help">{HELP[pageMode]}</div>

      <Divider />

      <div className="signin-footer">
        <Link to="/signin">Sign in</Link>
        <div>
          <Link to="/">back</Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPage
