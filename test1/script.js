function addTask() {
    const taskContainer = document.getElementById("task-container");
  
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");
  
    const taskNameInput = document.createElement("input");
    taskNameInput.type = "text";
    taskNameInput.classList.add("task-name");
    taskNameInput.placeholder = "Task Description";
  
    const taskMinutesInput = document.createElement("input");
    taskMinutesInput.type = "number";
    taskMinutesInput.classList.add("task-minutes");
    taskMinutesInput.placeholder = "Minutes";
  
    const removeTaskButton = document.createElement("button");
    removeTaskButton.type = "button";
    removeTaskButton.textContent = "Remove Task";
    removeTaskButton.addEventListener("click", function () {
      removeTask(this);
    });
  
    taskDiv.appendChild(taskNameInput);
    taskDiv.appendChild(taskMinutesInput);
    taskDiv.appendChild(removeTaskButton);
  
    taskContainer.appendChild(taskDiv);
  }
  
  function removeTask(button) {
    const taskDiv = button.parentNode;
    taskDiv.parentNode.removeChild(taskDiv);
  }
  
  document.getElementById("task-form").addEventListener("submit", function (event) {
    event.preventDefault();
  
    // Retrieve form data
    const totalHours = parseInt(document.getElementById("total-hours").value);
    const taskInputs = document.getElementsByClassName("task");
  
    // Calculate total minutes and price
    let totalMinutes = 0;
    for (let i = 0; i < taskInputs.length; i++) {
      const taskMinutes = parseInt(taskInputs[i].getElementsByClassName("task-minutes")[0].value);
      totalMinutes += taskMinutes;
    }
  
    const totalPrice = calculatePrice(totalMinutes, totalHours);
  
    // Display the results
    alert(`Total Hours: ${totalHours}\nTotal Minutes: ${totalMinutes}\nTotal Price: $${totalPrice.toFixed(2)}`);
  });
  
  function calculatePrice(totalMinutes, totalHours) {
    const hourlyRate = 10; // $10 per 2 hours
  
    const selectedHours = Math.floor(totalMinutes / 60);
    const totalPrice = hourlyRate * selectedHours * (totalHours / 2);
  
    return totalPrice;
  }
  