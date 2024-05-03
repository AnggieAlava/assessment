

export const setSession = (payload) => {
    const session = getSession();

    sessionStorage.setItem("session", JSON.stringify({ ...session, ...payload }));
}

export const getSession = () => {
    const txtPayload = sessionStorage.getItem("session");
    return JSON.parse(txtPayload);
}

export const destroySession = () => {
    sessionStorage.removeItem("session");
}