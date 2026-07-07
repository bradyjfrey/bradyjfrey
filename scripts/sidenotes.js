/* Sidenote marker highlight.
   Inline footnote markers link to the endnote list (#fnN), which is hidden
   on desktop where notes render as margin sidenotes (#snN) instead. When the
   sidenote is visible, intercept the click and flash the margin note rather
   than jumping to a hidden anchor. On mobile the sidenote is hidden, so the
   default jump to the visible endnote proceeds untouched. */
document.querySelectorAll('.sidenote-ref').forEach(function (ref) {
    ref.addEventListener('click', function (e) {
        var href = ref.getAttribute('href') || '';
        var sn = document.getElementById(href.replace('#fn', 'sn'));
        if (!sn || getComputedStyle(sn).display === 'none') return;
        e.preventDefault();
        sn.classList.remove('is-hit');
        void sn.offsetWidth; /* restart the flash if re-clicked */
        sn.classList.add('is-hit');
        setTimeout(function () { sn.classList.remove('is-hit'); }, 1600);
    });
});
