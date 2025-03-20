document.addEventListener("DOMContentLoaded", () => {
    const numFloors = 10;
    const numElevators = 5;
    const queue = [];
    let elevatorPositions = Array(numElevators).fill(0); // Start at ground floor
    let elevatorsBusy = Array(numElevators).fill(false);

    // Initialize elevators at the ground floor
    updateElevators();

    // Attach event listeners to call buttons
    document.querySelectorAll(".call-button").forEach(button => {
        button.addEventListener("click", () => {
            const row = button.closest("tr");
            const floor = parseInt(row.dataset.floor);
            requestElevator(floor, button, row);
        });
    });

    function requestElevator(floor, button, row) {
        if (button.classList.contains("waiting")) return;

        button.classList.add("waiting");
        button.textContent = "Waiting...";

        let availableElevator = findNearestAvailableElevator(floor);
        if (availableElevator === null) {
            queue.push({ floor, button, row });
        } else {
            moveElevator(availableElevator, floor, button, row);
        }
    }

    function findNearestAvailableElevator(floor) {
        let minDistance = Infinity;
        let selectedElevator = null;

        for (let i = 0; i < numElevators; i++) {
            if (!elevatorsBusy[i]) {
                let distance = Math.abs(elevatorPositions[i] - floor);
                if (distance < minDistance) {
                    minDistance = distance;
                    selectedElevator = i;
                }
            }
        }

        return selectedElevator;
    }

    function moveElevator(elevatorIndex, targetFloor, button, row) {
        if (elevatorsBusy[elevatorIndex]) return;
        elevatorsBusy[elevatorIndex] = true;

        let currentFloor = elevatorPositions[elevatorIndex];
        let travelTime = Math.abs(currentFloor - targetFloor) * 2; // 2 seconds per floor
        let timerCell = row.querySelector(".timer-cell");
        timerCell.textContent = `Moving (${travelTime}s)`;

        let step = currentFloor < targetFloor ? 1 : -1;
        let movementInterval = setInterval(() => {
            if (currentFloor === targetFloor) {
                clearInterval(movementInterval);
                document.getElementById("arrival-sound").play();
                updateElevatorState(elevatorIndex, targetFloor, "arrived");
                button.textContent = "Arrived";
                timerCell.textContent = `Arrived in ${travelTime}s`;

                setTimeout(() => {
                    updateElevatorState(elevatorIndex, targetFloor, "idle");
                    button.textContent = "Call";
                    button.classList.remove("waiting");
                    elevatorsBusy[elevatorIndex] = false;
                    elevatorPositions[elevatorIndex] = targetFloor;

                    processQueue(); // Process next request in queue
                }, 2000);
            } else {
                currentFloor += step;
                elevatorPositions[elevatorIndex] = currentFloor;
                updateElevators();
            }
        }, 1000);
    }

    function processQueue() {
        if (queue.length > 0) {
            let nextCall = queue.shift();
            let availableElevator = findNearestAvailableElevator(nextCall.floor);
            if (availableElevator !== null) {
                moveElevator(availableElevator, nextCall.floor, nextCall.button, nextCall.row);
            } else {
                queue.unshift(nextCall); // Put it back if no elevator is free
            }
        }
    }

    function updateElevators() {
        document.querySelectorAll(".elevator-cell").forEach(cell => (cell.innerHTML = ""));
        for (let i = 0; i < numElevators; i++) {
            let floor = elevatorPositions[i];
            let elevatorCell = document.querySelectorAll(`tr[data-floor="${floor}"] .elevator-cell`)[i];
            if (elevatorCell) {
                elevatorCell.innerHTML = elevatorsBusy[i]
                    ? `<img src="assets/elevator-red.svg" alt="Busy">`
                    : `<img src="assets/elevator-idle.svg" alt="Idle">`;
            }
        }
    }

    function updateElevatorState(elevatorIndex, floor, state) {
        let elevatorCell = document.querySelectorAll(`tr[data-floor="${floor}"] .elevator-cell`)[elevatorIndex];
        if (elevatorCell) {
            elevatorCell.innerHTML = state === "arrived"
                ? `<img src="assets/elevator-green.svg" alt="Arrived">`
                : `<img src="assets/elevator-idle.svg" alt="Idle">`;
        }
    }
});