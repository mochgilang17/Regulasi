const penaltyTableBody = document.querySelector('#penaltyTable tbody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const noResults = document.getElementById('noResults');

// Elemen Splash Screen dan Konten Utama
const splashScreen = document.getElementById('splashScreen');
const mainContent = document.querySelectorAll('.hidden-content');

// Elemen Modal
const modal = document.getElementById("detailModal");
// Memperbaiki DOM selector untuk tombol close
const closeModalButton = document.querySelector(".close-button");
const modalTitle = document.getElementById("modalTitle");
const modalCode = document.getElementById("modalCode");
const modalCategory = document.getElementById("modalCategory");
const modalClassification = document.getElementById("modalClassification");
const modalPenalty = document.getElementById("modalPenalty");
const modalFine = document.getElementById("modalFine");
const modalDetailsList = document.getElementById("modalDetailsList");

let dataPelanggaran = [];

// --- Fungsi untuk Mengambil Data dari JSON dan Menghilangkan Splash Screen ---
async function loadData() {
    try {
        const response = await fetch('data.json');
        
        // Cek jika response OK (200)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        dataPelanggaran = await response.json();
        
        populateCategoryFilter();
        displayPenalties(dataPelanggaran);
        
        // Menampilkan konten utama setelah data dimuat
        setTimeout(() => {
            splashScreen.style.opacity = 0;
            setTimeout(() => {
                splashScreen.style.display = 'none';
                mainContent.forEach(el => {
                    el.style.visibility = 'visible';
                    el.style.opacity = 1;
                });
            }, 500); 
        }, 1000); 
        
    } catch (error) {
        console.error('Gagal memuat data.json:', error);
        noResults.textContent = 'Gagal memuat data peraturan. Periksa file data.json Anda dan pastikan server lokal berjalan.';
        noResults.style.display = 'block';
        
        // Tetap sembunyikan splash screen dan tampilkan error
        splashScreen.style.opacity = 0;
        setTimeout(() => {
            splashScreen.style.display = 'none';
            mainContent.forEach(el => {
                el.style.visibility = 'visible';
                el.style.opacity = 1;
            });
        }, 500);
    }
}

// --- Fungsi untuk Mengisi Tabel ---
function displayPenalties(penalties) {
    penaltyTableBody.innerHTML = '';
    
    if (penalties.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    noResults.style.display = 'none';

    penalties.forEach(penalty => {
        const row = penaltyTableBody.insertRow();
        row.innerHTML = `
            <td>${penalty.kode}</td>
            <td>${penalty.nama}</td>
            <td>${penalty.kategori}</td>
            <td>${penalty.klasifikasi}</td>
            <td>${penalty.hukuman} / ${penalty.denda}</td>
            <td><button class="view-btn" data-kode="${penalty.kode}">View</button></td>
        `;
    });

    // Menambahkan event listener ke tombol 'View' yang baru dibuat
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const kode = event.target.dataset.kode;
            showPenaltyDetail(kode);
        });
    });
}

// --- Fungsi untuk Pencarian dan Filter ---
function filterPenalties() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = dataPelanggaran.filter(penalty => {
        // 1. Pencarian Teks (di Kode, Nama, dan Kategori)
        const matchesSearch = (
            penalty.kode.toLowerCase().includes(searchTerm) ||
            penalty.nama.toLowerCase().includes(searchTerm) ||
            penalty.kategori.toLowerCase().includes(searchTerm)
        );

        // 2. Filter Kategori (Harus cocok persis jika filter dipilih)
        const matchesCategory = selectedCategory === "" || penalty.kategori === selectedCategory;

        // Kombinasikan kedua filter
        return matchesSearch && matchesCategory;
    });

    displayPenalties(filtered);
}

// --- Fungsi untuk Mengisi Opsi Filter Kategori ---
function populateCategoryFilter() {
    const categories = [...new Set(dataPelanggaran.map(item => item.kategori))].sort();
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category; 
        categoryFilter.appendChild(option);
    });
}

// --- Fungsi untuk Menampilkan Detail Modal ---
function showPenaltyDetail(kode) {
    const penalty = dataPelanggaran.find(item => item.kode === kode);

    if (penalty) {
        modalTitle.textContent = penalty.nama;
        modalCode.textContent = penalty.kode;
        modalCategory.textContent = penalty.kategori;
        modalClassification.textContent = penalty.klasifikasi;
        modalPenalty.textContent = penalty.hukuman;
        modalFine.textContent = penalty.denda;

        modalDetailsList.innerHTML = '';
        penalty.detail.forEach(detailText => {
            const li = document.createElement('li');
            li.textContent = detailText;
            modalDetailsList.appendChild(li);
        });

        modal.style.display = "block";
    }
}

// --- Event Listeners dan Inisialisasi ---
document.addEventListener('DOMContentLoaded', () => {
    loadData(); // Mulai memuat data dan mengelola splash screen
});

// MEMPERBAIKI BUG 1: Mengubah nama fungsi yang salah di event listener
searchInput.addEventListener('input', filterPenalties);
categoryFilter.addEventListener('change', filterPenalties); 

// MEMPERBAIKI BUG 2: Menggunakan nama variabel yang benar (closeModalButton)
closeModalButton.addEventListener('click', () => {
    modal.style.display = "none";
});

// Tutup modal jika user mengklik di luar modal
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});