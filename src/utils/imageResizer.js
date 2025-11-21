import imageCompression from "browser-image-compression";

/**
 * 이미지 리사이징 설정
 */
const IMAGE_CONFIG = {
  MAX_WIDTH: 1600, // 최대 가로 크기
  MAX_HEIGHT: 1600, // 최대 세로 크기
  MIN_WIDTH: 800,
  MIN_HEIGHT: 600,
  MAX_FILE_SIZE_MB: 2, // 압축 후 목표 크기
  QUALITY: 0.85, // JPEG 품질
};

/**
 * 이미지를 원본 비율 유지하면서 최대 크기로 리사이징합니다.
 * @param {File} file - 원본 이미지 파일
 * @param {Function} onProgress - 진행률 콜백 (0~100)
 * @returns {Promise<File>} 리사이징된 이미지 파일
 */
export async function resizeImage(file, onProgress = null) {
  try {
    // 1. 이미지 로드
    if (onProgress) onProgress(20);
    const img = await loadImage(file);

    // 2. 원본 비율 유지하면서 최대 크기 계산
    if (onProgress) onProgress(40);
    const { width, height } = calculateResizeSize(
      img.width,
      img.height,
      IMAGE_CONFIG.MAX_WIDTH,
      IMAGE_CONFIG.MAX_HEIGHT
    );

    // 3. 리사이징 (원본 비율 유지)
    if (onProgress) onProgress(60);
    const resizedCanvas = resizeCanvas(img, width, height);

    // 4. Canvas를 Blob으로 변환
    if (onProgress) onProgress(80);
    const blob = await canvasToBlob(resizedCanvas, IMAGE_CONFIG.QUALITY);

    // 5. Blob을 File로 변환
    const resizedFile = new File([blob], file.name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    // 6. 추가 압축 (파일 크기가 목표보다 크면)
    if (resizedFile.size > IMAGE_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
      if (onProgress) onProgress(90);

      const compressedFile = await imageCompression(resizedFile, {
        maxSizeMB: IMAGE_CONFIG.MAX_FILE_SIZE_MB,
        useWebWorker: true,
        onProgress: (progress) => {
          if (onProgress) onProgress(90 + progress * 0.1); // 90~100%
        },
      });

      return compressedFile;
    }

    if (onProgress) onProgress(100);
    return resizedFile;
  } catch (error) {
    console.error("Image resizing failed:", error);
    throw new Error("이미지 처리 중 오류가 발생했습니다.");
  }
}

/**
 * File을 Image 객체로 로드합니다.
 * @param {File} file - 이미지 파일
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 로드할 수 없습니다."));
    };

    img.src = objectUrl;
  });
}

/**
 * 원본 비율을 유지하면서 최대 크기 내에 들어가도록 계산합니다.
 * @param {number} originalWidth - 원본 가로 크기
 * @param {number} originalHeight - 원본 세로 크기
 * @param {number} maxWidth - 최대 가로 크기
 * @param {number} maxHeight - 최대 세로 크기
 * @returns {Object} { width, height }
 */
function calculateResizeSize(
  originalWidth,
  originalHeight,
  maxWidth,
  maxHeight
) {
  // 원본이 최대 크기보다 작으면 그대로 반환
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  // 비율 계산
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;

  // 더 작은 비율을 선택 (원본 비율 유지하면서 최대 크기 내에 맞춤)
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

/**
 * 이미지를 목표 크기로 리사이징합니다 (원본 비율 유지).
 * @param {HTMLImageElement} img - 원본 이미지
 * @param {number} targetWidth - 목표 너비
 * @param {number} targetHeight - 목표 높이
 * @returns {HTMLCanvasElement}
 */
function resizeCanvas(img, targetWidth, targetHeight) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 고품질 리샘플링 설정
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 리사이징
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return canvas;
}

/**
 * Canvas를 Blob으로 변환합니다.
 * @param {HTMLCanvasElement} canvas - Canvas 요소
 * @param {number} quality - JPEG 품질 (0~1)
 * @returns {Promise<Blob>}
 */
function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas를 Blob으로 변환할 수 없습니다."));
        }
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * 이미지 크기 검증
 * @param {HTMLImageElement} img - 이미지 객체
 * @returns {Object} 검증 결과
 */
export function validateImageSize(img) {
  const { MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT } = IMAGE_CONFIG;

  const warnings = [];

  if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
    warnings.push(
      `이미지가 너무 작습니다. 최소 ${MIN_WIDTH}x${MIN_HEIGHT}px 이상 권장합니다.`
    );
  }

  if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
    warnings.push(
      `이미지가 매우 큽니다. 자동으로 최대 ${MAX_WIDTH}x${MAX_HEIGHT}px 이내로 조정됩니다.`
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * 이미지 설정 정보 가져오기
 */
export function getImageConfig() {
  return { ...IMAGE_CONFIG };
}
