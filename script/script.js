document.addEventListener('DOMContentLoaded', function() {
    const strayButton = document.getElementById('btn-stray');
    const lostButton = document.getElementById('btn-lost');
    const ownerNameGroup = document.querySelector('.owner-name-group');

    // Fungsi untuk menampilkan form 'Kucing Liar'
    function showStrayForm() {
        strayButton.classList.add('active');
        lostButton.classList.remove('active');
        ownerNameGroup.style.display = 'none'; // Sembunyikan field nama pemilik
    }

    // Fungsi untuk menampilkan form 'Kucing Hilang'
    function showLostForm() {
        lostButton.classList.add('active');
        strayButton.classList.remove('active');
        ownerNameGroup.style.display = 'block'; // Tampilkan field nama pemilik
    }

    // Event listener untuk setiap tombol
    strayButton.addEventListener('click', showStrayForm);
    lostButton.addEventListener('click', showLostForm);

    // Atur kondisi awal saat halaman pertama kali dibuka
    showStrayForm();
});