// Servicio con validación mínima
import User from '../models/User';
import UserRepository from '../repositories/UserRepository';

const UserService = {
  getAllUsers: () => UserRepository.getAll(),
  addUser: (name, email) => {
    if (!name || !email) throw new Error('Nombre y email requeridos');
    const user = new User(Date.now(), name, email);
    return UserRepository.add(user);
  },
};

export default UserService;
