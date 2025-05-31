export class Storage {
    public static getAccessToken(): string | null {
        return localStorage.getItem("REATICINDUSTRY_ATKN") || null;
    }

    public static setAccessToken(value: string) {
        localStorage.setItem("REATICINDUSTRY_ATKN", value);
    }
}
