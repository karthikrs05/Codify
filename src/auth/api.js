export async function apiFetch(path, { token, ...options } = {}) {
  const res = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const error = new Error(data?.error || 'request_failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

