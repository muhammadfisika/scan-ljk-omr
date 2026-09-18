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


/* =================================================
   MESIN SCANNER OMR
   TAHAP 4
================================================= */

let cameraStream = null;

let cameraRunning = false;

let scanningTimer = null;

let processingFrame = false;


/* =================================================
   UKURAN TEMPLATE LJK
================================================= */

const OMR_TEMPLATE = {

  width: 1000,

  height: 1414

};


/* =================================================
   POSISI MARKER
================================================= */

const MARKER_POSITIONS = [

  {
    x: 45,
    y: 260
  },

  {
    x: 955,
    y: 260
  },

  {
    x: 45,
    y: 1360
  },

  {
    x: 955,
    y: 1360
  }

];


/* =================================================
   POSISI BUBBLE
================================================= */

function getBubblePositions() {

  const positions = [];

  /*
   * 20 soal kolom kiri
   * 20 soal kolom kanan
   */

  for (let i = 0; i < 20; i++) {

    const nomorKiri = i + 1;

    const nomorKanan = i + 21;

    const y =
      350 + (i * 48);


    positions.push({

      noSoal: nomorKiri,

      x: [
        250,
        290,
        330,
        370,
        410
      ],

      y: y

    });


    positions.push({

      noSoal: nomorKanan,

      x: [
        590,
        630,
        670,
        710,
        750
      ],

      y: y

    });

  }

  return positions;

}


/* =================================================
   START CAMERA
================================================= */

async function startCamera() {

  if (cameraRunning) {

    return;

  }


  const video =
    document.getElementById(
      "cameraVideo"
    );

  const status =
    document.getElementById(
      "cameraStatus"
    );


  if (!navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia) {

    status.textContent =
      "Browser tidak mendukung kamera.";

    return;

  }


  try {

    status.textContent =
      "Meminta izin kamera...";


    cameraStream =
      await navigator.mediaDevices
        .getUserMedia({

          video: {

            facingMode: {
              ideal: "environment"
            },

            width: {
              ideal: 1920
            },

            height: {
              ideal: 1080
            }

          },

          audio: false

        });


    video.srcObject =
      cameraStream;


    await video.play();


    cameraRunning = true;


    status.textContent =
      "Kamera aktif — arahkan LJK ke dalam kotak";


    document
      .getElementById(
        "startCameraBtn"
      )
      .style.display =
      "none";


    document
      .getElementById(
        "stopCameraBtn"
      )
      .style.display =
      "block";


    startOMRLoop();


  } catch (error) {

    console.error(error);


    status.innerHTML =
      `<div class="omr-error">
        Kamera gagal dibuka.<br><br>
        ${escapeHtml(error.name)}:
        ${escapeHtml(error.message)}
      </div>`;

  }

}


/* =================================================
   STOP CAMERA
================================================= */

function stopCamera() {

  cameraRunning = false;


  if (scanningTimer) {

    clearTimeout(scanningTimer);

    scanningTimer = null;

  }


  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(function(track) {

        track.stop();

      });

    cameraStream = null;

  }


  const video =
    document.getElementById(
      "cameraVideo"
    );


  video.srcObject = null;


  document
    .getElementById(
      "cameraStatus"
    )
    .textContent =
    "Kamera berhenti";


  document
    .getElementById(
      "startCameraBtn"
    )
    .style.display =
    "block";


  document
    .getElementById(
      "stopCameraBtn"
    )
    .style.display =
    "none";

}


/* =================================================
   LOOP SCANNER
================================================= */

function startOMRLoop() {

  if (!cameraRunning) {

    return;

  }


  scanningTimer =
    setTimeout(
      processCameraFrame,
      500
    );

}


/* =================================================
   AMBIL FRAME
================================================= */

function processCameraFrame() {

  if (!cameraRunning) {

    return;

  }


  if (processingFrame) {

    startOMRLoop();

    return;

  }


  processingFrame = true;


  try {

    const video =
      document.getElementById(
        "cameraVideo"
      );

    const canvas =
      document.getElementById(
        "cameraCanvas"
      );


    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

      processingFrame = false;

      startOMRLoop();

      return;

    }


    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;


    const ctx =
      canvas.getContext("2d");


    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    detectOMR(canvas);


  } catch (error) {

    console.error(
      "OMR error:",
      error
    );

  }


  processingFrame = false;


  if (cameraRunning) {

    startOMRLoop();

  }

}


/* =================================================
   DETEKSI MARKER
================================================= */

