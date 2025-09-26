// Controlador de usuario
import UserService from '../services/UserService';

const UserController = {
  getUsers: () => {
    try {
      return { status: 200, data: UserService.getAllUsers() };
    } catch (e) {
      return { status: 500, error: e.message };
    }
  },
  createUser: (name, email) => {
    try {
      const user = UserService.addUser(name, email);
      return { status: 201, data: user };
    } catch (e) {
      return { status: 400, error: e.message };
    }
  }
};

export default UserController;