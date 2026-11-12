'use client';

import { useRef, useState } from 'react';
import { EMAIL } from '@/lib/i18n';

type Labels = {
  formHeading: string; formName: string; formEmail: string; formMessage: string;
  send: string; sending: string; sent: string; sentThanks: string; sendFail: string;
};
type State = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm({ labels: l }: { labels: Labels }) {
  const [state, setState] = useState<State>('idle');
  const busy = useRef(false); // guards double clicks before React re-renders

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (busy.current || state === 'sent') return;
    const data = new FormData(form);
    if (String(data.get('_honey') || '')) return;
    const name = String(data.get('name') || '').trim();
    const from = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !from || !message) return;

    busy.current = true;
    setState('sending');
    try {
      const res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(EMAIL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, email: from, message, _replyto: from,
          _subject: 'Contacto — ' + name, _captcha: 'false', _template: 'table',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false || json.success === 'false') throw new Error('formsubmit');
      setState('sent');
    } catch {
      setState('error');
    } finally {
      busy.current = false;
    }
  }

  const label = state === 'sending' ? l.sending : state === 'sent' ? l.sent : l.send;
  return (
    <form className={`form form--${state}`} onSubmit={submit} noValidate={false}>
      <h3 className="sr-only">{l.formHeading}</h3>
      <input className="form__trap" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="field">
        <span className="eyebrow">{l.formName}</span>
        <input type="text" name="name" autoComplete="name" required maxLength={120} />
      </label>
      <label className="field">
        <span className="eyebrow">{l.formEmail}</span>
        <input type="email" name="email" autoComplete="email" inputMode="email" required maxLength={254} />
      </label>
      <label className="field">
        <span className="eyebrow">{l.formMessage}</span>
        <textarea name="message" rows={4} required maxLength={4000} enterKeyHint="send" />
      </label>
      <div className="form__foot">
        <button className="btn btn--solid form__submit" type="submit" disabled={state === 'sending' || state === 'sent'}>
          {label}
        </button>
        <span className="form__progress" aria-hidden="true" />
      </div>
      <p className={`form__status${state === 'error' ? ' form__status--error' : ''}`} aria-live="polite">
        {state === 'sent' ? l.sentThanks : state === 'error' ? l.sendFail : ''}
      </p>
    </form>
  );
}
