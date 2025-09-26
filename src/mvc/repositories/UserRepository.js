// Repositorio mock de usuarios
const users = [
  { id: 1, name: 'Juan', email: 'juan@email.com' },
  { id: 2, name: 'Ana', email: 'ana@email.com' }
];

const UserRepository = {
  getAll: () => users,
  add: (user) => {
    users.push(user);
    return user;
  }
};

export default UserRepository;