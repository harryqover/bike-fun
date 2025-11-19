// import './style.css'

const appState = {
  currentMonth: {
    name: '',
    daysRemaining: 0,
    tasks: []
  },
  nextMonth: {
    name: '',
    daysRemaining: 0,
    tasks: []
  },
  holidays: {}, // Object: { 'YYYY-MM-DD': number (1 or 0.5) }
  manualDaysOverride: {
    current: false,
    next: false
  }
};

function init() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Setup Month Names
  const currentMonthName = today.toLocaleString('default', { month: 'long' });
  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthName = nextMonthDate.toLocaleString('default', { month: 'long' });

  appState.currentMonth.name = currentMonthName;
  appState.nextMonth.name = nextMonthName;

  // Load state from URL or LocalStorage
  if (loadFromURL()) {
    console.log('Loaded state from URL');
  } else {
    loadFromLocalStorage();
  }

  // Calculate days if not manually overridden
  if (!appState.manualDaysOverride.current) {
    appState.currentMonth.daysRemaining = calculateDaysRemaining(today, new Date(today.getFullYear(), today.getMonth() + 1, 0));
  }

  if (!appState.manualDaysOverride.next) {
    // For next month, default to total days in month if not overridden? 
    // Or maybe calculate working days from start to end of next month?
    // Let's do working days for next month too as a smart default.
    const startNext = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const endNext = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    appState.nextMonth.daysRemaining = calculateDaysRemaining(startNext, endNext);
  }

  renderHeader();
  renderTasks('current');
  renderTasks('next');
  renderHolidays();
  updatePreview();

  setupEventListeners();
}

function calculateDaysRemaining(startDate, endDate) {
  let count = 0;
  const curDate = new Date(startDate);
  curDate.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (curDate <= end) {
    const dayOfWeek = curDate.getDay();
    const isWeekend = (dayOfWeek === 6) || (dayOfWeek === 0);
    // Adjust date string to local timezone for holiday check to avoid timezone issues
    const dateString = curDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const holidayDeduction = appState.holidays[dateString] || 0;

    if (!isWeekend) {
      count += Math.max(0, 1 - holidayDeduction);
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

function saveState() {
  localStorage.setItem('slackWorkloadState', JSON.stringify(appState));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('slackWorkloadState');
  if (saved) {
    const parsed = JSON.parse(saved);
    // Merge saved tasks and holidays, but keep dynamic month names
    appState.currentMonth.tasks = parsed.currentMonth.tasks || [];
    appState.nextMonth.tasks = parsed.nextMonth.tasks || [];

    // Migration: Convert array to object if needed
    if (Array.isArray(parsed.holidays)) {
      appState.holidays = {};
      parsed.holidays.forEach(date => {
        appState.holidays[date] = 1;
      });
    } else {
      appState.holidays = parsed.holidays || {};
    }

    // Only restore days remaining if it was manually overridden
    if (parsed.manualDaysOverride?.current) {
      appState.currentMonth.daysRemaining = parsed.currentMonth.daysRemaining;
      appState.manualDaysOverride.current = true;
    }
    if (parsed.manualDaysOverride?.next) {
      appState.nextMonth.daysRemaining = parsed.nextMonth.daysRemaining;
      appState.manualDaysOverride.next = true;
    }
  }
}

function generateShareLink() {
  const stateString = JSON.stringify(appState);
  const encoded = btoa(encodeURIComponent(stateString));
  const url = new URL(window.location.href);
  url.hash = encoded;
  return url.toString();
}

function loadFromURL() {
  if (window.location.hash) {
    try {
      const encoded = window.location.hash.substring(1);
      const decoded = decodeURIComponent(atob(encoded));
      const parsed = JSON.parse(decoded);

      // Apply parsed state
      appState.currentMonth.tasks = parsed.currentMonth.tasks || [];
      appState.nextMonth.tasks = parsed.nextMonth.tasks || [];

      // Migration for URL state too
      if (Array.isArray(parsed.holidays)) {
        appState.holidays = {};
        parsed.holidays.forEach(date => {
          appState.holidays[date] = 1;
        });
      } else {
        appState.holidays = parsed.holidays || {};
      }

      if (parsed.manualDaysOverride?.current) {
        appState.currentMonth.daysRemaining = parsed.currentMonth.daysRemaining;
        appState.manualDaysOverride.current = true;
      }
      if (parsed.manualDaysOverride?.next) {
        appState.nextMonth.daysRemaining = parsed.nextMonth.daysRemaining;
        appState.manualDaysOverride.next = true;
      }

      // Clean URL
      history.replaceState(null, null, ' ');
      return true;
    } catch (e) {
      console.error('Failed to load from URL', e);
      return false;
    }
  }
  return false;
}

function renderHeader() {
  document.getElementById('current-month-title').textContent = appState.currentMonth.name;
  document.getElementById('current-month-days').value = appState.currentMonth.daysRemaining;

  document.getElementById('next-month-title').textContent = appState.nextMonth.name;
  document.getElementById('next-month-days').value = appState.nextMonth.daysRemaining;
}

function createTaskElement(task, month, index) {
  const div = document.createElement('div');
  div.className = 'task-item';
  div.innerHTML = `
    <input type="text" class="task-duration" placeholder="3 days" value="${task.duration}" data-field="duration">
    <input type="text" class="task-desc" placeholder="Task description" value="${task.description}" data-field="description">
    <input type="text" class="task-emoji" placeholder="🚀" value="${task.emoji}" data-field="emoji">
    <button class="remove-btn" aria-label="Remove task">×</button>
  `;

  const inputs = div.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const field = e.target.dataset.field;
      appState[`${month}Month`].tasks[index][field] = e.target.value;
      updatePreview();
      saveState();
    });
  });

  div.querySelector('.remove-btn').addEventListener('click', () => {
    appState[`${month}Month`].tasks.splice(index, 1);
    renderTasks(month);
    updatePreview();
    saveState();
  });

  return div;
}

