export const launchImageLibrary = (options, callback) => {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      const res = { didCancel: true };
      if (callback) callback(res);
      resolve(res);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = (e) => {
      const file = e.target && e.target.files && e.target.files[0];
      try {
        document.body.removeChild(input);
      } catch {}
      if (!file) {
        const res = { didCancel: true };
        if (callback) callback(res);
        resolve(res);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const base64 = typeof dataUrl === 'string' ? dataUrl.split(',')[1] || '' : '';
        const res = {
          assets: [
            {
              uri: dataUrl,
              base64,
              fileName: file.name,
              fileSize: file.size,
              type: file.type,
              width: 800,
              height: 600,
            },
          ],
        };
        if (callback) callback(res);
        resolve(res);
      };
      reader.onerror = () => {
        const res = { errorMessage: 'Failed to read image file' };
        if (callback) callback(res);
        resolve(res);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  });
};

export const launchCamera = (options, callback) => {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      const res = { didCancel: true };
      if (callback) callback(res);
      resolve(res);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = (e) => {
      const file = e.target && e.target.files && e.target.files[0];
      try {
        document.body.removeChild(input);
      } catch {}
      if (!file) {
        const res = { didCancel: true };
        if (callback) callback(res);
        resolve(res);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const base64 = typeof dataUrl === 'string' ? dataUrl.split(',')[1] || '' : '';
        const res = {
          assets: [
            {
              uri: dataUrl,
              base64,
              fileName: file.name,
              fileSize: file.size,
              type: file.type,
              width: 800,
              height: 600,
            },
          ],
        };
        if (callback) callback(res);
        resolve(res);
      };
      reader.onerror = () => {
        const res = { errorMessage: 'Failed to read camera photo' };
        if (callback) callback(res);
        resolve(res);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  });
};

export default {
  launchImageLibrary,
  launchCamera,
};
