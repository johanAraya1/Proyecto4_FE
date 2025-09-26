import React, { useState } from 'react';
import Login from './Login';
import Dashboard from './components/dashboard/Dashboard';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #F5F5F5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

export default function App() {
  const [user, setUser] = useState(null);
  
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      <GlobalStyle />
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={setUser} />
      )}
    </>
  );
}
