export interface AppConfig {
    jwtSecret: string;
    jwtExpiresIn: string;
}

export function getConfig(): AppConfig {
    return {
        jwtSecret: process.env.JWT_SECRET ?? "change-me",
        jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    };
}
