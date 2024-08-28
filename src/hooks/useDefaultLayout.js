import { useState, useEffect } from 'react';
import defaultStyles from 'src/util/defaultStyles';

const useDefaultLayout = () => {
  const [base64CSS, setBase64CSS] = useState('');

  useEffect(() => {
    const encodeBase64 = (css) => {
      const blob = new Blob([css], { type: 'text/css' });
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
    };

    encodeBase64(defaultStyles).then((encodedCSS) => {
      setBase64CSS(encodedCSS);
    });

  }, []);

  return base64CSS;
};

export default useDefaultLayout;
