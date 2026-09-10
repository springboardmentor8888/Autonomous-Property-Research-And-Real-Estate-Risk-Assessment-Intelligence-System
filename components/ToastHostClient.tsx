'use client';

import dynamic from 'next/dynamic';

const ToastHost = dynamic(() => import('@/components/ToastHost'), {
  ssr: false,
});

export default function ToastHostClient() {
  return <ToastHost />;
}