import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px 25px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Logo = styled.div`
  img {
    height: 80px;
    width: auto;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const LogoutButton = styled.button`
  background: #6b4423;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s;

  &:hover {
    background: #5a371c;
  }

  display: flex;
  align-items: center;
  gap: 8px;
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #6b4423;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
`;

const UserInfo = styled.div`
  h3 {
    margin: 0;
    color: #6b4423;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .admin-badge {
    background-color: #ffb800;
    color: #6b4423;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7em;
    font-weight: bold;
  }

  p {
    margin: 5px 0 0;
    color: #ffb800;
    font-weight: 500;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
`;

const ActiveOrders = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const OrdersTitle = styled.h2`
  color: #6b4423;
  margin-bottom: 20px;
`;

const RecipeCard = styled.div`
  background: #f8f8f8;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
`;

const RecipeTitle = styled.h3`
  color: #6b4423;
  margin: 0 0 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    color: #ffb800;
    font-size: 0.9em;
  }
`;

const Ingredients = styled.div`
  display: flex;
  gap: 15px;
`;

const Ingredient = styled.div`
  text-align: center;
  img {
    width: 60px;
    height: 60px;
    margin-bottom: 8px;
    object-fit: cover;
    border-radius: 8px;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
  p {
    margin: 0;
    font-size: 1em;
    color: #666;
    font-weight: 500;
  }
`;

const RewardInfo = styled.p`
  color: #666;
  margin: 10px 0;
  font-size: 0.9em;
`;

const IngredientBoardButton = styled.button`
  background: #6b4423;
  color: white;
  border: none;
  padding: 15px;
  width: 100%;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  transition: background-color 0.3s;

  &:hover {
    background: #5a371c;
  }
`;

const Dashboard = ({ user, onLogout }) => {
  console.log('Dashboard recibió usuario:', user);

  if (!user) {
    console.error('No se recibieron datos de usuario');
    return <div>Cargando...</div>;
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderLeft>
          <Logo>
            <img
              src={process.env.PUBLIC_URL + '/assets/logo.png'}
              alt='CoffeeCenfo'
            />
          </Logo>
          <Profile>
            <Avatar>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <UserInfo>
              <h3>
                {user.name || 'Usuario'}
                {user.role === 'admin' && (
                  <span className='admin-badge'>Admin</span>
                )}
              </h3>
              <p>ELO: {user.elo || 0}</p>
            </UserInfo>
          </Profile>
        </HeaderLeft>
        <LogoutButton onClick={handleLogout}>
          <span className='icon'>🚪</span>
          Cerrar Sesión
        </LogoutButton>
      </Header>

      <MainContent>
        <ActiveOrders>
          <OrdersTitle>Active Orders</OrdersTitle>

          <RecipeCard>
            <RecipeTitle>
              Caramel Macchiato
              <span>2:40</span>
            </RecipeTitle>
            <Ingredients>
              <Ingredient>
                <img src='/assets/cafe.jpg' alt='Café' />
                <p>Café</p>
              </Ingredient>
              <Ingredient>
                <img src='/assets/leche.jpg' alt='Leche' />
                <p>Leche</p>
              </Ingredient>
              <Ingredient>
                <img src='/assets/agua.jpg' alt='Agua' />
                <p>Agua</p>
              </Ingredient>
            </Ingredients>
            <RewardInfo>Reward: 50 pts</RewardInfo>
          </RecipeCard>

          <RecipeCard>
            <RecipeTitle>
              Classic Latte
              <span>1:30</span>
            </RecipeTitle>
            <Ingredients>
              <Ingredient>
                <img src='/assets/cafe.jpg' alt='Café' />
                <p>Café</p>
              </Ingredient>
              <Ingredient>
                <img src='/assets/leche.jpg' alt='Leche' />
                <p>Leche</p>
              </Ingredient>
            </Ingredients>
            <RewardInfo>Reward: 30 pts</RewardInfo>
          </RecipeCard>

          <IngredientBoardButton>
            <span className='icon'>📋</span>
            Go to Ingredient Board
          </IngredientBoardButton>
        </ActiveOrders>
      </MainContent>
    </DashboardContainer>
  );
};

Dashboard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    elo: PropTypes.number,
  }).isRequired,
  onLogout: PropTypes.func,
};

export default Dashboard;
