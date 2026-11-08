import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useRestaurant } from '../../context';

export default function ToastNotification() {
  const { toastMsg } = useRestaurant();

  if (!toastMsg) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-2xl border border-[#d4af37]/50 bg-[#181410]/95 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
      <span>{toastMsg}</span>
    </div>
  );
}
