/* ==============================================================
   The download page
   ==============================================================
   Somebody arrives here from a button that said "Download". So the
   download has to actually begin — automatically, without another
   click — and the page's job is the part that comes after: what the
   file is and what to do with it.

   Which file depends on the system they are on, and can be forced
   with ?p=windows or ?p=linux for anyone arriving by link.
   ============================================================== */

(function () {
    'use strict';

    const REPO = 'ArdaYalinOzkan/parallax-launcher';
    const params = new URLSearchParams(location.search);

    const asked = (params.get('p') || '').toLowerCase();
    const platform = (asked === 'windows' || asked === 'linux') ? asked
        : (/Windows/i.test(navigator.userAgent) ? 'windows' : 'linux');

    const el = (id) => document.getElementById(id);
    const show = (id) => { const n = el(id); if (n) n.classList.remove('hidden'); };
    const setText = (id, t) => { const n = el(id); if (n && t) n.textContent = t; };

    show(platform === 'windows' ? 'stepsWindows' : 'stepsLinux');

    const MB = (n) => (n / 1048576).toFixed(0) + ' MB';

    async function begin() {
        let asset = null, version = '';

        try {
            const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
                headers: { Accept: 'application/vnd.github+json' }
            });
            if (r.ok) {
                const rel = await r.json();
                version = String(rel.tag_name || '').replace(/^v/, '');
                const want = platform === 'windows' ? '.exe' : '.appimage';
                asset = (rel.assets || []).find(a => a.name.toLowerCase().endsWith(want));
            }
        } catch (e) {
            /* Offline, or a rate limit. The button below still points at
               the releases page, which is somewhere useful to land. */
        }

        if (!asset) {
            setText('dlEyebrow', 'Download');
            setText('dlHeading', 'Pick your file.');
            setText('dlLede', 'The download could not be started automatically. The button below ' +
                'opens the releases page, where every file for every system is listed.');
            setText('dlManualLabel', 'Open the releases page');
            return;
        }

        const link = el('dlManual');
        if (link) link.href = asset.browser_download_url;
        setText('dlManualMeta', MB(asset.size));
        setText('dlEyebrow', version ? 'Downloading v' + version : 'Downloading');
        setText('dlHeading', platform === 'windows'
            ? 'Your installer is downloading.'
            : 'Your AppImage is downloading.');
        setText('dlLede', asset.name + ' — ' + MB(asset.size) +
            '. It should begin on its own in a moment; if it does not, the button below starts it.');

        /* Started with a hidden iframe rather than by navigating: a
           navigation would replace this page, and the point of the
           page is to still be here afterwards with the instructions
           on it. */
        const frame = document.createElement('iframe');
        frame.style.display = 'none';
        frame.src = asset.browser_download_url;
        document.body.appendChild(frame);
    }

    begin();
})();
