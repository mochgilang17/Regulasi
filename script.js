const penaltyTableBody = document.querySelector('#penaltyTable tbody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const noResults = document.getElementById('noResults');

// Elemen Splash Screen dan Konten Utama
const splashScreen = document.getElementById('splashScreen');
const mainContent = document.querySelectorAll('.hidden-content');

// Elemen Modal Detail (Pelanggaran Biasa)
const modal = document.getElementById("detailModal");
const closeModalButton = document.querySelector(".close-button");
const modalTitle = document.getElementById("modalTitle");
const modalCode = document.getElementById("modalCode");
const modalCategory = document.getElementById("modalCategory");
const modalClassification = document.getElementById("modalClassification");
const modalPenalty = document.getElementById("modalPenalty");
const modalFine = document.getElementById("modalFine");
const modalDetailsList = document.getElementById("modalDetailsList");

// Elemen Modal Denda Level BARU
const levelFineModal = document.getElementById('levelFineModal');
const closeLevelFineModalButton = document.getElementById('closeLevelFineModal');

let dataPelanggaran = [];

// Data Tabel Denda Level BARU
const FINE_LEVEL_DATA = {
    MOTORCYCLES: [325, 650, 975, 1300, 1625, 1950, 2275, 2600, 2925, 3250, 3575, 3900, 4225, 4550, 4875, 5200, 5525, 5850, 6175, 6500],
    CARS: [650, 1300, 1950, 2600, 3250, 3900, 4550, 5200, 5850, 6500, 7150, 7800, 8450, 9100, 9750, 10400, 11050, 11700, 12350, 13000],
    COMMERCIAL: [488, 975, 1463, 1950, 2438, 2925, 3413, 3900, 4388, 4875, 5363, 5850, 6338, 6825, 7313, 7800, 8288, 8775, 9263, 9750],
    SPORT: [813, 1625, 2438, 3250, 4063, 4875, 5688, 6500, 7313, 8125, 8938, 9750, 10563, 11375, 12188, 13000, 13813, 14625, 15438, 16250]
};

// Fungsi untuk format angka menjadi mata uang
function formatCurrency(number) {
    if (typeof number === 'number') {
        // Menggunakan toLocaleString untuk format angka dengan pemisah ribuan
        return '$' + number.toLocaleString('en-US');
    }
    return number;
}


// --- Fungsi untuk Mengambil Data dari JSON dan Menghilangkan Splash Screen ---
async function loadData() {
    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        dataPelanggaran = await response.json();
        
        populateCategoryFilter();
        displayPenalties(dataPelanggaran);
        
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
        const matchesSearch = (
            penalty.kode.toLowerCase().includes(searchTerm) ||
            penalty.nama.toLowerCase().includes(searchTerm) ||
            penalty.kategori.toLowerCase().includes(searchTerm)
        );

        const matchesCategory = selectedCategory === "" || penalty.kategori === selectedCategory;

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


// Fungsi untuk Mengisi dan Menampilkan Modal Tabel Denda Level BARU
function populateAndShowLevelFineModal() {
    const tableIds = {
        MOTORCYCLES: 'motorcyclesTable',
        CARS: 'carsTable',
        COMMERCIAL: 'commercialTable',
        SPORT: 'sportTable'
    };

    for (const type in FINE_LEVEL_DATA) {
        const tableBody = document.querySelector(`#${tableIds[type]} tbody`);
        tableBody.innerHTML = '';
        
        FINE_LEVEL_DATA[type].forEach((fine, index) => {
            const row = tableBody.insertRow();
            const startLevel = (index * 5) + 1;
            const endLevel = (index * 5) + 5;
            
            row.innerHTML = `
                <td>Level ${startLevel}-${endLevel}</td>
                <td>${formatCurrency(fine)}</td>
            `;
        });
    }

    // Pastikan modal detail utama tersembunyi
    modal.style.display = "none";
    levelFineModal.style.display = "block";
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
        
        // **********************************************
        // LOGIKA PEMBUATAN TOMBOL DYNAMIC
        // **********************************************
        
        // Hapus konten modalFine sebelumnya untuk mencegah duplikasi tombol
        modalFine.innerHTML = ''; 
        
        const isLevelFine = penalty.denda.includes('Lihat Tabel Level');

        if (isLevelFine) {
            // 1. Tentukan teks yang tersisa. Kita perlu menghapus teks 'Lihat Tabel Level' 
            //    dan teks "(Motor/Mobil/Komersial/Sport)" jika ada.
            let remainingText = penalty.denda.replace('Lihat Tabel Level', '').trim();
            // Membersihkan sisa teks kurung yang mungkin ada di data.json
            remainingText = remainingText.replace(/\(Motor\/Mobil\/Komersial\/Sport\)/g, '').trim(); 
            
            
            // 2. Set teks denda (sisa teks)
            // Cek apakah ada teks yang tersisa setelah penghapusan
            if (remainingText) {
                modalFine.textContent = remainingText;
            } else {
                // Jika tidak ada teks tersisa, tambahkan placeholder ringan (opsional)
                modalFine.textContent = 'Denda ditentukan oleh Level kendaraan.';
            }

            // 3. Buat ELEMEN TOMBOL BARU
            const button = document.createElement('button');
            button.id = 'showLevelFineBtn';
            button.className = 'view-btn';
            button.style.marginLeft = '10px';
            button.textContent = 'Lihat Tabel';
            button.addEventListener('click', populateAndShowLevelFineModal);
            
            // 4. Masukkan tombol ke elemen Denda (modalFine)
            modalFine.appendChild(button);

        } else {
            // Jika denda normal, set textContent saja
            modalFine.textContent = penalty.denda;
        }


        modalDetailsList.innerHTML = '';
        penalty.detail.forEach(detailText => {
            const li = document.createElement('li');
            li.textContent = detailText;
            modalDetailsList.appendChild(li);
        });

        modal.style.display = "block";
        levelFineModal.style.display = "none";
    }
}


// --- Event Listeners dan Inisialisasi ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

searchInput.addEventListener('input', filterPenalties);
categoryFilter.addEventListener('change', filterPenalties); 

// Tutup Modal Detail Pelanggaran
closeModalButton.addEventListener('click', () => {
    modal.style.display = "none";
});

// Tutup Modal Denda Level BARU
closeLevelFineModalButton.addEventListener('click', () => {
    levelFineModal.style.display = "none";
});

// Tutup modal jika user mengklik di luar modal manapun
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
    if (event.target === levelFineModal) {
        levelFineModal.style.display = "none";
    }
});