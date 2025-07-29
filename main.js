const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFT0vjtPXwWjA4t0ZFDg_dlZvEO-a0J-Y_kX778dd1kpK0A_0k7aCZpZX33u_sRxJXn6n6KaykIVaV/pub?output=csv";
let data = [];

function loadCSV(url, callback) {
    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            data = results.data.map(row =>
                Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), v.trim()]))
            );
            callback();
        },
        error: function (err) {
            console.error("CSV Parse Error:", err);
        }
    });
}

function populateFilters() {
    const schemeSel = document.getElementById("scheme");
    const semesterSel = document.getElementById("semester");
    const deptSel = document.getElementById("department");

    const schemes = new Set(), semesters = new Set(), depts = new Set();
    data.forEach(row => {
        if (row.publishedStatus?.toLowerCase() !== "true") return;
        if (row.Scheme) schemes.add(row.Scheme);
        if (row.Semester) semesters.add(row.Semester);
        if (row.Department) depts.add(row.Department);
    });

    schemeSel.innerHTML = `<option value="">Scheme (All)</option>`;
    semesterSel.innerHTML = `<option value="">Semester (All)</option>`;
    deptSel.innerHTML = `<option value="">Department (All)</option>`;

    [...schemes].sort().forEach(val => schemeSel.innerHTML += `<option value="${val}">${val}</option>`);
    [...semesters].sort().forEach(val => semesterSel.innerHTML += `<option value="${val}">${val}</option>`);
    [...depts].sort().forEach(val => deptSel.innerHTML += `<option value="${val}">${val}</option>`);

    schemeSel.onchange = semesterSel.onchange = deptSel.onchange = renderCards;

    renderCards();
}

function renderCards() {
    const scheme = document.getElementById("scheme").value;
    const semester = document.getElementById("semester").value;
    const dept = document.getElementById("department").value;

    const filtered = data.filter(row =>
        row.publishedStatus?.toLowerCase() === "true" &&
        (!scheme || row.Scheme === scheme) &&
        (!semester || row.Semester === semester) &&
        (!dept || row.Department === dept)
    );

    const cardArea = document.getElementById("cardArea");
    cardArea.innerHTML = "";

    if (!filtered.length) {
        cardArea.innerHTML = "<p class='text-center text-muted'>No published notes found.</p>";
        return;
    }

    filtered.forEach(row => {
        const card = document.createElement("div");
        // card.className = "col-12 col-md-6 col-lg-4";
        card.className = "col-12 ";

        card.innerHTML = `
      <div class="card h-100 note-card">
        <div class="card-body">
          <h5 class="card-title">${row.CourseCode} - ${row.CourseName}</h5>
          <h6 class="card-subtitle mb-2">Module ${row.ModuleNo}: ${row.ModuleTitle}</h6>
          <p class="card-text"><strong>Syllabus:</strong> ${row.Syllabus}</p>
        </div>
        <div class="card-footer bg-white border-0">
          <a href="${row["Notes Link"]}" target="_blank" class="btn btn-sm btn-primary">📄 Open Notes</a>
          <span class="badge badge-sem float-end">Sem ${row.Semester}</span>
        </div>
      </div>
    `;
        cardArea.appendChild(card);
    });
}

loadCSV(sheetURL, populateFilters);
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('service-worker.js')
      .then(reg => console.log('Service Worker registered ✅'))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
