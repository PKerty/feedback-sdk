import type { UserStorage } from "../../domain/ports";

export class LocalUserStorageAdapter implements UserStorage {
    private readonly USER_KEY = "fdbk_user_id";
    private readonly SPAM_KEY = "fdbk_last_sent";

    getUserId(): string {
        let id = localStorage.getItem(this.USER_KEY);
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(this.USER_KEY, id);
        }
        return id;
    }

    isRateLimited(cooldownMs: number): boolean {
        const last = localStorage.getItem(this.SPAM_KEY);
        if (!last) return false;
        return Date.now() - parseInt(last, 10) < cooldownMs;
    }

    recordSubmission(): void {
        localStorage.setItem(this.SPAM_KEY, Date.now().toString());
    }
}
