document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://fedskillstest.coalitiontechnologies.workers.dev";
    
    // Programmatic Basic Auth construction using btoa()
    const username = "coalition";
    const password = "skills-test";
    const authHeader = "Basic " + btoa(`${username}:${password}`);

    // Fetch API Data
    fetch(API_URL, {
        method: "GET",
        headers: {
            "Authorization": authHeader,
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        // Populate Patient List Sidebar
        renderPatientList(data);

        // Filter and display information specifically for Jessica Taylor
        const jessica = data.find(patient => patient.name === "Jessica Taylor");
        if (jessica) {
            renderJessicaProfile(jessica);
            renderVitals(jessica);
            renderDiagnosticList(jessica);
            renderLabResults(jessica);
            renderBPChart(jessica.diagnosis_history);
        }
    })
    .catch(error => console.error("Error fetching patient data:", error));
});

// Render Sidebar Patient List
function renderPatientList(patients) {
    const container = document.getElementById("patient-list");
    container.innerHTML = patients.map(p => `
        <div class="patient-item ${p.name === 'Jessica Taylor' ? 'active' : ''}">
            <img src="${p.profile_picture}" alt="${p.name}">
            <div>
                <strong>${p.name}</strong><br>
                <small>${p.gender}, ${p.age}</small>
            </div>
        </div>
    `).join("");
}

// Render Profile Panel
function renderJessicaProfile(data) {
    document.getElementById("jessica-avatar").src = data.profile_picture;
    document.getElementById("jessica-name").innerText = data.name;
    document.getElementById("jessica-dob").innerText = data.date_of_birth;
    document.getElementById("jessica-gender").innerText = data.gender;
    document.getElementById("jessica-phone").innerText = data.phone_number;
    document.getElementById("jessica-emergency").innerText = data.emergency_contact;
    document.getElementById("jessica-insurance").innerText = data.insurance_provider;
}

// Render Vitals & Badges
function renderVitals(data) {
    const latest = data.diagnosis_history[0]; // Most recent entry
    if (!latest) return;

    document.getElementById("respiratory-val").innerText = `${latest.respiratory_rate.value} bpm`;
    document.getElementById("respiratory-status").innerText = latest.respiratory_rate.levels;

    document.getElementById("temp-val").innerText = `${latest.temperature.value}°F`;
    document.getElementById("temp-status").innerText = latest.temperature.levels;

    document.getElementById("heart-val").innerText = `${latest.heart_rate.value} bpm`;
    document.getElementById("heart-status").innerText = latest.heart_rate.levels;

    // Stat Summary in Chart Box
    document.getElementById("systolic-val").innerText = latest.blood_pressure.systolic.value;
    document.getElementById("systolic-status").innerText = latest.blood_pressure.systolic.levels;
    document.getElementById("diastolic-val").innerText = latest.blood_pressure.diastolic.value;
    document.getElementById("diastolic-status").innerText = latest.blood_pressure.diastolic.levels;
}

// Render Diagnostic List Table
function renderDiagnosticList(data) {
    const tbody = document.getElementById("diagnostic-tbody");
    tbody.innerHTML = data.diagnostic_list.map(d => `
        <tr>
            <td>${d.name}</td>
            <td>${d.description}</td>
            <td>${d.status}</td>
        </tr>
    `).join("");
}

// Render Lab Results List
function renderLabResults(data) {
    const ul = document.getElementById("lab-list");
    ul.innerHTML = data.lab_results.map(lab => `
        <li>
            <span>${lab}</span>
            <a href="#" download>⬇</a>
        </li>
    `).join("");
}

// Initialize Chart.js Graph
function renderBPChart(history) {
    // Get last 6 months records
    const recent6 = history.slice(0, 6).reverse();

    const labels = recent6.map(item => `${item.month.slice(0,3)}, ${item.year}`);
    const systolicData = recent6.map(item => item.blood_pressure.systolic.value);
    const diastolicData = recent6.map(item => item.blood_pressure.diastolic.value);

    const ctx = document.getElementById('bpChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Systolic',
                    data: systolicData,
                    borderColor: '#C5428D',
                    backgroundColor: '#E66FD2',
                    tension: 0.4
                },
                {
                    label: 'Diastolic',
                    data: diastolicData,
                    borderColor: '#7E6CAB',
                    backgroundColor: '#8C6FE6',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { min: 60, max: 180 } }
        }
    });
}