function detectOMR(canvas) {

  if (
    typeof cv === "undefined" ||
    !cv.Mat
  ) {

    document
      .getElementById(
        "omrStatus"
      )
      .innerHTML =
      `<div class="omr-warning">
        Menunggu OpenCV.js siap...
      </div>`;

    return;

  }


  let src = null;

  let gray = null;

  let binary = null;

  let contours = null;

  let hierarchy = null;


  try {

    src =
      cv.imread(canvas);


    gray =
      new cv.Mat();


    binary =
      new cv.Mat();


    cv.cvtColor(
      src,
      gray,
      cv.COLOR_RGBA2GRAY
    );


    cv.GaussianBlur(
      gray,
      gray,
      new cv.Size(5, 5),
      0
    );


    cv.threshold(
      gray,
      binary,
      0,
      255,
      cv.THRESH_BINARY_INV +
      cv.THRESH_OTSU
    );


    contours =
      new cv.MatVector();


    hierarchy =
      new cv.Mat();


    cv.findContours(
      binary,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );


    const candidates = [];


    for (
      let i = 0;
      i < contours.size();
      i++
    ) {

      const contour =
        contours.get(i);


      const area =
        cv.contourArea(contour);


      if (
        area < 500 ||
        area > 100000
      ) {

        contour.delete();

        continue;

      }


      const perimeter =
        cv.arcLength(
          contour,
          true
        );


      const approx =
        new cv.Mat();


      cv.approxPolyDP(
        contour,
        approx,
        0.04 * perimeter,
        true
      );


      if (
        approx.rows === 4
      ) {

        const rect =
          cv.boundingRect(
            approx
          );


        const ratio =
          rect.width /
          rect.height;


        if (
          ratio > 0.7 &&
          ratio < 1.3
        ) {

          candidates.push({

            x: rect.x +
              rect.width / 2,

            y: rect.y +
              rect.height / 2,

            area: area

          });

        }

      }


      approx.delete();

      contour.delete();

    }


    /*
     * Ambil empat marker
     */

    if (
      candidates.length < 4
    ) {

      document
        .getElementById(
          "omrStatus"
        )
        .innerHTML =
        `<div class="omr-warning">
          Arahkan seluruh LJK ke dalam kamera.
          Menunggu 4 marker...
        </div>`;

      return;

    }


    const markers =
      selectFourMarkers(
        candidates,
        canvas.width,
        canvas.height
      );


    if (!markers) {

      return;

    }


    document
      .getElementById(
        "omrStatus"
      )
      .innerHTML =
      `<div class="omr-detected">
        ✓ 4 marker LJK terdeteksi
      </div>`;


    const warped =
      perspectiveCorrection(
        src,
        markers
      );


    if (!warped) {

      return;

    }


    const result =
      readOMR(
        warped
      );


    warped.delete();


    if (result) {

      showOMRResult(
        result
      );

    }

  } catch (error) {

    console.error(
      "Deteksi marker:",
      error
    );

  } finally {

    if (src) src.delete();

    if (gray) gray.delete();

    if (binary) binary.delete();

    if (contours) contours.delete();

    if (hierarchy) hierarchy.delete();

  }

}


/* =================================================
   PILIH EMPAT MARKER
================================================= */

function selectFourMarkers(
  candidates,
  width,
  height
) {

  const corners = [

    {
      x: 0,
      y: 0
    },

    {
      x: width,
      y: 0
    },

    {
      x: 0,
      y: height
    },

    {
      x: width,
      y: height
    }

  ];


  const result = [];


  corners.forEach(function(corner) {

    let best = null;

    let bestDistance =
      Infinity;


    candidates.forEach(function(candidate) {

      const dx =
        candidate.x -
        corner.x;

      const dy =
        candidate.y -
        corner.y;


      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      if (
        distance <
        bestDistance
      ) {

        bestDistance =
          distance;

        best =
          candidate;

      }

    });


    if (best) {

      result.push(best);

    }

  });


  if (
    result.length !== 4
  ) {

    return null;

  }


  /*
   * Urut:
   * kiri atas
   * kanan atas
   * kanan bawah
   * kiri bawah
   */

  result.sort(function(a, b) {

    return a.y - b.y;

  });


  const top =
    result.slice(0, 2)
      .sort(function(a, b) {

        return a.x - b.x;

      });


  const bottom =
    result.slice(2, 4)
      .sort(function(a, b) {

        return b.x - a.x;

      });


  return [

    top[0],

    top[1],

    bottom[0],

    bottom[1]

  ];

}


/* =================================================
   PERSPECTIVE CORRECTION
================================================= */

