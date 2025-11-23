/* ===================
   Admin Dashboard JS
   =================== */

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Admin Dashboard Loaded.");

    // ===== NAVBAR TOGGLE =====
    const navbar = document.getElementById("navbar");
    const navbarRight = document.getElementById("navbarRight");
    const menu = document.getElementById("menu");

    if (menu) {
        menu.addEventListener("click", function () {
            navbar.classList.toggle("active");
            navbarRight.classList.toggle("active");
            menu.classList.toggle("open");
        });
    }

    // ===== DOM ELEMENTS =====
    const machineList = document.getElementById("machine-list");
    const adminLogList = document.getElementById("admin-log-list");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const filterDropdown = document.getElementById("filter");
    const sortDropdown = document.getElementById("sort");

    // Modal elements
    const addMachineBtn = document.getElementById("add-machine-btn");
    const addOperatorBtn = document.getElementById("add-operator-btn");
    const runSimulationBtn = document.getElementById("run-simulation-btn");
    const addMachineModal = document.getElementById("add-machine-modal");
    const addOperatorModal = document.getElementById("add-operator-modal");
    const closeBtns = document.querySelectorAll(".close-btn");
    const addMachineForm = document.getElementById("add-machine-form");
    const addOperatorForm = document.getElementById("add-operator-form");
    
    // NEW: Clear Logs Button
    const clearLogsBtn = document.getElementById("clear-logs-btn"); // You'll need to add this button to your HTML
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener("click", clearAllLogs);
    }
    
    // ===== MODAL EVENT LISTENERS =====
    addMachineBtn.addEventListener("click", () => {
        addMachineModal.style.display = "block";
    });

    addOperatorBtn.addEventListener("click", () => {
        addOperatorModal.style.display = "block";
    });
    
    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.closest(".modal").style.display = "none";
        });
    });

    window.addEventListener("click", (event) => {
        if (event.target == addMachineModal) {
            addMachineModal.style.display = "none";
        }
        if (event.target == addOperatorModal) {
            addOperatorModal.style.display = "none";
        }
    });
    
    // ===== FORM SUBMISSION HANDLERS =====
    addMachineForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("machine-name").value;
        try {
            const response = await fetch('/api/admin/add_machine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await response.json();
            alert(data.message);
            addMachineModal.style.display = "none";
            fetchDashboardData();
        } catch (error) {
            alert('Error adding machine.');
        }
    });

    addOperatorForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("operator-username").value;
        const email = document.getElementById("operator-email").value;
        const password = document.getElementById("operator-password").value;
        try {
            const response = await fetch('/api/admin/add_operator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            alert(data.message);
            addOperatorModal.style.display = "none";
            // No need to refresh the dashboard data for operators, just confirm
        } catch (error) {
            alert('Error adding operator.');
        }
    });
    
    // ===== RUN SIMULATION HANDLER =====
    runSimulationBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to run a simulation? This will add new random data.")) return;
        try {
            const response = await fetch('/api/admin/run_simulation', { method: 'POST' });
            const data = await response.json();
            alert(data.message);
            fetchDashboardData();
            fetchAllLogs();
        } catch (error) {
            alert('Error running simulation.');
        }
    });

    // ===== NEW: CLEAR ALL LOGS HANDLER =====
    async function clearAllLogs() {
        if (!confirm("Are you sure you want to clear ALL logs? This action is irreversible.")) return;
        try {
            const response = await fetch('/api/admin/clear_logs', { method: 'POST' });
            const data = await response.json();
            alert(data.message);
            if (response.ok) {
                fetchAllLogs(); // Reload the logs section, which will now be empty
            }
        } catch (error) {
            console.error("❌ Error clearing logs:", error);
            alert('Error clearing logs. Please try again.');
        }
    }

    // ===== CORE FUNCTION: FETCH DASHBOARD DATA =====
    async function fetchDashboardData(query = "", filter = "all", sort = "name") {
        try {
            const response = await fetch(
                `/api/admin/dashboard_data?search=${encodeURIComponent(query)}&filter=${filter}&sort=${sort}`
            );
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            renderMachines(data.machines);
        } catch (error) {
            console.error("❌ Error fetching admin dashboard data:", error);
            machineList.innerHTML = `<p class="error">⚠️ Could not load machine data.</p>`;
        }
    }

    // ===== CORE FUNCTION: FETCH ALL LOGS (WITH SEARCH) =====
    async function fetchAllLogs() {
      const query = searchInput.value.toLowerCase();
      try {
        const response = await fetch('/api/admin/get_all_logs');
        if (!response.ok) throw new Error("Failed to fetch all logs");
        const allLogs = await response.json();
        
        // Filter the logs based on the search query
        const filteredLogs = allLogs.filter(log => {
            return (
                log.operator_name.toLowerCase().includes(query) ||
                log.details.toLowerCase().includes(query) ||
                log.action.toLowerCase().includes(query)
            );
        });

        adminLogList.innerHTML = "";
        if (filteredLogs.length === 0) {
            adminLogList.innerHTML = `<p class="no-logs">No activity logs found matching your search.</p>`;
            return;
        }

        filteredLogs.forEach(log => {
            const logCard = document.createElement("div");
            logCard.classList.add("story");
            logCard.innerHTML = `
                <div class="story-details">
                    <p class="local">Operator: ${log.operator_name}</p>
                    <div class="story-meta">
                        <h6>${new Date(log.timestamp).toLocaleDateString()}</h6>
                        <h5>• ${new Date(log.timestamp).toLocaleTimeString()}</h5>
                    </div>
                </div>
                <h2>${log.action.replace(/_/g, ' ').toUpperCase()}</h2>
                <h4>Details: ${log.details || 'No details provided.'}</h4>
            `;
            adminLogList.appendChild(logCard);
        });
      } catch (error) {
        console.error("❌ Error fetching all logs:", error);
        adminLogList.innerHTML = `<p class="error">Error loading activity logs.</p>`;
      }
    }

    // ===== RENDER MACHINE CARDS =====
    function renderMachines(machines) {
        machineList.innerHTML = "";
        if (!machines || machines.length === 0) {
            machineList.innerHTML = `<p class="empty">No machines found.</p>`;
            return;
        }
        machines.forEach(machine => {
            const card = document.createElement("div");
            card.classList.add("machine-card");
            let actionButton = '';
            if (machine.status === 'down') {
                actionButton = `<button class="fix-machine-btn" data-id="${machine.id}">Fix Machine</button>`;
            } else {
                actionButton = `<button class="report-issue-btn" data-id="${machine.id}">Report Issue</button>`;
            }
            card.innerHTML = `
                <h3>${machine.name}</h3>
                <p><strong>Status:</strong> <span class="status ${machine.status}">${machine.status}</span></p>
                <p><strong>Last Maintenance:</strong> ${machine.last_maintenance || "Not Recorded"}</p>
                ${actionButton}
            `;
            machineList.appendChild(card);
        });
        attachMachineEvents();
    }

    // ===== ATTACH MACHINE ACTION EVENTS =====
    function attachMachineEvents() {
        document.querySelectorAll(".report-issue-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const machineId = button.dataset.id;
                const issueDetails = prompt("Please provide a description of the issue:");
                if (!issueDetails) {
                    alert("Issue reporting cancelled.");
                    return;
                }
                const currentUsername = localStorage.getItem('currentUsername');
                try {
                    const response = await fetch(`/api/machines/${machineId}/report`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username: currentUsername, details: issueDetails })
                    });
                    if (response.ok) {
                        alert("✅ Issue reported successfully!");
                        fetchDashboardData(searchInput.value, filterDropdown.value, sortDropdown.value);
                        fetchAllLogs();
                    } else {
                        alert("❌ Failed to report issue.");
                    }
                } catch (error) {
                    console.error("Error reporting issue:", error);
                    alert("⚠️ Error reporting issue.");
                }
            });
        });
        document.querySelectorAll(".fix-machine-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const machineId = button.dataset.id;
                if (!confirm("Are you sure you want to fix this machine?")) return;
                try {
                    const response = await fetch(`/api/admin/fix_machine/${machineId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                    });
                    if (response.ok) {
                        alert("✅ Machine fixed successfully!");
                        fetchDashboardData(searchInput.value, filterDropdown.value, sortDropdown.value);
                        fetchAllLogs();
                    } else {
                        alert("❌ Failed to fix machine.");
                    }
                } catch (error) {
                    console.error("Error fixing machine:", error);
                    alert("⚠️ Error fixing machine.");
                }
            });
        });
    }

    // ===== SEARCH & FILTER HANDLERS =====
    searchBtn.addEventListener("click", () => {
        fetchDashboardData(searchInput.value, filterDropdown.value, sortDropdown.value);
        fetchAllLogs();
    });

    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            fetchDashboardData(searchInput.value, filterDropdown.value, sortDropdown.value);
            fetchAllLogs();
        }
    });

    filterDropdown.addEventListener("change", () => {
        fetchDashboardData(searchInput.value, filterDropdown.value, sortDropdown.value);
    });

    sortDropdown.addEventListener("change", () => {
        fetchDashboardData(searchInput.value, filterDropdown.value, sortDropdown.value);
    });

    // ===== INITIAL DATA LOAD =====
    fetchDashboardData();
    fetchAllLogs();
});