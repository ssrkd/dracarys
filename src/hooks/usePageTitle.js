import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `qaraa.asia — ${title}` : 'qaraa.asia';

    // Очищаем при размонтировании компонента
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
