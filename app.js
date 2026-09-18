/*************************************************
 * FRONTEND SCAN LJK
 * TAHAP 3
 *************************************************/


/* ================================================
   URL APPS SCRIPT
================================================ */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxShf4TXA0aV_WuXLukFBIQ14uXhpE9ABbhiFtb0yQweFKMg263ORLfmf2XFDL1_RauVA/exec";


/* ================================================
   STATE APLIKASI
================================================ */

let currentUser = null;

let selectedExam = null;

let selectedStudent = null;


/* ================================================
   HELPER API
================================================ */

async function api(request) {

  try {

    const response = await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },

        body: JSON.stringify(request)
      }
    );

    const data =
      await response.json();

    return data;

  } catch (error) {

    console.error(error);

    return {
      success: false,
      message:
        "Tidak dapat terhubung ke server Apps Script"
    };

  }

}


/* ================================================
   TAMPILKAN PAGE
================================================ */

function showPage(pageId) {

  const pages =
    document.querySelectorAll(".page");

  pages.forEach(function(page) {

    page.style.display = "none";

  });

  const target =
    document.getElementById(pageId);

  if (target) {

    target.style.display = "block";

  }

  if (pageId === "ujianPage") {

    loadUjian();

  }

}


/* ================================================
   LOGIN
================================================ */

async function login() {

  const username =
    document
      .getElementById("username")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value
      .trim();

  const message =
    document.getElementById(
      "loginMessage"
    );

  if (!username || !password) {

    message.textContent =
      "Username dan password wajib diisi.";

    return;

  }

  message.textContent =
    "Memproses login...";


  const result = await api({

    action: "login",

    username: username,

    password: password

  });


  if (!result.success) {

    message.textContent =
      result.message;

    return;

  }


  currentUser =
    result.user;


  document
    .getElementById("userName")
    .textContent =
    currentUser.username;


  document
    .getElementById("logoutBtn")
    .style.display =
    "block";


  showPage("dashboardPage");

}


/* ================================================
   LOGOUT
================================================ */

function logout() {

  currentUser = null;

  selectedExam = null;

  selectedStudent = null;

  document
    .getElementById("logoutBtn")
    .style.display =
    "none";

  document
    .getElementById("username")
    .value = "";

  document
    .getElementById("password")
    .value = "";

  showPage("loginPage");

}


/* ================================================
   LOAD UJIAN
================================================ */

async function loadUjian() {

  const container =
    document.getElementById(
      "ujianList"
    );

  container.innerHTML =
    "<p>Memuat data ujian...</p>";


  const result = await api({

    action: "getUjian"

  });


  if (!result.success) {

    container.innerHTML =
      `<p class="student-error">
        ${result.message}
      </p>`;

    return;

  }


  if (!result.data ||
      result.data.length === 0) {

    container.innerHTML =
      "<p>Belum ada data ujian.</p>";

    return;

  }


  container.innerHTML = "";


  result.data.forEach(function(ujian) {

    const div =
      document.createElement("div");

    div.className =
      "exam-item";


    div.innerHTML = `

      <h3>
        ${escapeHtml(
          ujian.Mata_Pelajaran || "-"
        )}
      </h3>

      <p>
        <b>ID Ujian:</b>
        ${escapeHtml(
          ujian.ID_Ujian || "-"
        )}
      </p>

      <p>
        <b>Kelas:</b>
        ${escapeHtml(
          ujian.Kelas || "-"
        )}
      </p>

      <p>
        <b>Jumlah soal:</b>
        ${escapeHtml(
          ujian.Jumlah_Soal || "-"
        )}
      </p>

      <button
        class="primary-btn"
        onclick='pilihUjian(
          ${JSON.stringify(ujian)}
        )'>

        PILIH UJIAN

      </button>

    `;


    container.appendChild(div);

  });

}


/* ================================================
   PILIH UJIAN
================================================ */

function pilihUjian(ujian) {

  selectedExam = ujian;

  document
    .getElementById("selectedExam")
    .textContent =
    ujian.Mata_Pelajaran || "-";

  document
    .getElementById("selectedExamId")
    .textContent =
    ujian.ID_Ujian || "-";


  selectedStudent = null;

  document
    .getElementById("qrInput")
    .value = "";

  document
    .getElementById("studentResult")
    .innerHTML = "";

  document
    .getElementById("scanResult")
    .innerHTML = "";


  showPage("scanPage");

}


/* ================================================
   CARI SISWA
================================================ */

