const { app, BrowserWindow } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Biblioteca SQLite
const dbPath = path.join(__dirname, 'tarefas.db'); // Caminho do banco de dados

let mainWindow;

// Cria o banco de dados (ou abre, se já existir)
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

// Função para criar a janela do aplicativo
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

    // Carrega o HTML da página inicial
    mainWindow.loadFile('index.html');

    // Fecha a janela corretamente
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Quando o Electron estiver pronto, cria a janela
app.whenReady().then(createWindow);

// Encerra o aplicativo no fechamento de todas as janelas, exceto no macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Função para adicionar uma nova tarefa no banco de dados
function addTaskToDB(taskText, callback) {
    const query = `INSERT INTO tarefas (texto, completada) VALUES (?, ?)`;
    db.run(query, [taskText, false], function (err) {
        if (err) {
            console.error('Erro ao adicionar tarefa:', err);
            callback(err);
        } else {
            callback(null, this.lastID); // Retorna o ID da tarefa inserida
        }
    });
}

// Função para buscar todas as tarefas
function getAllTasksFromDB(callback) {
    const query = `SELECT * FROM tarefas`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar tarefas:', err);
            callback(err, []);
        } else {
            callback(null, rows); // Retorna todas as tarefas
        }
    });
}

// Função para marcar uma tarefa como completada
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

// Função para remover uma tarefa do banco de dados
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

// Expondo as funções de banco de dados para o processo de renderização
module.exports = {
    addTaskToDB,
    getAllTasksFromDB,
    toggleTaskCompletion,
    deleteTaskFromDB
};
