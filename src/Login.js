import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #F5F5F5;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 400px;
  margin: 2rem auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  img {
    width: 200px;
    height: auto;
    margin: 0 auto;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const Title = styled.h2`
  color: #FFB800;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const StyledForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
`;

const LoginButton = styled.button`
  background-color: #6B4423;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;

  &:disabled {
    background-color: #cccccc;
  }
`;

const ForgotPassword = styled.a`
  color: #FFB800;
  text-decoration: none;
  text-align: right;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  cursor: pointer;
`;

const GoogleButton = styled.button`
  background-color: white;
  color: #333;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8f8f8;
    border-color: #aaa;
  }

  .google-icon {
    color: #4285f4;
    font-size: 1.2rem;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ccc;
  }
  
  span {
    padding: 0 10px;
    color: #666;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 1rem;
  
  a {
    color: #FFB800;
    text-decoration: none;
    margin-left: 0.5rem;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  margin-top: 1rem;
`;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(result.error || 'Error de autenticación');
      } else {
        // Asegurémonos de que tenemos los datos del usuario estructurados correctamente
        const userData = {
          name: result.name || result.user?.name || result.username || 'Usuario',
          email: result.email || result.user?.email || email,
          role: result.role || result.user?.role || 'user',
          elo: result.elo || result.user?.elo || 0
        };
        console.log('Datos del usuario:', userData); // Para debugging
        onLogin(userData);
      }
    } catch (err) {
      setLoading(false);
      setError('Error de red o servidor');
    }
  };

  return (
    <>
      <GlobalStyle />
      <LoginContainer>
        <Logo>
          <img src={process.env.PUBLIC_URL + '/assets/logo.png'} alt="CoffeeCenfo" />
        </Logo>
        <Title>Conviértete en el mejor barista</Title>
        <StyledForm onSubmit={handleLogin}>
          <Input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <ForgotPassword href="#">¿Olvidaste tu contraseña?</ForgotPassword>
          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </LoginButton>
        </StyledForm>
        <Divider><span>O ingresa con</span></Divider>
        <GoogleButton>
          <FontAwesomeIcon icon={faGoogle} className="google-icon" />
          Google
        </GoogleButton>
        <RegisterLink>
          ¿No tiene cuenta?<a href="#">Regístrate</a>
        </RegisterLink>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </LoginContainer>
    </>
  );
}