function perspectiveCorrection(
  src,
  markers
) {

  try {

    const srcPoints =
      cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        [

          markers[0].x,
          markers[0].y,

          markers[1].x,
          markers[1].y,

          markers[2].x,
          markers[2].y,

          markers[3].x,
          markers[3].y

        ]
      );


    const dstPoints =
      cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        [

          45,
          260,

          955,
          260,

          955,
          1360,

          45,
          1360

        ]
      );


    const matrix =
      cv.getPerspectiveTransform(
        srcPoints,
        dstPoints
      );


    const warped =
      new cv.Mat();


    cv.warpPerspective(
      src,
      warped,
      matrix,
      new cv.Size(
        OMR_TEMPLATE.width,
        OMR_TEMPLATE.height
      )
    );


    srcPoints.delete();

    dstPoints.delete();

    matrix.delete();


    return warped;

  } catch (error) {

    console.error(
      "Perspective:",
      error
    );

    return null;

  }

}


/* =================================================
   BACA OMR
================================================= */

function readOMR(warped) {

  let gray = null;

  try {

    gray =
      new cv.Mat();


    cv.cvtColor(
      warped,
      gray,
      cv.COLOR_RGBA2GRAY
    );


    /*
     * Threshold untuk meningkatkan
     * kontras tinta hitam.
     */

    const positions =
      getBubblePositions();


    const answers = [];


    positions.forEach(function(item) {

      const scores = [];


      item.x.forEach(function(x) {

        /*
         * Area pembacaan bubble.
         *
         * Radius harus disesuaikan
         * dengan ukuran cetakan LJK.
         */

        const radius = 9;


        const x1 =
          Math.max(
            0,
            x - radius
          );

        const y1 =
          Math.max(
            0,
            item.y - radius
          );

        const x2 =
          Math.min(
            gray.cols,
            x + radius
          );

        const y2 =
          Math.min(
            gray.rows,
            item.y + radius
          );


        const roi =
          gray.roi(
            new cv.Rect(
              x1,
              y1,
              x2 - x1,
              y2 - y1
            )
          );


        const mean =
          cv.mean(roi)[0];


        /*
         * Semakin kecil nilai grayscale,
         * semakin gelap.
         */

        const darkness =
          255 - mean;


        scores.push(
          darkness
        );


        roi.delete();

      });


      /*
       * Cari nilai paling gelap.
       */

      let maxIndex = 0;

      let maxValue =
        scores[0];


      for (
        let i = 1;
        i < scores.length;
        i++
      ) {

        if (
          scores[i] >
          maxValue
        ) {

          maxValue =
            scores[i];

          maxIndex =
            i;

        }

      }


      /*
       * Hitung kandidat yang
       * cukup gelap.
       */

      const threshold =
        55;


      const selected =
        scores.filter(function(score) {

          return score >= threshold;

        });


      let jawaban = "";

      let status = "KOSONG";


      if (
        selected.length === 0
      ) {

        jawaban = "";

        status = "KOSONG";

      }
      else if (
        selected.length > 1
      ) {

        jawaban = "";

        status = "GANDA";

      }
      else {

        const pilihan =
          [
            "A",
            "B",
            "C",
            "D",
            "E"
          ];

        jawaban =
          pilihan[maxIndex];

        status = "TERBACA";

      }


      answers.push({

        noSoal:
          item.noSoal,

        jawaban:
          jawaban,

        status:
          status,

        scores:
          scores

      });

    });


    return {

      answers:
        answers,

      timestamp:
        new Date()

    };

  } catch (error) {

    console.error(
      "Baca OMR:",
      error
    );

    return null;

  } finally {

    if (gray) {

      gray.delete();

    }

  }

}


/* =================================================
   TAMPILKAN HASIL
================================================= */

function showOMRResult(result) {

  if (
    !result ||
    !result.answers
  ) {

    return;

  }


  /*
   * Jangan tampilkan hasil baru
   * jika kamera sedang tidak aktif.
   */

  if (!cameraRunning) {

    return;

  }


  let adaHasil =
    false;


  result.answers.forEach(function(item) {

    if (
      item.status !==
      "KOSONG"
    ) {

      adaHasil = true;

    }

  });


  if (!adaHasil) {

    return;

  }


  /*
   * Simpan sementara hasil OMR.
   */

  window.lastOMRResult =
    result;


  /*
   * Hentikan sementara proses scan
   * supaya hasil tidak berubah-ubah.
   */

  if (scanningTimer) {

    clearTimeout(
      scanningTimer
    );

    scanningTimer = null;

  }


  renderOMRResult(result);

}


/* =================================================
   RENDER HASIL OMR
================================================= */

