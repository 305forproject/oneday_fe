/**
 * Kakao Map 초기화 및 관리
 */

/**
 * Kakao Map을 초기화하고 마커와 인포윈도우를 표시합니다.
 * @param {string} latitude - 위도
 * @param {string} longitude - 경도
 * @param {string} className - 클래스 이름
 */
export function initKakaoMap(latitude, longitude, className) {
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
    createMarker(map, lat, lng, className);
  });
}

/**
 * 마커와 인포윈도우를 생성합니다.
 * @param {kakao.maps.Map} map - 카카오 지도 객체
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @param {string} className - 클래스 이름
 */
function createMarker(map, lat, lng, className) {
  const markerPosition = new window.kakao.maps.LatLng(lat, lng);

  const marker = new window.kakao.maps.Marker({
    position: markerPosition,
  });

  marker.setMap(map);

  const infowindow = new window.kakao.maps.InfoWindow({
    content: getInfoWindowContent(className),
  });

  infowindow.open(map, marker);

  window.kakao.maps.event.addListener(marker, "click", () => {
    infowindow.open(map, marker);
  });
}

/**
 * 인포윈도우 HTML 콘텐츠를 생성합니다.
 * @param {string} className - 클래스 이름
 * @returns {string} HTML 문자열
 */
function getInfoWindowContent(className) {
  return `<div style="padding:10px; font-size:14px; text-align:center; min-width:150px;">
    <strong>${escapeHtml(className)}</strong>
  </div>`;
}

/**
 * HTML 특수문자를 이스케이프 처리합니다.
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
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
