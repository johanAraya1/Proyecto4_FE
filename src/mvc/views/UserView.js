// Vista de usuarios y llamada a endpoint real
import React, { useState, useEffect } from 'react';
import UserController from '../controllers/UserController';

export default function UserView() {
  const [users, setUsers] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const res = UserController.getUsers();
    if (res.status === 200) setUsers(res.data);
  }, []);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(res => res.json())
      .then(data => setApiData(data));
  }, []);

  const handleAdd = () => {
    setError('');
    try {
      const res = UserController.createUser(name, email);
      if (res.status === 201) setUsers([...users, res.data]);
      else setError(res.error);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>Usuarios</h2>
      <ul>
        {users.map(u => <li key={u.id}>{u.name} ({u.email})</li>)}
      </ul>
      <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={handleAdd}>Agregar usuario</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      <h3>Respuesta de endpoint real:</h3>
      <pre>{apiData ? JSON.stringify(apiData, null, 2) : 'Cargando...'}</pre>
    </div>
  );
}
