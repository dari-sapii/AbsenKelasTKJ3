document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('attendance-form');
  const list = document.getElementById('attendance-list');
  const emptyState = document.getElementById('empty-state');

  const countHadir = document.getElementById('count-hadir');
  const countIzin = document.getElementById('count-izin');
  const countSakit = document.getElementById('count-sakit');
  const countAlpha = document.getElementById('count-alpha');

  const SHEET_URL = "https://script.google.com/macros/s/AKfycbyPBj6M3qc2KNrYK81Mbgx6CD7efSpbBnds66_Qq70aaj1Xm9SNiVhSgYpuTi1pAM2zzg/exec";

  // ATUR JAM ABSEN DISINI
  const JAM_MULAI = 6;      // Jam 6 pagi
  const MENIT_MULAI = 25;   // 6:30 AM
  const JAM_SELESAI = 7;    // Jam 8 pagi
  const MENIT_SELESAI = 15;  // 8:00 AM

  let data = [];

  function render() {
    list.innerHTML = '';
    list.appendChild(emptyState);

    if (data.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }

    let stat = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };

    data.forEach(item => {
      stat[item.status]++;

      const div = document.createElement('div');
      div.className = 'rounded-xl p-4 shadow-lg flex justify-between items-center';
      div.style.background = '#f8fafc';

      div.innerHTML = `
        <div>
          <div class="font-semibold">${item.nama}</div>
          <div class="text-sm text-gray-500">${item.kelas} • ${item.waktu}</div>
        </div>
        <span class="font-medium">${item.status}</span>
      `;

      list.appendChild(div);
    });

    countHadir.textContent = stat.Hadir;
    countIzin.textContent = stat.Izin;
    countSakit.textContent = stat.Sakit;
    countAlpha.textContent = stat.Alpha;
  }

  // FUNGSI CEK WAKTU ABSEN
  function cekWaktuAbsen() {
    const now = new Date();
    const jamSekarang = now.getHours();
    const menitSekarang = now.getMinutes();

    const waktuSekarang = jamSekarang * 60 + menitSekarang;
    const waktuMulai = JAM_MULAI * 60 + MENIT_MULAI;
    const waktuSelesai = JAM_SELESAI * 60 + MENIT_SELESAI;

    if (waktuSekarang < waktuMulai) {
      const jamMulai = String(JAM_MULAI).padStart(2, '0');
      const menitMulai = String(MENIT_MULAI).padStart(2, '0');
      return `WARNING! Absen buka pada jam ${jamMulai}:${menitMulai}`;
    }

    if (waktuSekarang > waktuSelesai) {
      const jamSelesai = String(JAM_SELESAI).padStart(2, '0');
      const menitSelesai = String(MENIT_SELESAI).padStart(2, '0');
      return `WARNING! Absen sudah tutup pada jam ${jamSelesai}:${menitSelesai}`;
    }

    return null; // Waktu OK
  }

  // AMBIL DATA SAAT LOAD
  fetch(SHEET_URL)
    .then(r => r.json())
    .then(res => {
      data = res;
      render();
    });

  // SIMPAN DATA
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // CEK WAKTU DULU
    const errorWaktu = cekWaktuAbsen();
    if (errorWaktu) {
      alert('⚠️ ' + errorWaktu);
      return;
    }

    const nama = document.getElementById('nama').value.trim();
    const kelas = document.getElementById('kelas').value;
    const statusEl = document.querySelector('input[name="status"]:checked');

    if (!nama || !kelas || !statusEl) {
      alert('Isi semua field dulu!');
      return;
    }

    const now = new Date();

    const item = {
      nama,
      kelas,
      status: statusEl.value,
      waktu: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    data.push(item);
    render();
    form.reset();

    fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify(item)
    })
    .then(() => {
      alert('✅ Absen berhasil disimpan!');
    })
    .catch(() => {
      alert('⚠️ Gagal menyimpan ke server');
    });
  });

});
