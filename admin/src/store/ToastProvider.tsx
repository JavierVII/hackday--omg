import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "info";
interface ToastItem { id: number; message: string; tone: ToastTone }
interface ToastContextValue { showToast: (message: string, tone?: ToastTone) => void }
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now();
    setItems((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => dismiss(id), 2600);
  }, [dismiss]);
  const value = useMemo(() => ({ showToast }), [showToast]);
  return <ToastContext.Provider value={value}>
    {children}
    <div className="toast-region" aria-live="polite">
      {items.map((item) => <div className="toast" key={item.id}>
        {item.tone === "success" ? <CheckCircle2 size={18}/> : <Info size={18}/>}<span>{item.message}</span>
        <button onClick={() => dismiss(item.id)} aria-label="关闭提示"><X size={16}/></button>
      </div>)}
    </div>
  </ToastContext.Provider>;
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
