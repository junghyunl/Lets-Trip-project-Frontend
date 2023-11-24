import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import './result.css';

const { kakao } = window;

function PlaceList({ x, y, onPlaceSelect, createMap }) {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axios.get(`http://localhost:8000/place/?x=${x}&y=${y}`)
      .then(response => {
        setPlaces(response.data);
        createMap(x, y, response.data);
        setIsLoading(false);
      });
  }, [x, y, createMap]);

  return (
    <div >
      {isLoading ? (
        <div className="loader_wrap">
          <div className="loader"></div>
        </div>
      ) : (
        <ul className="list">
          {places.map((place, index) => (
            <li key={index} className="place">
              <p>{index + 1}. {place.name}</p>
              Rating: {place.rating}<br/>
              Type: {place.type}<br/>
              <button onClick={() => onPlaceSelect(place)}>플래너 추가</button>
              <button onClick={() => navigate(`/detail?content_id=${place.content_id}`)}>상세페이지</button>
            </li>
          ))}
        </ul>
        )}
    </div>
  );
}

function RestaurantList({ x, y, onRestaurantSelect }) {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get(`http://localhost:8000/restaurant/?x=${x}&y=${y}`)
      .then(response => {
        setRestaurants(response.data.result);
        setIsLoading(false);
      });
  }, [x, y]);

  return (
    <div>
      {isLoading ? (
        <div className="loader_wrap">
          <div className="loader"></div>
        </div>
      ) : (
        <ul className="list">
          {restaurants.map(([name, type], index) => (
            <li key={index} onClick={() => onRestaurantSelect(name)}>
              <h3>{name}</h3>
              <p>{type}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Planner({ items, onItemRemove }) {
  return (
    <div>
      <div className="planner_name">Planner</div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.name}
            <button onClick={() => onItemRemove(index)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Result() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const x = params.get('y');
  const y = params.get('x');
  const type = params.get('type');
  const [plannerItems, setPlannerItems] = useState([]);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ x: x, y: y });

  const handlePlaceSelect = place => {
    setPlannerItems(currentItems => [...currentItems, place]);
  };

  const handleRestaurantSelect = name => {
    setPlannerItems(currentItems => [...currentItems, { name }]);
  };

  const handleItemRemove = index => {
    setPlannerItems(currentItems => currentItems.filter((_, i) => i !== index));
  };

  const createMap = useCallback((x, y, places) => {
    var mapContainer = document.getElementById('map'), 
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), 
        level: 3
    };      
    var map = new kakao.maps.Map(mapContainer, mapOption);
    setMap(map);
  
    kakao.maps.event.addListener(map, 'center_changed', function() {
      var latlng = map.getCenter();
      setCenter({
        x: latlng.getLat(),
        y: latlng.getLng(),
      });
    });
  
    var bounds = new kakao.maps.LatLngBounds();
  
    places.map((place, index) => {
      var position = new kakao.maps.LatLng(place.y, place.x);
      var marker = new kakao.maps.Marker({
        map: map,
        position: position
      });
      var i = index + 1;
      var content = '<div class ="label"><span class="left"></span><span class="center">'+ i +'</span><span class="right"></span></div>';
      var customOverlay = new kakao.maps.CustomOverlay({
        position: position,
        content: content   
      });
      customOverlay.setMap(map);
      bounds.extend(position);
    });
    map.setBounds(bounds);
  }, [setMap, setCenter]);

  const placeLink = useMemo(() => {
    return `/result?type=place&x=${center.y}&y=${center.x}`;
  }, [center]);
  
  const restaurantLink = useMemo(() => {
    return `/result?type=restaurant&x=${center.y}&y=${center.x}`;
  }, [center]);

  return (
      <div id="map" style={{width:'84%', height:'calc(100vh - 80px)', position:'fixed', right:'0px', top:'80px', overflow:'hidden'}}>
      <div className="list_wrap">
        <div className="selecting">
          <div className="result-button-container">
            <ul>
            <li>
              <Link className="button" to={placeLink}>관광지</Link>
            </li>
            <li>
              <Link className="button" to={restaurantLink}>음식점</Link>  
            </li>
            </ul>
          </div>
          {type === 'place'
      ? <PlaceList x={y} y={x} onPlaceSelect={handlePlaceSelect} createMap={createMap} />
      : <RestaurantList x={y} y={x} onRestaurantSelect={handleRestaurantSelect} />}
        </div>
      </div>
      <div className="planner">
        <Planner items={plannerItems} onItemRemove={handleItemRemove} />
      </div>
    </div>
  );
}

export default Result;
