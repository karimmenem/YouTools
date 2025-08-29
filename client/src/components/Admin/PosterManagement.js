import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getPosters, addPoster, deletePoster } from '../../services/posterService';
import './PosterManagement.css';

const PosterManagement = () => {
  const { language } = useLanguage();
  const [posters, setPosters] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPosters();
  }, []);

  const loadPosters = async () => {
    setLoading(true);
    const res = await getPosters();
    if (res.success) setPosters(res.data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newUrl && !imageFile) return;
    // determine image_url from file or URL
    let imageUrl = newUrl;
    if (imageFile) {
      imageUrl = imagePreview;
    }
    const res = await addPoster({ image_url: imageUrl });
    if (res.success) {
      setMessage({ type: 'success', text: language === 'pt' ? 'Cartaz adicionado!' : 'Poster added!' });
      setNewUrl('');
      loadPosters();
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'pt' ? 'Excluir este cartaz?' : 'Delete this poster?')) return;
    const res = await deletePoster(id);
    if (res.success) {
      setMessage({ type: 'success', text: language === 'pt' ? 'Cartaz removido!' : 'Poster removed!' });
      loadPosters();
    }
  };

  if (loading) return <p>{language === 'pt' ? 'Carregando cartazes...' : 'Loading posters...'}</p>;

  return (
    <div className="poster-management">
      <h2>{language === 'pt' ? 'Gerenciar Cartazes' : 'Manage Posters'}</h2>
      {message.text && <p className={message.type}>{message.text}</p>}
      <div className="add-poster-form">
        <input
          type="text"
          placeholder={language === 'pt' ? 'Image URL' : 'Image URL'}
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files[0];
            if (file) {
              setImageFile(file);
              const reader = new FileReader();
              reader.onload = ev => setImagePreview(ev.target.result);
              reader.readAsDataURL(file);
            }
          }}
        />
        <button onClick={handleAdd}>{language === 'pt' ? 'Adicionar' : 'Add'}</button>
      </div>
      {imagePreview && (
        <div style={{ marginBottom: '20px' }}>
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}
      <div className="poster-list">
        {posters.map(p => (
          <div key={p.id} className="poster-item">
            <img src={p.image_url} alt={`Poster ${p.id}`} />
            <button onClick={() => handleDelete(p.id)} className="delete-btn">{language === 'pt' ? 'Excluir' : 'Delete'}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PosterManagement;
