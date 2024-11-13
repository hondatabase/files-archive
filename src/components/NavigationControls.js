import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NavigationControls = ({ onNavigate, canGoBack, canGoForward, isHome }) => (
  <div className="flex gap-2">
    <button
      onClick={() => onNavigate(-1)}
      disabled={!canGoBack || isHome}
      className="p-2 rounded hover:bg-gray-100 disabled:opacity-50">
      <ChevronLeft size={20} />
    </button>
    <button
      onClick={() => onNavigate(1)}
      disabled={!canGoForward}
      className="p-2 rounded hover:bg-gray-100 disabled:opacity-50">
      <ChevronRight size={20} />
    </button>
  </div>
)

export default NavigationControls;