async function cariSiswa() {

  const kodeQR =
    document
      .getElementById("qrInput")
      .value
      .trim();

  const resultContainer =
    document.getElementById(
      "studentResult"
    );


  if (!kodeQR) {

    resultContainer.innerHTML =
      `<div class="student-error">
        Kode QR belum diisi.
      </div>`;

    return;

  }


  resultContainer.innerHTML =
    "<p>Mencari data siswa...</p>";


  const result = await api({

    action: "cariSiswa",

    kodeQR: kodeQR

  });


  if (!result.success) {

    selectedStudent = null;

    resultContainer.innerHTML =
      `<div class="student-error">
        ${escapeHtml(result.message)}
      </div>`;

    return;

  }


  selectedStudent =
    result.data;


  resultContainer.innerHTML = `

    <div class="student-card">

      <h3>
        ✓ Siswa ditemukan
      </h3>

      <p>
        <b>Nama:</b>
        ${escapeHtml(
          selectedStudent.Nama
        )}
      </p>

      <p>
        <b>NISN:</b>
        ${escapeHtml(
          selectedStudent.NISN
        )}
      </p>

      <p>
        <b>Kelas:</b>
        ${escapeHtml(
          selectedStudent.Kelas
        )}
      </p>

      <p>
        <b>Kode QR:</b>
        ${escapeHtml(
          selectedStudent.Kode_QR
        )}
      </p>

    </div>

  `;

}


/* ================================================
   SIMULASI SCAN
================================================ */

async function simulasiScan() {

  const resultContainer =
    document.getElementById(
      "scanResult"
    );


  if (!selectedExam) {

    alert(
      "Silakan pilih ujian terlebih dahulu."
    );

    return;

  }


  if (!selectedStudent) {

    alert(
      "Silakan scan/cari siswa terlebih dahulu."
    );

    return;

  }


  resultContainer.innerHTML =
    "<p>Memproses hasil scan...</p>";


  const jumlahSoal =
    Number(
      selectedExam.Jumlah_Soal
    ) || 5;


  /*
   * Simulasi jawaban.
   *
   * Nanti array ini akan digantikan
   * oleh hasil pembacaan OMR kamera.
   */

  const contohJawaban = [

    "A",
    "B",
    "A",
    "D",
    "",
    "C",
    "A",
    "E",
    "B",
    "D"

  ];


  const jawaban = [];


  for (
    let i = 1;
    i <= jumlahSoal;
    i++
  ) {

    let jawabanSiswa =
      contohJawaban[i - 1] || "";


    jawaban.push({

      noSoal: i,

      jawaban:
        jawabanSiswa

    });

  }


  /*
   * Cek apakah sudah pernah disimpan
   */

  const duplicate =
    await api({

      action: "cekDuplikat",

      idUjian:
        selectedExam.ID_Ujian,

      kodeQR:
        selectedStudent.Kode_QR

    });


  if (
    duplicate.success &&
    duplicate.duplicate
  ) {

    resultContainer.innerHTML =
      `<div class="student-error">
        ${escapeHtml(
          duplicate.message
        )}
      </div>`;

    return;

  }


  /*
   * Ambil kunci
   */

  const kunciResult =
    await api({

      action: "getKunci",

      idUjian:
        selectedExam.ID_Ujian

    });


  if (!kunciResult.success) {

    resultContainer.innerHTML =
      `<div class="student-error">
        ${escapeHtml(
          kunciResult.message
        )}
      </div>`;

    return;

  }


  const kunciMap = {};


  kunciResult.data.forEach(function(item) {

    kunciMap[
      Number(item.No_Soal)
    ] =
      String(item.Kunci)
        .trim()
        .toUpperCase();

  });


  /*
   * Buat tampilan hasil
   */

  let benar = 0;
  let salah = 0;
  let kosong = 0;


  let html = `

    <h3>
      Hasil Pembacaan LJK
    </h3>

    <p>
      <b>Nama:</b>
      ${escapeHtml(selectedStudent.Nama)}
    </p>

    <p>
      <b>Kelas:</b>
      ${escapeHtml(selectedStudent.Kelas)}
    </p>

    <div class="rekap-table-wrapper">

    <table class="result-table">

      <thead>

        <tr>

          <th>No</th>
          <th>Jawaban</th>
          <th>Kunci</th>
          <th>Status</th>

        </tr>

      </thead>

      <tbody>
  `;


  jawaban.forEach(function(item) {

    const nomor =
      Number(item.noSoal);

    const jawabanSiswa =
      String(item.jawaban || "")
        .toUpperCase();

    const kunci =
      String(kunciMap[nomor] || "")
        .toUpperCase();


    let status = "";
    let className = "";


    if (!jawabanSiswa) {

      status = "KOSONG";
      className = "empty";

      kosong++;

    }
    else if (
      jawabanSiswa === kunci
    ) {

      status = "BENAR";
      className = "correct";

      benar++;

    }
    else {

      status = "SALAH";
      className = "wrong";

      salah++;

    }


    html += `

      <tr>

        <td>${nomor}</td>

        <td>
          ${jawabanSiswa || "-"}
        </td>

        <td>
          ${kunci || "-"}
        </td>

        <td class="${className}">
          ${status}
        </td>

      </tr>

    `;

  });


  const nilai =
    Math.round(
      (benar / jumlahSoal) *
      10000
    ) / 100;


  html += `

      </tbody>

    </table>

    </div>

    <div class="student-card">

      <p>
        <b>Benar:</b>
        ${benar}
      </p>

      <p>
        <b>Salah:</b>
        ${salah}
      </p>

      <p>
        <b>Kosong:</b>
        ${kosong}
      </p>

      <p>
        <b>Nilai:</b>
        ${nilai}
      </p>

    </div>

    <button
      class="primary-btn"
      onclick='simpanHasil(
        ${JSON.stringify(jawaban)}
      )'>

      SIMPAN HASIL

    </button>

  `;


  resultContainer.innerHTML =
    html;

}


