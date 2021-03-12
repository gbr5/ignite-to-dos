const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(thisUser => thisUser.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(thisUser => thisUser.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "This 'username' already exists! Try again."});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const updatedTodo = user.todos.find(todo => todo.id === id);
  
  if (!updatedTodo) {
    return response.status(404).json({ error: "To do not found!"});
  }

  updatedTodo.title = title;
  updatedTodo.deadline = new Date(deadline).toISOString();

  return response.status(201).json(updatedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const updatedTodo = user.todos.find(todo => todo.id === id);

  if (!updatedTodo) {
    return response.status(404).json({ error: "To do not found!"});
  }

  if (!updatedTodo.done) {
    updatedTodo.done = true;
  }
  
  return response.json(updatedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const deletedTodo = user.todos.find(todo => todo.id === id);

  if (!deletedTodo) {
    return response.status(404).json({ error: "To do not found!"});
  }

  user.todos.splice(deletedTodo, 1);

  return response.status(204).send();
});

module.exports = app;