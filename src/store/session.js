

export const setSession = (payload) => {
    const session = getSession();

    localStorage.setItem("session", JSON.stringify({ ...session, ...payload }));
}

export const getSession = () => {
    const txtPayload = localStorage.getItem("session");
    return JSON.parse(txtPayload);
}

export const destroySession = () => {
    localStorage.removeItem("session");
}