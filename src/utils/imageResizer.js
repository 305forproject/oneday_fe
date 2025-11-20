import imageCompression from "browser-image-compression";

/**
 * 이미지 리사이징 설정
 */
const IMAGE_CONFIG = {
  TARGET_WIDTH: 1200,
  TARGET_HEIGHT: 900,
  MIN_WIDTH: 800,
  MIN_HEIGHT: 600,
  MAX_WIDTH: 2400,
  MAX_HEIGHT: 1800,
  ASPECT_RATIO: 4 / 3,
  MAX_FILE_SIZE_MB: 2, // 압축 후 목표 크기
  QUALITY: 0.85, // JPEG 품질
};

/**
 * 이미지를 4:3 비율로 Center Crop 후 리사이징합니다.
 * @param {File} file - 원본 이미지 파일
 * @param {Function} onProgress - 진행률 콜백 (0~100)
 * @returns {Promise<File>} 리사이징된 이미지 파일
 */
export async function resizeImage(file, onProgress = null) {
  try {
    // 1. 이미지 로드
    const img = await loadImage(file);

    // 2. 4:3 비율로 Center Crop
    const croppedCanvas = centerCropToAspectRatio(
      img,
      IMAGE_CONFIG.ASPECT_RATIO
    );

    // 3. 목표 크기로 리사이징
    const resizedCanvas = resizeCanvas(
      croppedCanvas,
      IMAGE_CONFIG.TARGET_WIDTH,
      IMAGE_CONFIG.TARGET_HEIGHT
    );

    // 4. Canvas를 Blob으로 변환
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
 * 이미지를 지정된 비율로 Center Crop합니다.
 * @param {HTMLImageElement} img - 원본 이미지
 * @param {number} targetAspectRatio - 목표 비율 (4/3)
 * @returns {HTMLCanvasElement}
 */
function centerCropToAspectRatio(img, targetAspectRatio) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const imgAspectRatio = img.width / img.height;

  let sourceWidth, sourceHeight, sourceX, sourceY;

  if (imgAspectRatio > targetAspectRatio) {
    // 이미지가 더 넓음 → 좌우를 자름
    sourceHeight = img.height;
    sourceWidth = img.height * targetAspectRatio;
    sourceX = (img.width - sourceWidth) / 2;
    sourceY = 0;
  } else {
    // 이미지가 더 높음 → 상하를 자름
    sourceWidth = img.width;
    sourceHeight = img.width / targetAspectRatio;
    sourceX = 0;
    sourceY = (img.height - sourceHeight) / 2;
  }

  // Canvas 크기 설정 (원본 비율 유지)
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  // 이미지 그리기 (Center Crop)
  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    sourceWidth,
    sourceHeight
  );

  return canvas;
}

/**
 * Canvas를 목표 크기로 리사이징합니다.
 * @param {HTMLCanvasElement} sourceCanvas - 원본 Canvas
 * @param {number} targetWidth - 목표 너비
 * @param {number} targetHeight - 목표 높이
 * @returns {HTMLCanvasElement}
 */
function resizeCanvas(sourceCanvas, targetWidth, targetHeight) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 고품질 리샘플링 설정
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 리사이징
  ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

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
      `이미지가 매우 큽니다. 자동으로 ${IMAGE_CONFIG.TARGET_WIDTH}x${IMAGE_CONFIG.TARGET_HEIGHT}px로 조정됩니다.`
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
