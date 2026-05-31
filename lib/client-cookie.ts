import Cookies from "js-cookie";

export const StoreCookies = (key: string, plainText: string) => {
    Cookies.set(key, plainText, { expires: 1 });
}

export const getCookie = (key: string) => {
    return Cookies.get(key);
}

export const removeCookies = (key: string) => {
    Cookies.remove(key);
}