/* ==============================================================
   The download page
   ==============================================================
   Somebody arriving here from a button that said "Download" expects
   the download to begin without another click, and it does — but only
   for them. That button carries ?start=1; the guide list on the help
   index does not. Reading about installing should not put a hundred
   megabytes on somebody's disk, which is what happened before.

   Without it the page is simply the guide it always was, with a button
   that starts the download when it is asked to.

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

    /* The one thing that separates a download from a page about
       downloads. */
    const autoStart = params.get('start') === '1';

    const el = (id) => document.getElementById(id);
    const show = (id) => { const n = el(id); if (n) n.classList.remove('hidden'); };
    const setText = (id, t) => {
        const n = el(id);
        if (!n || !t) return;
        // Written by hand here, so the language engine must not put its
        // own version back on the next redraw.
        n.removeAttribute('data-i18n');
        n.textContent = t;
    };

    /* These lines are written by this script rather than by the page,
       so they have to reach the same table the rest of the site uses.
       They were plain English before, which meant a page that was
       otherwise Korean announced its download in English. */
    const t = (key, fallback) => {
        const table = (window.PARALLAX_STRINGS_ACTIVE) || {};
        return table[key] || fallback;
    };

    show(platform === 'windows' ? 'stepsWindows' : 'stepsLinux');

    const MB = (n) => (n / 1048576).toFixed(0) + ' MB';

    let asset = null, version = '';
    /* Nothing is written until the release has been looked up. The
       language engine paints once as the page loads, and painting then
       would put the failure text on screen for a moment before the
       answer arrived. */
    let settled = false;

    async function begin() {

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

        settled = true;
        paint();

        if (!asset) return;

        if (!autoStart) return;

        /* Started with a hidden iframe rather than by navigating: a
           navigation would replace this page, and the point of the
           page is to still be here afterwards with the instructions
           on it. */
        const frame = document.createElement('iframe');
        frame.style.display = 'none';
        frame.src = asset.browser_download_url;
        document.body.appendChild(frame);
    }

    /* The tab title follows the heading, which this page writes from
       script rather than from the markup — so it is set here rather
       than by the shared helper the other pages use. */
    function basligiYaz() {
        const h1 = el('dlHeading');
        const metin = h1 && h1.textContent.trim();
        if (metin) document.title = metin + ' — Parallax Launcher';
    }

    /* Redrawn whenever the language changes, since these lines are
       written here rather than carried by the page. */
    function paint() {
        if (!settled) return;

        if (!asset) {
            setText('dlEyebrow', t('INS_LBL', 'Download'));
            setText('dlHeading', t('INS_NO_ASSET_H', 'Choose a file'));
            setText('dlLede', t('INS_NO_ASSET_P', 'The download could not be started ' +
                'automatically. The button below opens the releases page, which lists every ' +
                'file for every system.'));
            setText('dlManualLabel', t('INS_OPEN_RELEASES', 'Open the releases page'));
            basligiYaz();
            return;
        }

        const link = el('dlManual');
        if (link) link.href = asset.browser_download_url;
        setText('dlManualMeta', MB(asset.size));

        if (!autoStart) {
            // Arrived from the guides, not from a Download button. The
            // file is identified and one click away, and nothing has
            // been fetched.
            setText('dlEyebrow', version ? 'v' + version : t('INS_LBL', 'Download'));
            setText('dlHeading', t('INS_GUIDE_H', 'Downloading and installing'));
            setText('dlLede', asset.name + ' — ' + MB(asset.size) + '. ' +
                t('INS_GUIDE_P', 'The button below starts the download. The steps that follow ' +
                    'explain what to do once the file has arrived.'));
            setText('dlManualLabel', t('INS_START', 'Start the download'));
            basligiYaz();
            return;
        }

        // Its own key rather than the plain label: the eyebrow reads as
        // a state here, and one word cannot be both in every language.
        const surer = t('INS_DOWNLOADING', 'Downloading');
        setText('dlEyebrow', version ? surer + ' v' + version : surer);
        setText('dlHeading', platform === 'windows'
            ? t('INS_H_WIN', 'The installer is downloading')
            : t('INS_H_LNX', 'The AppImage is downloading'));
        setText('dlLede', asset.name + ' — ' + MB(asset.size) + '. ' +
            t('INS_STARTED_P', 'The download should begin shortly. If it does not, use the ' +
                'button below.'));
        // Every branch sets this, so none of them can leave another
        // branch's wording behind.
        setText('dlManualLabel', t('INS_MANUAL', 'Download manually'));
        basligiYaz();
    }

    document.addEventListener('parallax:lang', paint);

    begin();
})();
