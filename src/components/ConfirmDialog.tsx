import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white',
      title: 'text-red-900',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      title: 'text-amber-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      title: 'text-blue-900',
    },
  };

  const colorScheme = colors[type];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-fade-in">
      <div
        className={`${colorScheme.bg} ${colorScheme.border} rounded-2xl shadow-2xl border-2 max-w-md w-full p-6 animate-scale-in`}
        style={{
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        <div className="flex items-start space-x-4">
          <div className={`${colorScheme.icon} flex-shrink-0`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className={`${colorScheme.title} font-bold text-lg mb-2`}>{title}</h3>
            <p className="text-gray-700 text-sm mb-6">{message}</p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`${colorScheme.button} px-4 py-2 text-sm font-medium rounded-lg transition-colors`}
              >
                {confirmText}
              </button>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

