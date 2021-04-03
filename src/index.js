const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers 

  const user = users.find(user => user.username === username)
  if(!user){
    return response.status(404).json({error: "User not found"})
  }
  request.user = user
  
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const verifyUser = users.find( user => user.username === username)
  
  if(verifyUser){
    return response.status(400).json({error: "User alread existis"})
  }
    const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

//Consulta os TODOS
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

    return response.json(user.todos)
    
});

//Cria um TODO
app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const {user} = request
  const {title, deadline} = request.body

  const todo =  {
  id: uuidv4(), // precisa ser um uuid
	title,
	done: false, 
	deadline: new Date(deadline), 
	created_at: new Date()
  }
 
  user.todos.push(todo)
  return response.status(201).json(todo)
});

//Atualiza as propriedade deadline e title de um TODO
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
 const {id} = request.params
 const { title, deadline} = request.body
 const {user} = request

 const todo = user.todos.find(todo => todo.id == id)

  if(!todo){
    return response.status(404).json({error: "Todo not found"})
  }
  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(201).json(todo)
});

//atualiza a propriedade done do TODO
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  const todo = user.todos.find(todo => todo.id == id)

  if(!todo){
    return response.status(404).json({error: "Todo not found"})
  }

  todo.done = true
  return response.status(201).json(todo)
});

//Deleta um TODO
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  const todoIndex = user.todos.findIndex(todo => todo.id == id)

  if(todoIndex === -1){
    return response.status(404).json({error: "Todo not found"})
  }

user.todos.splice(todoIndex, 1)

return response.status(204).json()
});

module.exports = app;