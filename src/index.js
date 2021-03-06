const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const userToFind = users.find(element => element.username === username);

  if (!userToFind) {
    return response.status(400).json({error: "Usuário não tem registro"})
  }

  return next()
}

app.post('/users', (request, response) => {
  const { name, username }= request.body;

  const userToFind = users.find(element => element.username === username);

  if (userToFind) {
    return response.status(400).json({error: "Usuário já existe"})
  }

  const todos = [];

  const user = {
    id: uuidv4(),
    name,
    username,
    todos
  }

  users.push(user)

  return response.status(200).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const usersToFind = users.find(element => element.username === request.headers.username);

  return response.status(200).json(usersToFind.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = users.find(element => element.username === request.headers.username);

  if (!user) {
    return response.status(400).json({error: "Usuário não existe"})
  }

  const {title, deadline} = request.body

  const todoObject = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  }

  user.todos.push(todoObject)

  return response.status(201).json(todoObject)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  
  const {title, deadline} = request.body

  const user = users.find(element => element.username === request.headers.username);

  const todos = user.todos.find(element => element.id === id)

  if (!todos) {
    return response.status(404).json({error: "Todo não existe"})
  }

  todos.deadline = deadline
  todos.title = title

  return response.status(201).json(todos)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  
  const user = users.find(element => element.username === request.headers.username);

  const todos = user.todos.find(element => element.id === id)

  if (!todos) {
    return response.status(404).json({error: "Todo não existe"})
  }

  todos.done = true

  return response.status(201).json(todos)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  
  const user = users.find(element => element.username === request.headers.username);

  const todos = user.todos.find(element => element.id === id)

  if (!todos) {
    return response.status(404).json({error: "Todo não existe"})
  }

  for (let i = 0; i < user.todos.length; i++) {
    if (user.todos[i].id === todos.id)
    user.todos.splice(i, 1)
  }

  return response.status(204).json([])
});

module.exports = app;