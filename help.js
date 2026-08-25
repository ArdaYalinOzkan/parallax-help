/* ==============================================================
   The two things the guides do on their own
   ==============================================================
   Copy buttons, and drawers that keep one open at a time. Both are
   small enough that the pages would work without them — the code is
   still selectable, the drawers still open — which is the level of
   dependence a page of instructions ought to have on its script.
   ============================================================== */

(function () {
    'use strict';

    /* ---- copy buttons ------------------------------------------
       The clipboard needs a secure context, which the site has. Where
       it is refused anyway the button says so rather than pretending
       it worked, and the text is still there to select by hand. */

    function phrase(key, fallback) {
        if (window.parallaxI18n && typeof window.parallaxI18n.t === 'function') {
            return window.parallaxI18n.t(key) || fallback;
        }
        return fallback;
    }

    document.querySelectorAll('[data-copy]').forEach(function (btn) {
        var block = btn.closest('.snippet') || btn.closest('.repo');
        var code = block && block.querySelector('code');
        if (!code) return;

        var timer;
        function say(text, done) {
            btn.textContent = text;
            btn.dataset.done = done ? '1' : '0';
            clearTimeout(timer);
            timer = setTimeout(function () {
                btn.textContent = phrase('COPY', 'Copy');
                btn.dataset.done = '0';
            }, 1800);
        }

        btn.addEventListener('click', function () {
            navigator.clipboard.writeText(code.textContent).then(
                function () { say(phrase('COPIED', 'Copied'), true); },
                function () { say(phrase('COPY_FAIL', 'Select it'), false); }
            );
        });
    });

    /* Drawers open and close on their own and stay open together:
       somebody comparing the .deb instructions with the AppImage ones
       should not have to keep one of them shut. */

    /* A link to a drawer opens it. Landing on #d-appimage and finding
       everything shut is a dead end, and people do share these links. */
    if (location.hash) {
        var hedef = document.querySelector(location.hash);
        if (hedef && hedef.tagName === 'DETAILS') {
            hedef.open = true;
            hedef.scrollIntoView({ block: 'start' });
        }
    }

    /* When the language changes, whatever a copy button is currently
       saying is drawn again — the i18n table cannot reach text a
       script wrote. */
    document.addEventListener('parallax:lang', function () {
        document.querySelectorAll('[data-copy]').forEach(function (btn) {
            if (btn.dataset.done !== '1') btn.textContent = phrase('COPY', 'Copy');
        });
    });
})();
