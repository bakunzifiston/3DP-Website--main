import { createContext, useCallback, useContext, useState } from 'react';
import Icon from '../components/ui/Icon.jsx';

const ToastContext = createContext(() => {});

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, tone = 'success') => {
      const id = nextId++;
      setToasts((t) => [...t.slice(-3), { id, message, tone }]);
      setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex animate-fade-up items-start gap-3 rounded-md bg-navy-900 px-4 py-3 text-[0.9rem] text-white shadow-lg"
          >
            <Icon
              name={t.tone === 'error' ? 'alert' : 'checkCircle'}
              className={`mt-0.5 h-[18px] w-[18px] ${t.tone === 'error' ? 'text-[#ff9b8f]' : 'text-gold-400'}`}
            />
            <p className="flex-1">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="cursor-pointer text-white/60 hover:text-white">
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