function renderOMRResult(result) {

  const container =
    document.getElementById(
      "scanResult"
    );


  let benar = 0;

  let salah = 0;

  let kosong = 0;

  let ganda = 0;


  let rows = "";


  result.answers
    .sort(function(a, b) {

      return a.noSoal -
             b.noSoal;

    })
    .forEach(function(item) {

      let className = "";

      if (
        item.status ===
        "KOSONG"
      ) {

        kosong++;

        className =
          "empty";

      }
      else if (
        item.status ===
        "GANDA"
      ) {

        ganda++;

        className =
          "wrong";

      }
      else {

        className =
          "correct";

      }


      rows += `

        <tr>

          <td>
            ${item.noSoal}
          </td>

          <td>
            ${item.jawaban || "-"}
          </td>

          <td class="${className}">
            ${item.status}
          </td>

        </tr>

      `;

    });


  container.innerHTML = `

    <div class="omr-success">

      <h3>
        ✓ Hasil Pembacaan LJK
      </h3>

      <p>
        Silakan periksa hasil
        sebelum menyimpan.
      </p>

      <div class="rekap-table-wrapper">

        <table class="result-table">

          <thead>

            <tr>

              <th>No</th>

              <th>Jawaban</th>

              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            ${rows}

          </tbody>

        </table>

      </div>


      <p>
        Kosong:
        <b>${kosong}</b>
      </p>

      <p>
        Jawaban ganda:
        <b>${ganda}</b>
      </p>


      <button
        class="primary-btn"
        onclick="konfirmasiSimpanOMR()">

        ✓ KONFIRMASI & SIMPAN

      </button>


      <button
        class="secondary-btn"
        onclick="scanLagi()">

        📷 SCAN LJK BERIKUTNYA

      </button>

    </div>

  `;

}


/* =================================================
   KONFIRMASI SIMPAN
================================================= */

async function konfirmasiSimpanOMR() {

  if (
    !window.lastOMRResult
  ) {

    alert(
      "Hasil OMR belum tersedia."
    );

    return;

  }


  if (!selectedExam) {

    alert(
      "Pilih ujian terlebih dahulu."
    );

    return;

  }


  if (!selectedStudent) {

    alert(
      "Identitas siswa belum dipilih."
    );

    return;

  }


  const answers =
    window.lastOMRResult.answers;


  /*
   * Jawaban ganda tidak boleh
   * langsung dianggap sebagai kosong.
   */

  const adaGanda =
    answers.some(function(item) {

      return item.status ===
        "GANDA";

    });


  if (adaGanda) {

    alert(
      "Masih terdapat jawaban ganda. " +
      "Periksa LJK sebelum menyimpan."
    );

    return;

  }


  const jawaban =
    answers.map(function(item) {

      return {

        noSoal:
          item.noSoal,

        jawaban:
          item.jawaban

      };

    });


  const container =
    document.getElementById(
      "scanResult"
    );


  container.innerHTML =
    "<p>Menyimpan hasil ke Google Sheets...</p>";


  const result =
    await api({

      action:
        "simpanHasil",

      idUjian:
        selectedExam.ID_Ujian,

      kodeQR:
        selectedStudent.Kode_QR,

      jawaban:
        jawaban

    });


  if (!result.success) {

    container.innerHTML =
      `<div class="omr-error">
        ${escapeHtml(
          result.message
        )}
      </div>`;

    return;

  }


  container.innerHTML = `

    <div class="omr-success">

      <h3>
        ✓ HASIL BERHASIL DISIMPAN
      </h3>

      <p>
        <b>
          ${escapeHtml(
            result.data.nama
          )}
        </b>
      </p>

      <p>
        Benar:
        <b>
          ${result.data.benar}
        </b>
      </p>

      <p>
        Salah:
        <b>
          ${result.data.salah}
        </b>
      </p>

      <p>
        Kosong:
        <b>
          ${result.data.kosong}
        </b>
      </p>

      <p>
        Nilai:
        <b>
          ${result.data.nilai}
        </b>
      </p>

      <button
        class="primary-btn"
        onclick="scanLagi()">

        📷 SCAN LJK BERIKUTNYA

      </button>

    </div>

  `;

}


/* =================================================
   SCAN LJK BERIKUTNYA
================================================= */

function scanLagi() {

  window.lastOMRResult =
    null;


  selectedStudent =
    null;


  document
    .getElementById(
      "qrInput"
    )
    .value = "";


  document
    .getElementById(
      "studentResult"
    )
    .innerHTML = "";


  document
    .getElementById(
      "scanResult"
    )
    .innerHTML = "";


  document
    .getElementById(
      "omrStatus"
    )
    .innerHTML =
    `<div class="omr-warning">
      Siap membaca LJK berikutnya...
    </div>`;


  /*
   * Kamera TIDAK dimatikan.
   */

  cameraRunning = true;


  startOMRLoop();

}


