import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './input.css';

function Input() {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/result?x=${x}&y=${y}`);
  };

  return (
    <form class="selecting" onSubmit={handleSubmit}>
      <h2>숙소위치를 입력해주세요!</h2>
      
      <input type="text" value={x} onChange={(e) => setX(e.target.value)} placeholder="Enter X coordinate" />
      <input type="text" value={y} onChange={(e) => setY(e.target.value)} placeholder="Enter Y coordinate" />
      <button type="submit">Submit</button>
    </form>
  );
}

export default Input;