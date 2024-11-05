const { contextBridge, ipcRenderer } = require('electron');

// Expondo as funções do main.js para o processo de renderização
contextBridge.exposeInMainWorld('api', {
    addTask: (taskText, callback) => ipcRenderer.send('add-task', taskText, callback),
    updateTaskCompletion: (id, isCompleted, callback) => ipcRenderer.send('update-task-completion', id, isCompleted, callback),
    removeTask: (id, callback) => ipcRenderer.send('remove-task', id, callback),
   
