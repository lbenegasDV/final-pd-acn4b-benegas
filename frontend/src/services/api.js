const API_URL = 'http://localhost:4000/api';

async function handleResponse(response) {
  const contentType = response.headers.get('Content-Type');
  const isJSON = contentType && contentType.includes('application/json');

  let data = null;
  try {
    data = isJSON ? await response.json() : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || `Error ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}


// =====================
// Auth
// =====================
export async function loginRequest(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function registerRequest(nombre, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password })
  });
  return handleResponse(res);
}

// =====================
// Salas
// =====================
export async function getSalasRequest() {
  const res = await fetch(`${API_URL}/salas`);
  return handleResponse(res);
}

export async function getSalaByIdRequest(id) {
  const res = await fetch(`${API_URL}/salas/${id}`);
  return handleResponse(res);
}

// =====================
// Reservas
// =====================
export async function getReservasRequest() {
  const res = await fetch(`${API_URL}/reservas`);
  return handleResponse(res);
}

export async function getReservaByIdRequest(id) {
  const res = await fetch(`${API_URL}/reservas/${id}`);
  return handleResponse(res);
}

/**
 * reserva puede incluir:
 * - salaId (cuando elegís de la lista)
 * - salaNombre (cuando ingresás manual)
 * backend valida y resuelve el nombre real si salaId existe
 */
export async function createReservaRequest(token, reserva) {
  const res = await fetch(`${API_URL}/reservas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(reserva)
  });
  return handleResponse(res);
}

export async function updateReservaRequest(token, id, payload) {
  const res = await fetch(`${API_URL}/reservas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  // Reusamos tu manejador estándar
  return handleResponse(res);
}



export async function deleteReservaRequest(token, id) {
  const res = await fetch(`${API_URL}/reservas/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return handleResponse(res);
}
