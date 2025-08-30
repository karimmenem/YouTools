import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const UserManagement = () => {
  const { language } = useLanguage();

  const users = [
    {
      id: 1,
      username: 'Kamal@youtools.com',
      first_name: 'Kamal',
      last_name: 'YouTools',
      is_admin: true,
      status: 'active'
    },
    {
      id: 2,
      username: 'Rabih@youtools.com',
      first_name: 'Rabih',
      last_name: 'YouTools',
      is_admin: true,
      status: 'active'
    }
  ];

  return (
    <div style={{
      background: '#ffffff',
      border: '2px solid rgba(211, 47, 47, 0.3)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(211, 47, 47, 0.1)'
    }}>
      <div style={{
        background: '#f8f8f8',
        padding: '24px 30px',
        borderBottom: '2px solid rgba(211, 47, 47, 0.3)'
      }}>
        <h2 style={{
          color: '#333333',
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          textShadow: 'none'
        }}>
          {language === 'pt' ? 'Gerenciamento de Usuários' : 'User Management'}
        </h2>
      </div>

      <div style={{ padding: '30px' }}>
        <div style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
        }}>
          {users.map(user => (
            <div key={user.id} style={{
              background: '#ffffff',
              border: '2px solid rgba(211, 47, 47, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  color: '#333333',
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: '0 0 8px 0'
                }}>
                  {user.first_name} {user.last_name}
                </h3>
                <p style={{
                  color: '#d32f2f',
                  fontSize: '14px',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {user.username}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: user.status === 'active' ? '#66bb6a' : '#ef5350',
                  boxShadow: user.status === 'active' ? '0 0 8px rgba(102, 187, 106, 0.5)' : '0 0 8px rgba(239, 83, 80, 0.5)'
                }}></div>
                <span style={{
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {user.status === 'active' 
                    ? (language === 'pt' ? 'Ativo' : 'Active')
                    : (language === 'pt' ? 'Inativo' : 'Inactive')
                  }
                </span>
                {user.is_admin && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'linear-gradient(145deg, #d32f2f 0%, #b71c1c 100%)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {language === 'pt' ? 'Administrador' : 'Administrator'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
