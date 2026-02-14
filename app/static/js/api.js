// API Helper - Thin fetch wrapper
const API = {
    tzOffset: new Date().getTimezoneOffset(),

    async get(url) {
        const sep = url.includes('?') ? '&' : '?';
        const res = await fetch(`${url}${sep}tz_offset=${this.tzOffset}`);
        if (res.status === 401) {
            window.location.href = '/auth/login';
            return null;
        }
        return res.json();
    },

    async post(url, body) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (res.status === 401) {
            window.location.href = '/auth/login';
            return null;
        }
        return res.json();
    },

    async postForm(url, formData) {
        const res = await fetch(url, {
            method: 'POST',
            body: formData
        });
        if (res.status === 401) {
            window.location.href = '/auth/login';
            return null;
        }
        return res.json();
    },

    async put(url, body) {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (res.status === 401) {
            window.location.href = '/auth/login';
            return null;
        }
        return res.json();
    },

    async delete(url) {
        const res = await fetch(url, { method: 'DELETE' });
        if (res.status === 401) {
            window.location.href = '/auth/login';
            return null;
        }
        return res.json();
    }
};
