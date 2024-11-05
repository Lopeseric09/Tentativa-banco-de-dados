const { app, BrowserWindow } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); 
const dbPath = path.join(__dirname, 'tarefas.db'); 

let mainWindow;


const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err);
    } else {
        console.log('Banco de dados aberto com sucesso');
        // Cria a tabela de tarefas, se não existir
        db.run(`CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            texto TEXT,
            completada BOOLEAN
        )`);
    }
});


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

   
    mainWindow.loadFile('index.html');

  
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


app.whenReady().then(createWindow);


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


function addTaskToDB(taskText, callback) {
    const query = `INSERT INTO tarefas (texto, completada) VALUES (?, ?)`;
    db.run(query, [taskText, false], function (err) {
        if (err) {
            console.error('Erro ao adicionar tarefa:', err);
            callback(err);
        } else {
            callback(null, this.lastID); 
        }
    });
}


function getAllTasksFromDB(callback) {
    const query = `SELECT * FROM tarefas`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar tarefas:', err);
            callback(err, []);
        } else {
            callback(null, rows); 
        }
    });
}


function toggleTaskCompletion(id, isCompleted, callback) {
    const query = `UPDATE tarefas SET completada = ? WHERE id = ?`;
    db.run(query, [isCompleted ? 1 : 0, id], function (err) {
        if (err) {
            console.error('Erro ao atualizar tarefa:', err);
            callback(err);
        } else {
            callback(null);
        }
    });
}


function deleteTaskFromDB(id, callback) {
    const query = `DELETE FROM tarefas WHERE id = ?`;
    db.run(query, [id], function (err) {
        if (err) {
            console.error('Erro ao excluir tarefa:', err);
            callback(err);
        } else {
            callback(null);
        }
    });
}


module.exports = {
    addTaskToDB,
    getAllTasksFromDB,
    toggleTaskCompletion,
    deleteTaskFromDB
};
