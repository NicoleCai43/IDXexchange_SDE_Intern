async function requestJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      message = errorBody.message || errorBody.error || message;
    } catch {
      // Keep the generic status message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export function fetchProperties(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return requestJson(`/api/properties${queryString ? `?${queryString}` : ""}`);
}

export function fetchPropertyDetail(id) {
  return requestJson(`/api/properties/${encodeURIComponent(id)}`);
}
