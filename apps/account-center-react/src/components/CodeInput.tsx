import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

const LENGTH = 6;

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}

export function CodeInput({ value, onChange, invalid, disabled }: CodeInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, index) => value[index] ?? '');

  function focus(index: number) {
    inputs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();
  }

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, LENGTH));
  }

  function onInput(index: number, raw: string) {
    const typed = raw.replace(/\D/g, '');
    if (!typed) return setDigit(index, '');
    if (typed.length > 1) {
      onChange((digits.slice(0, index).join('') + typed).slice(0, LENGTH));
      return focus(index + typed.length);
    }
    setDigit(index, typed);
    focus(index + 1);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index]) focus(index - 1);
    if (event.key === 'ArrowLeft') focus(index - 1);
    if (event.key === 'ArrowRight') focus(index + 1);
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    focus(pasted.length);
  }

  return (
    <div className="code-input" role="group" aria-label="Verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={LENGTH}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          autoFocus={index === 0}
          onChange={(event) => onInput(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={onPaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
