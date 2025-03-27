async function getSession() {
    const response = await fetch (
        `${import.meta.env.VITE_API_URL}/_allauth/browser/v1/auth/session`,
        {
            credentials: "include",
        },
    );

    const data = await response.json();
    const okCodes = [200, 401, 410];
    if (okCodes.indexOf(data.status) === -1) {
        throw new Error(JSON.stringify(data));
    }

    return {isAuthenticated: data.meta.isAuthenticated}
}

export const sessionsApi = { getSession };