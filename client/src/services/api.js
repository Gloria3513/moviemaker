const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', `${API_BASE_URL}/api/upload`);
    xhr.send(formData);
  });
};

export const getFiles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};

export const deleteFile = async (filename) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${filename}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const getFileUrl = (filename) => {
  return `${API_BASE_URL}/uploads/${filename}`;
};

export const getOutputUrl = (filename) => {
  return `${API_BASE_URL}/output/${filename}`;
};

// 영상 정보 가져오기
export const getVideoInfo = async (filename) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video/info/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting video info:', error);
    throw error;
  }
};

// 영상 자르기
export const trimVideo = async (filename, startTime, endTime) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video/trim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, startTime, endTime }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error trimming video:', error);
    throw error;
  }
};

// 영상 합치기
export const concatVideos = async (filenames) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video/concat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filenames }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error concatenating videos:', error);
    throw error;
  }
};

// 포맷 변환
export const convertVideo = async (filename, format, quality = 'medium') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, format, quality }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error converting video:', error);
    throw error;
  }
};

// 영상 필터 적용
export const applyVideoFilter = async (filename, filters) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, ...filters }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error applying video filter:', error);
    throw error;
  }
};

// 처리된 파일 목록 조회
export const getOutputFiles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/output`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching output files:', error);
    throw error;
  }
};

// 처리된 파일 삭제
export const deleteOutputFile = async (filename) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/output/${filename}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting output file:', error);
    throw error;
  }
};