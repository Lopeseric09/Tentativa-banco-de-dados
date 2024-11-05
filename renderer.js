const taskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');

let tasks = [];

// Função para atualizar o contador de tarefas
function updateTaskCounter() {
    const remainingTasks = tasks.filter(task => !task.completada).length;
    taskCounter.textContent = `Tarefas restantes: ${remainingTasks}`;
}

// Função para renderizar as tarefas na tela
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.textContent = task.texto;
        if (task.completada) {
            taskItem.classList.add('completed');
        }

        taskItem.addEventListener('click', () => {
            task.completada = !task.completada;
            updateTaskCompletion(task.id, task.completada);
        });

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remover';
        removeButton.classList.add('remove-task');
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            removeTask(task.id);
        });

        taskItem.appendChild(removeButton);
        taskList.appendChild(taskItem);
    });
    updateTaskCounter();
}

// Função para adicionar uma tarefa ao banco de dados
function addTask(taskText) {
    if (taskText) {
        // Adiciona a tarefa no banco de dados
        window.api.addTask(taskText, (err, id) => {
            if (!err) {
                tasks.push({ id, texto: taskText, completada: false });
                renderTasks();
            }
        });
    }
}

// Função para atualizar o status de conclusão da tarefa
function updateTaskCompletion(id, isCompleted) {
    window.api.updateTaskCompletion(id, isCompleted, () => {
        tasks = tasks.map(task => {
            if (task.id === id) {
                task.completada = isCompleted;
            }
            return task;
        });
        renderTasks();
    });
}

// Função para remover uma tarefa do banco de dados
function removeTask(id) {
    window.api.removeTask(id, () => {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    });
}

// Evento de adicionar nova tarefa ao clicar no botão
addTaskButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText);
        taskInput.value = '';
    }
});

// Evento de adicionar nova tarefa ao pressionar Enter
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskButton.click();
    }
});

// Carrega as tarefas do banco de dados
window.api.getAllTasks((tasksFromDB) => {
    tasks = tasksFromDB;
    renderTasks();
});
