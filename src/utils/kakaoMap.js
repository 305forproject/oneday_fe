/**
 * Kakao Maps SDK를 동적으로 로드합니다.
 * @returns {Promise} 스크립트 로드 완료 시 resolve 되는 Promise
 */
function loadKakaoMapScript() {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있다면 바로 성공 처리
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    // 이미 스크립트 태그가 삽입되어 있는지 확인 (중복 로딩 방지)
    const existingScript = document.getElementById("kakao-map-script");
    if (existingScript) {
      existingScript.onload = resolve;
      existingScript.onerror = reject;
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-script";
    // ★ 여기서 import.meta.env를 사용하여 확실하게 키를 넣습니다.
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      // 스크립트 로드 후 kakao 객체가 생길 때까지 약간의 딜레이가 필요할 수 있음
      window.kakao.maps.load(() => {
        resolve();
      });
    };

    script.onerror = (err) => {
      console.error("Kakao Maps 스크립트 로드 실패:", err);
      reject(err);
    };

    document.head.appendChild(script);
  });
}

/**
 * Kakao Map을 초기화하고 마커를 표시합니다.
 * @param {string} latitude - 위도
 * @param {string} longitude - 경도
 */
export async function initKakaoMap(latitude, longitude) {
  try {
    // 1. 지도를 그리기 전에 스크립트 먼저 로드
    await loadKakaoMapScript();

    // 2. 로드 완료 후 기존 로직 실행
    if (!window.kakao || !window.kakao.maps) {
      console.error("Kakao Maps SDK가 로드되지 않았습니다.");
      displayMapError();
      return;
    }

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

  } catch (error) {
    console.error("지도 초기화 중 오류 발생:", error);
    displayMapError();
  }
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
