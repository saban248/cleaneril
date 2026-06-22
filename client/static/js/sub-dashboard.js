function switchManagerTab(panelId) {
    document.querySelectorAll('.manager-panel').forEach(panel => {
        panel.classList.toggle('show', panel.id === panelId);
    });

    document.querySelectorAll('.manager-tabs .reports-tab').forEach(tab => {
        tab.classList.toggle('selected', tab.dataset.panel === panelId);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    switchManagerTab('manager-overview');
});
