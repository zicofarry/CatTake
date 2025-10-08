document.addEventListener('DOMContentLoaded', () => {

    // === Elemen untuk Form Dinamis ===
    const strayCatBtn = document.getElementById('stray-cat-btn');
    const lostCatBtn = document.getElementById('lost-cat-btn');
    const ownerNameField = document.getElementById('owner-name-field');

    // === Elemen untuk Modal Peta ===
    const mapButton = document.getElementById('map-button');
    const mapModal = document.getElementById('map-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const locationInput = document.getElementById('lokasi');
    const selectLocationBtn = document.querySelector('.select-location-btn');


    // === Event Listener untuk Form Dinamis ===

    lostCatBtn.addEventListener('click', () => {
        ownerNameField.style.display = 'block';
        lostCatBtn.classList.add('active');
        strayCatBtn.classList.remove('active');
    });

    strayCatBtn.addEventListener('click', () => {
        ownerNameField.style.display = 'none';
        strayCatBtn.classList.add('active');
        lostCatBtn.classList.remove('active');
    });


    // === Logika dan Event Listener untuk Modal Peta ===

    const openModal = () => {
        mapModal.classList.add('show');
    };

    const closeModal = () => {
        mapModal.classList.remove('show');
    };

    mapButton.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    mapModal.addEventListener('click', (event) => {
        if (event.target === mapModal) {
            closeModal();
        }
    });

    selectLocationBtn.addEventListener('click', () => {
        locationInput.value = "Lokasi Dipilih dari Peta (Contoh)";
        closeModal();
    });

});