/**
 * Kakao Map 초기화 및 관리
 */

/**
 * Kakao Map을 초기화하고 마커를 표시합니다.
 * @param {string} latitude - 위도
 * @param {string} longitude - 경도
 */
export function initKakaoMap(latitude, longitude) {
  if (!window.kakao || !window.kakao.maps) {
    console.error("Kakao Maps SDK가 로드되지 않았습니다.");
    displayMapError();
    return;
  }

  window.kakao.maps.load(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      displayMapError();
      return;
    }

    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
      console.error("지도 컨테이너를 찾을 수 없습니다.");
      return;
    }

    const mapOption = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3,
    };

    const map = new window.kakao.maps.Map(mapContainer, mapOption);
    createMarker(map, lat, lng);
  });
}

/**
 * 마커를 생성합니다.
 * @param {kakao.maps.Map} map - 카카오 지도 객체
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 */
function createMarker(map, lat, lng) {
  const markerPosition = new window.kakao.maps.LatLng(lat, lng);

  const marker = new window.kakao.maps.Marker({
    position: markerPosition,
  });

  marker.setMap(map);
}

/**
 * 지도를 불러올 수 없을 때 에러 메시지를 표시합니다.
 */
function displayMapError() {
  const mapContainer = document.getElementById("map");
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; height:100%; color:#999;">
        위치 정보를 불러올 수 없습니다.
      </div>
    `;
  }
  console.warn("유효하지 않은 좌표 정보입니다.");
}
