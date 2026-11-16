import { useState } from 'react';

interface PasswordFieldProps {
  id: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  hint?: string;
}

export function PasswordField({ id, label, autoComplete, hint }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <label htmlFor={id}>{label}</label>
        <button type="button" className="button-link" style={{ fontSize: '0.84rem' }} onClick={() => setVisible(!visible)}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      <input id={id} name={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete} required />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
