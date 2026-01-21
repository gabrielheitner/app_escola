'use client'

import { useActionState } from 'react'
import { login } from './actions'
import styles from './login.module.css'

const initialState = {
  error: '',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>Welcome Back</h1>
          <p>Sign in to your school dashboard</p>
        </div>

        <form action={formAction} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              placeholder="admin@school.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>
              {state.error}
            </div>
          )}

          <button disabled={isPending} className={`btn btn-primary ${styles.wFull}`}>
            {isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
