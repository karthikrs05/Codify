import { useEffect, useRef, useState } from 'react';

export function useEmailDomainValidation(email) {
  const [state, setState] = useState({ status: 'idle', ok: null, details: null });
  const lastEmailRef = useRef('');

  useEffect(() => {
    const trimmed = String(email || '').trim();
    if (!trimmed || !trimmed.includes('@')) {
      setState({ status: 'idle', ok: null, details: null });
      lastEmailRef.current = trimmed;
      return;
    }

    lastEmailRef.current = trimmed;
    setState({ status: 'checking', ok: null, details: null });

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/email/validate?email=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (lastEmailRef.current !== trimmed) return;
        setState({ status: 'done', ok: Boolean(data.ok), details: data });
      } catch (e) {
        if (lastEmailRef.current !== trimmed) return;
        setState({ status: 'error', ok: null, details: null });
      }
    }, 450);

    return () => clearTimeout(t);
  }, [email]);

  return state;
}

