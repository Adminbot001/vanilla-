// ⚠️ ЗАМЕНИТЕ на публичный адрес из playit.gg или ваш домен
const SERVER_ADDRESS = "vanilla+.playit.playit.pub";

const els = {
    badge:         document.getElementById("state-badge"),
    badgeText:     document.querySelector("#state-badge .badge-text"),
    playersOnline: document.getElementById("players-online"),
    playersMax:    document.getElementById("players-max"),
    ping:          document.getElementById("ping"),
    version:       document.getElementById("version"),
    ip:            document.getElementById("server-ip"),
    list:          document.getElementById("player-list"),
    copyBtn:       document.getElementById("copy-btn"),
    copyBtnText:   document.querySelector("#copy-btn .btn-text"),
};

els.ip.textContent = SERVER_ADDRESS;

/* Плавный счётчик */
function animateNumber(el, target, duration = 700) {
    const start = parseInt(el.textContent, 10) || 0;
    if (start === target) { el.textContent = target; return; }
    const startTime = performance.now();

    function tick(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(start + (target - start) * eased);
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function setBadge(state, text) {
    els.badge.className = `badge ${state}`;
    els.badgeText.textContent = text;
}

function setOffline(msg = "Оффлайн") {
    setBadge("offline", msg);
    animateNumber(els.playersOnline, 0);
    els.playersMax.textContent = "0";
    els.ping.textContent = "—";
    els.version.textContent = "—";
    els.list.innerHTML = '<li class="muted">Сервер недоступен</li>';
}

async function updateStatus() {
    try {
        const url = `https://api.mcsrvstat.us/3/${encodeURIComponent(SERVER_ADDRESS)}`;
        const res = await fetch(url);
        const d = await res.json();

        if (!d.online) { setOffline(); return; }

        setBadge("online", "Онлайн");
        animateNumber(els.playersOnline, d.players?.online ?? 0);
        els.playersMax.textContent = d.players?.max ?? 0;
        els.ping.textContent      = d.debug?.ping ?? "—";
        els.version.textContent   = d.version ?? "—";

        const names = (d.players?.list || [])
            .map(p => (typeof p === "string" ? p : p.name))
            .filter(Boolean);

        if (!names.length) {
            els.list.innerHTML = '<li class="muted">Никого нет в списке</li>';
            return;
        }

        els.list.innerHTML = names.map((name, i) => `
            <li style="animation-delay:${i * 0.05}s">
                <img src="https://mc-heads.net/avatar/${encodeURIComponent(name)}/28" alt="">
                ${name}
            </li>
        `).join("");
    } catch {
        setOffline("Нет связи");
    }
}

els.copyBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(SERVER_ADDRESS);
        els.copyBtn.classList.add("copied");
        els.copyBtnText.textContent = "Скопировано!";
        setTimeout(() => {
            els.copyBtn.classList.remove("copied");
            els.copyBtnText.textContent = "Скопировать";
        }, 1600);
    } catch {
        els.copyBtnText.textContent = "Ошибка";
    }
});

updateStatus();
setInterval(updateStatus, 60_000);