/* ================================================
   SIMPAN HASIL
================================================ */

async function simpanHasil(jawaban) {

  if (!selectedExam ||
      !selectedStudent) {

    alert(
      "Data ujian atau siswa belum lengkap."
    );

    return;

  }


  const resultContainer =
    document.getElementById(
      "scanResult"
    );


  resultContainer.innerHTML =
    "<p>Menyimpan hasil...</p>";


  const result =
    await api({

      action: "simpanHasil",

      idUjian:
        selectedExam.ID_Ujian,

      kodeQR:
        selectedStudent.Kode_QR,

      jawaban:
        jawaban

    });


  if (!result.success) {

    resultContainer.innerHTML =
      `<div class="student-error">
        ${escapeHtml(result.message)}
      </div>`;

    return;

  }


  const data =
    result.data;


  resultContainer.innerHTML = `

    <div class="student-card">

      <h3>
        ✓ Hasil berhasil disimpan
      </h3>

      <p>
        Nama:
        <b>${escapeHtml(data.nama)}</b>
      </p>

      <p>
        Benar:
        <b>${data.benar}</b>
      </p>

      <p>
        Salah:
        <b>${data.salah}</b>
      </p>

      <p>
        Kosong:
        <b>${data.kosong}</b>
      </p>

      <p>
        Nilai:
        <b>${data.nilai}</b>
      </p>

    </div>

  `;

}


/* ================================================
   LOAD REKAP
================================================ */

async function loadRekap() {

  showPage("rekapPage");


  const container =
    document.getElementById(
      "rekapContainer"
    );


  container.innerHTML =
    "<p>Memuat rekap...</p>";


  const result =
    await api({

      action: "getRekap"

    });


  if (!result.success) {

    container.innerHTML =
      `<div class="student-error">
        ${escapeHtml(result.message)}
      </div>`;

    return;

  }


  if (
    !result.data ||
    result.data.length === 0
  ) {

    container.innerHTML =
      "<p>Belum ada hasil ujian.</p>";

    return;

  }


  let html = `

    <div class="rekap-table-wrapper">

    <table class="result-table">

      <thead>

        <tr>

          <th>Ujian</th>
          <th>NISN</th>
          <th>Nama</th>
          <th>Kelas</th>
          <th>Benar</th>
          <th>Salah</th>
          <th>Kosong</th>
          <th>Nilai</th>

        </tr>

      </thead>

      <tbody>

  `;


  result.data.forEach(function(row) {

    html += `

      <tr>

        <td>
          ${escapeHtml(row.ID_Ujian)}
        </td>

        <td>
          ${escapeHtml(row.NISN)}
        </td>

        <td>
          ${escapeHtml(row.Nama)}
        </td>

        <td>
          ${escapeHtml(row.Kelas)}
        </td>

        <td>
          ${escapeHtml(row.Benar)}
        </td>

        <td>
          ${escapeHtml(row.Salah)}
        </td>

        <td>
          ${escapeHtml(row.Kosong)}
        </td>

        <td>
          <b>
            ${escapeHtml(row.Nilai)}
          </b>
        </td>

      </tr>

    `;

  });


  html += `

      </tbody>

    </table>

    </div>

  `;


  container.innerHTML =
    html;

}


/* ================================================
   ESCAPE HTML
================================================ */

function escapeHtml(value) {

  if (value === null ||
      value === undefined) {

    return "";

  }

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}