function renderTasks(month) {
  const container = document.getElementById(`${month}-month-tasks`);
  container.innerHTML = '';
  appState[`${month}Month`].tasks.forEach((task, index) => {
    container.appendChild(createTaskElement(task, month, index));
  });
}

function addTask(month) {
  appState[`${month}Month`].tasks.push({ duration: '', description: '', emoji: '' });
  renderTasks(month);
  updatePreview();
  saveState();
}

function generateSlackText() {
  let text = `FYI my plan for the end of the year 🍾\n\n`;

  // Current Month
  text += `*${appState.currentMonth.daysRemaining} days before end of ${appState.currentMonth.name}* 🌕\n`;
  appState.currentMonth.tasks.forEach(task => {
    const duration = task.duration ? `${task.duration}: ` : '';
    const emoji = task.emoji ? ` ${task.emoji}` : '';
    text += `• ${duration}${task.description}${emoji}\n`;
  });

  text += `\n`;

  // Next Month
  text += `*${appState.nextMonth.daysRemaining} days before in ${appState.nextMonth.name} before* 🎅 🌕\n`;
  appState.nextMonth.tasks.forEach(task => {
    const duration = task.duration ? `${task.duration}: ` : '';
    const emoji = task.emoji ? ` ${task.emoji}` : '';
    text += `• ${duration}${task.description}${emoji}\n`;
  });

  return text;
}

function updatePreview() {
  const preview = document.getElementById('slack-preview');
  preview.textContent = generateSlackText();
}

function renderHolidays() {
  const list = document.getElementById('holiday-list');
  list.innerHTML = '';

  const sortedDates = Object.keys(appState.holidays).sort();

  sortedDates.forEach((date) => {
    const value = appState.holidays[date];
    const li = document.createElement('li');
    li.className = 'holiday-item';
    li.innerHTML = `
      <span>${date} ${value === 0.5 ? '<small>(Half)</small>' : ''}</span>
      <button class="remove-btn" data-date="${date}">×</button>
    `;
    li.querySelector('.remove-btn').addEventListener('click', (e) => {
      const dateToDelete = e.target.dataset.date;
      delete appState.holidays[dateToDelete];
      renderHolidays();
      recalculateDays();
      saveState();
    });
    list.appendChild(li);
  });
}

function recalculateDays() {
  const today = new Date();

  if (!appState.manualDaysOverride.current) {
    appState.currentMonth.daysRemaining = calculateDaysRemaining(today, new Date(today.getFullYear(), today.getMonth() + 1, 0));
    document.getElementById('current-month-days').value = appState.currentMonth.daysRemaining;
  }

  if (!appState.manualDaysOverride.next) {
    const startNext = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const endNext = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    appState.nextMonth.daysRemaining = calculateDaysRemaining(startNext, endNext);
    document.getElementById('next-month-days').value = appState.nextMonth.daysRemaining;
  }
  updatePreview();
}

function setupEventListeners() {
  // Add Task Buttons
  document.querySelectorAll('.add-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      addTask(e.target.dataset.month);
    });
  });

  // Copy Button
  document.getElementById('copy-btn').addEventListener('click', () => {
    const text = generateSlackText();
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copy-btn');
      const originalText = btn.textContent;
      btn.textContent = 'Copied! 🎉';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  });

  // Share Button
  document.getElementById('share-btn').addEventListener('click', () => {
    const url = generateShareLink();
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('share-btn');
      const originalText = btn.textContent;
      btn.textContent = 'Link Copied! 🔗';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  });

  // Days Inputs
  document.getElementById('current-month-days').addEventListener('input', (e) => {
    appState.currentMonth.daysRemaining = e.target.value;
    appState.manualDaysOverride.current = true;
    updatePreview();
    saveState();
  });

  document.getElementById('next-month-days').addEventListener('input', (e) => {
    appState.nextMonth.daysRemaining = e.target.value;
    appState.manualDaysOverride.next = true;
    updatePreview();
    saveState();
  });

  // Settings Modal
  const modal = document.getElementById('settings-modal');
  document.getElementById('settings-btn').addEventListener('click', () => {
    modal.classList.remove('hidden');
  });
  document.getElementById('close-modal-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Add Holiday
  document.getElementById('add-holiday-btn').addEventListener('click', () => {
    const startInput = document.getElementById('holiday-date-input');
    const endInput = document.getElementById('holiday-end-date-input');
    const halfDayInput = document.getElementById('holiday-half-day');

    if (startInput.value) {
      const startDate = new Date(startInput.value);
      const endDate = endInput.value ? new Date(endInput.value) : new Date(startInput.value);
      const value = halfDayInput.checked ? 0.5 : 1;

      // Loop through dates
      const cur = new Date(startDate);
      while (cur <= endDate) {
        const dateString = cur.toISOString().split('T')[0];
        appState.holidays[dateString] = value;
        cur.setDate(cur.getDate() + 1);
      }

      renderHolidays();
      recalculateDays();
      saveState();

      // Reset form
      startInput.value = '';
      endInput.value = '';
      halfDayInput.checked = false;
    }
  });
}

init();
