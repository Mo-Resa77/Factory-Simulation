/* =====================
   Operator Dashboard JS
   ===================== */

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Operator Dashboard Loaded.");
    
    // Store the username after a successful login
    let username = localStorage.getItem('currentUsername');

    /* =====================
       NAVBAR TOGGLE
    ===================== */
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

    /* =====================
       BACKEND ACTION LOGGER
    ===================== */
    async function logOperatorAction(action, details) {
        try {
            const response = await fetch("/api/operator/log_action", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ action, details, username })
            });

            if (!response.ok) {
                throw new Error("Failed to log action");
            }

            const data = await response.json();
            console.log("✅ Action logged successfully:", data);
            alert(`✅ Action "${action}" logged successfully!`);
            fetchActivityLogs();
        } catch (error) {
            console.error("❌ Error logging action:", error);
            alert(`❌ Error logging action "${action}". Please try again.`);
        }
    }

    /* =====================
       LOAD ACTIVITY LOGS
    ===================== */
    async function fetchActivityLogs() {
        const logList = document.getElementById("log-list");
        if (!logList) return;

        try {
            // Updated endpoint to fetch logs for the specific user
            const response = await fetch(`/api/operator/get_logs/${username}`);
            if (!response.ok) throw new Error("Failed to fetch logs");

            const logs = await response.json();
            logList.innerHTML = "";

            if (logs.length === 0) {
                logList.innerHTML = `<p class="no-logs">No activity logs available.</p>`;
                return;
            }

            logs.forEach(log => {
                const logCard = document.createElement("div");
                logCard.classList.add("log-card");
                logCard.innerHTML = `
                    <h3>${log.action}</h3>
                    <p>${log.details || "No details provided."}</p>
                    <small>${new Date(log.timestamp).toLocaleString()}</small>
                `;
                logList.appendChild(logCard);
            });

            console.log("✅ Logs loaded successfully.");
        } catch (error) {
            console.error("❌ Error fetching logs:", error);
            logList.innerHTML = `<p class="error">Error loading activity logs.</p>`;
        }
    }

    /* =====================
       BUTTON EVENT LISTENERS
    ===================== */
    const startShiftBtn = document.getElementById("start-shift-btn");
    const endShiftBtn = document.getElementById("end-shift-btn");
    const logBreakBtn = document.getElementById("log-break-btn");
    const reportIssueBtn = document.getElementById("report-issue-btn");
    const calibrateBtn = document.getElementById("calibrate-btn");

    if (startShiftBtn) {
        startShiftBtn.addEventListener("click", () => {
            logOperatorAction("start_shift", "Shift started.");
        });
    }

    if (endShiftBtn) {
        endShiftBtn.addEventListener("click", () => {
            logOperatorAction("end_shift", "Shift ended.");
        });
    }

    if (logBreakBtn) {
        logBreakBtn.addEventListener("click", () => {
            const reason = prompt("Enter reason for break:");
            if (reason) {
                logOperatorAction("break", reason);
            }
        });
    }

    if (reportIssueBtn) {
        reportIssueBtn.addEventListener("click", () => {
            const issue = prompt("Describe the machine issue:");
            if (issue) {
                logOperatorAction("machine_issue", issue);
            }
        });
    }

    if (calibrateBtn) {
        calibrateBtn.addEventListener("click", async () => {
            alert("Starting calibration mini-game... Please wait.");
            
            // Simulate a brief calibration period
            setTimeout(async () => {
                const details = "Calibration mini-game completed successfully.";
                try {
                    const response = await fetch("/api/operator/calibrate_machine", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, details })
                    });
                    const data = await response.json();
                    alert(data.message);
                    fetchActivityLogs();
                } catch (error) {
                    console.error("❌ Calibration failed:", error);
                    alert("❌ Calibration failed. Please try again.");
                }
            }, 2000); // 2-second delay to simulate the "game"
        });
    }

    /* =====================
       INITIAL DATA LOAD
    ===================== */
    fetchActivityLogs();
});