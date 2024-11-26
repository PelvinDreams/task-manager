document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");
    const completedTaskList = document.getElementById("completedTaskList");
    const themeToggle = document.getElementById("themeToggle");
  
    // Load tasks from Local Storage
    const loadTasks = () => {
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      const completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
      tasks.forEach(addTaskToDOM);
      completedTasks.forEach(task => addTaskToDOM(task, true));
    };
  
    // Save tasks to Local Storage
    const saveTasks = () => {
      const tasks = Array.from(taskList.children).map(li => JSON.parse(li.dataset.task));
      const completedTasks = Array.from(completedTaskList.children).map(li => JSON.parse(li.dataset.task));
      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    };
  
    // Add a task to DOM
    const addTaskToDOM = (task, isCompleted = false) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <strong>${task.title}</strong> - ${task.description}
          <span>Priority: ${task.priority}</span> 
          <span>Due: ${task.dueDate}</span>
          <span class="countdown"></span> <!-- Countdown element -->
        </div>
        <div>
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
          ${!isCompleted ? `<button class="complete">Complete</button>` : ""}
        </div>
      `;
      li.dataset.task = JSON.stringify(task);
      (isCompleted ? completedTaskList : taskList).appendChild(li);
    };
  
    // Handle task form submission
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const task = {
        title: taskForm.taskTitle.value,
        description: taskForm.taskDescription.value,
        priority: taskForm.taskPriority.value,
        dueDate: taskForm.taskDueDate.value,
      };
      addTaskToDOM(task);
      saveTasks();
      taskForm.reset();
    });
  
    // Handle task actions
    document.body.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete")) {
        e.target.closest("li").remove();
        saveTasks();
      } else if (e.target.classList.contains("complete")) {
        const li = e.target.closest("li");
        addTaskToDOM(JSON.parse(li.dataset.task), true);
        li.remove();
        saveTasks();
      } else if (e.target.classList.contains("edit")) {
        const task = JSON.parse(e.target.closest("li").dataset.task);
        taskForm.taskTitle.value = task.title;
        taskForm.taskDescription.value = task.description;
        taskForm.taskPriority.value = task.priority;
        taskForm.taskDueDate.value = task.dueDate;
      }
    });
  
    // Dark mode toggle
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
    });
  
    // Countdown timer for tasks
    const startCountdown = () => {
      const tasks = Array.from(document.querySelectorAll("#taskList li"));
      tasks.forEach(task => {
        const taskData = JSON.parse(task.dataset.task);
        const dueDate = new Date(taskData.dueDate);
        const countdownElement = task.querySelector(".countdown");
  
        const updateCountdown = () => {
          const now = new Date();
          const timeLeft = dueDate - now;
  
          if (timeLeft <= 0) {
            countdownElement.textContent = "Overdue!";
            countdownElement.classList.add("overdue");
            return;
          }
  
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
          countdownElement.textContent = `${days}d ${hours}h ${minutes}m remaining`;
        };
  
        updateCountdown(); // Initial call
        setInterval(updateCountdown, 60000); // Update every minute
      });
    };
  
    // Filter tasks
    const filterTasks = () => {
      const searchQuery = document.getElementById("searchBar").value.toLowerCase();
      const priorityFilter = document.getElementById("priorityFilter").value;
      const tasks = Array.from(document.querySelectorAll("#taskList li"));
  
      tasks.forEach(task => {
        const taskData = JSON.parse(task.dataset.task);
        const matchesSearch = taskData.title.toLowerCase().includes(searchQuery) || 
                              taskData.description.toLowerCase().includes(searchQuery);
        const matchesPriority = priorityFilter === "All" || taskData.priority === priorityFilter;
  
        task.style.display = matchesSearch && matchesPriority ? "flex" : "none";
      });
    };
  
    document.getElementById("searchBar").addEventListener("input", filterTasks);
    document.getElementById("priorityFilter").addEventListener("change", filterTasks);
  
    // Notify upcoming tasks
    const notifyUpcomingTasks = () => {
      const tasks = Array.from(document.querySelectorAll("#taskList li"));
      const now = new Date();
  
      tasks.forEach(task => {
        const taskData = JSON.parse(task.dataset.task);
        const dueDate = new Date(taskData.dueDate);
        const timeLeft = dueDate - now;
  
        if (timeLeft > 0 && timeLeft <= 24 * 60 * 60 * 1000) { // Within 24 hours
          alert(`Task "${taskData.title}" is due within 24 hours!`);
        }
      });
    };
  
    setInterval(notifyUpcomingTasks, 60 * 60 * 1000); // Check every hour
  
    loadTasks();
    startCountdown();
  });
  