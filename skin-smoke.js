// One effect for every occurrence: game, shop, case reel and reward popup.
(() => {
    function updateSmoke(img) {
        const match = (img.getAttribute('src') || '').match(/(?:^|\/)cat-(mask|boss)\.png(?:[?#].*)?$/);
        const isDog = /(?:^|\/)dog\.png(?:[?#].*)?$/.test(img.getAttribute('src') || '');
        let frame = img.parentElement;
        if (!frame) return;
        const wrapped = frame.classList.contains('smoke-sprite');
        if (!match && !isDog) {
            if (wrapped) frame.replaceWith(img);
            return;
        }
        if (!wrapped) {
            frame = document.createElement('span');
            frame.className = 'smoke-sprite';
            img.replaceWith(frame);
            frame.append(img);
            for (let i = 0; i < 11; i++) {
                const cloud = document.createElement('span');
                cloud.className = i === 0 ? 'skin-smoke-cloud' : 'aura-dust';
                cloud.setAttribute('aria-hidden', 'true');
                if (i) {
                    const angle = i / 10 * Math.PI * 2;
                    cloud.style.setProperty('--dust-x', (50 + Math.cos(angle) * 45) + '%');
                    cloud.style.setProperty('--dust-y', (50 + Math.sin(angle) * 40) + '%');
                    cloud.style.setProperty('--dust-drift', (Math.cos(angle) * 16) + 'px');
                    cloud.style.setProperty('--dust-delay', (-i * .37) + 's');
                    cloud.style.setProperty('--dust-size', (2 + i % 3) + 'px');
                }
                frame.append(cloud);
            }
        }
        frame.classList.toggle('smoke-boss', match?.[1] === 'boss');
        frame.classList.toggle('smoke-mask', match?.[1] === 'mask');
        frame.classList.toggle('smoke-dog', isDog);
        frame.hidden = img.hidden;
    }

    function scan(node) {
        if (node.nodeType !== 1) return;
        if (node.matches('img')) updateSmoke(node);
        node.querySelectorAll('img').forEach(updateSmoke);
    }

    scan(document.body);
    function scatter(event, burst) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const frame = event.target.querySelector('.smoke-sprite');
        if (!frame) return;
        const { dx = 0, dy = 0 } = event.detail || {};
        const distance = Math.hypot(dx, dy) || 1;
        const count = burst ? 12 : 5;
        // Bound the particle count even during very fast tapping.
        const old = [...frame.querySelectorAll('.aura-spark')];
        old.slice(0, Math.max(0, old.length + count - 24)).forEach(node => node.remove());
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 18 + Math.random() * 20;
            const x = burst ? Math.cos(angle) * radius : -dx / distance * radius;
            const y = burst ? Math.sin(angle) * radius - 12 : -dy / distance * radius - 10;
            const spark = document.createElement('span');
            spark.className = 'aura-spark';
            spark.setAttribute('aria-hidden', 'true');
            spark.style.left = (50 + Math.cos(angle) * 38) + '%';
            spark.style.top = (50 + Math.sin(angle) * 38) + '%';
            frame.append(spark);
            const animation = spark.animate([
                { opacity: 0, transform: 'translate(0, 0)' },
                { opacity: .85, offset: .15 },
                { opacity: 0, transform: `translate(${x}px, ${y}px)` }
            ], { duration: 800 + Math.random() * 500, easing: 'ease-out' });
            animation.onfinish = () => spark.remove();
            animation.oncancel = () => spark.remove();
        }
    }
    document.addEventListener('skin-aura-move', event => scatter(event, false));
    document.addEventListener('skin-aura-tap', event => scatter(event, true));
    new MutationObserver(records => {
        for (const record of records) {
            if (record.type === 'attributes' && record.target.matches('img')) {
                updateSmoke(record.target);
            } else if (record.type === 'childList') {
                record.addedNodes.forEach(scan);
            }
        }
    }).observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['src', 'hidden']
    });
})();
