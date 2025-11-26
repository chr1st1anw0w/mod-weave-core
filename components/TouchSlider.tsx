import React, { useState, useRef, useEffect, useCallback } from 'react';
import { hapticFeedback, useDebounce, deviceCapabilities } from '../hooks/useMobileOptimizations';

interface TouchSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label?: string;
  onChange: (value: number) => void;
  onChangeComplete?: (value: number) => void;
}

/**
 * TouchSlider - A mobile-optimized slider component with:
 * - 44x44px touch targets (WCAG 2.1 compliant)
 * - Long press for fine-tuning mode (10x smaller steps)
 * - Real-time visual feedback
 * - Haptic feedback on value changes
 * - Prevents page scrolling during drag
 * - Large thumb with value display
 */
export const TouchSlider: React.FC<TouchSliderProps> = ({
  value,
  min,
  max,
  step = 1,
  unit = '',
  label,
  onChange,
  onChangeComplete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFineTuning, setIsFineTuning] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartValue = useRef<number>(value);
  const lastHapticValue = useRef<number>(Math.floor(value / step) * step);

  const isTouchDevice = deviceCapabilities.isTouchDevice();

  // Update display value when prop changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Debounced onChange for performance
  const debouncedOnChange = useDebounce((newValue: number) => {
    if (onChangeComplete) {
      onChangeComplete(newValue);
    }
  }, 150);

  // Calculate value from position
  const getValueFromPosition = useCallback(
    (clientX: number, fineTuning: boolean = false): number => {
      if (!trackRef.current) return value;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const range = max - min;
      let newValue = min + percent * range;

      // Apply step, with fine-tuning option
      const effectiveStep = fineTuning ? step / 10 : step;
      newValue = Math.round(newValue / effectiveStep) * effectiveStep;

      // Clamp to min/max
      return Math.max(min, Math.min(max, newValue));
    },
    [min, max, step, value]
  );

  // Handle drag start (mouse/touch)
  const handleDragStart = useCallback(
    (clientX: number) => {
      setIsDragging(true);
      dragStartX.current = clientX;
      dragStartValue.current = value;
      hapticFeedback.light();

      // Set up long press for fine-tuning mode
      const timer = setTimeout(() => {
        setIsFineTuning(true);
        hapticFeedback.medium();
      }, 500);
      setLongPressTimer(timer);
    },
    [value]
  );

  // Handle drag move
  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const newValue = getValueFromPosition(clientX, isFineTuning);

      if (newValue !== displayValue) {
        setDisplayValue(newValue);
        onChange(newValue);

        // Haptic feedback on significant value changes
        const currentStep = Math.floor(newValue / step) * step;
        if (currentStep !== lastHapticValue.current) {
          hapticFeedback.selection();
          lastHapticValue.current = currentStep;
        }
      }
    },
    [isDragging, isFineTuning, displayValue, step, onChange, getValueFromPosition]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    setIsFineTuning(false);

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    hapticFeedback.light();
    debouncedOnChange(displayValue);
  }, [isDragging, longPressTimer, displayValue, debouncedOnChange]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleDragMove(e.clientX);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX);

    // Cancel fine-tuning if moved too much horizontally
    if (longPressTimer && Math.abs(touch.clientX - dragStartX.current) > 30) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragEnd();
  };

  // Calculate thumb position
  const percent = ((displayValue - min) / (max - min)) * 100;

  // Format display value
  const formattedValue = displayValue % 1 === 0
    ? displayValue.toString()
    : displayValue.toFixed(2);

  return (
    <div
      ref={sliderRef}
      className="flex flex-col gap-1 w-full touch-none select-none"
    >
      {/* Label */}
      {label && (
        <label className="text-[10px] text-gray-400 font-medium">
          {label}
        </label>
      )}

      {/* Slider Track */}
      <div className="relative flex items-center gap-2">
        <div
          ref={trackRef}
          className={`
            relative flex-1 h-11 rounded-xl bg-white/10 cursor-pointer
            ${isDragging ? 'bg-white/15' : 'hover:bg-white/15'}
            transition-all overflow-hidden
            ${isTouchDevice ? 'min-h-[44px]' : 'h-10'}
          `}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Progress Fill */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-mw-accent/30 to-mw-accent/50 transition-all pointer-events-none"
            style={{ width: `${percent}%` }}
          />

          {/* Thumb */}
          <div
            className={`
              absolute top-1/2 -translate-y-1/2 -translate-x-1/2
              ${isTouchDevice ? 'w-11 h-11' : 'w-10 h-10'}
              rounded-xl bg-mw-accent shadow-lg border-2 border-white/30
              flex items-center justify-center
              transition-all duration-100
              ${isDragging ? 'scale-110 shadow-[0_0_20px_rgba(139,92,246,0.8)]' : 'scale-100'}
              ${isFineTuning ? 'ring-4 ring-mw-cyan/50 animate-pulse' : ''}
            `}
            style={{ left: `${percent}%` }}
          >
            {/* Value Display */}
            <span className="text-[10px] font-bold text-white tabular-nums">
              {formattedValue}
            </span>
          </div>

          {/* Fine-tuning indicator */}
          {isFineTuning && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="bg-mw-cyan/20 backdrop-blur-sm px-3 py-1 rounded-full border border-mw-cyan/50 text-[9px] text-white font-bold animate-pulse">
                FINE TUNE
              </div>
            </div>
          )}
        </div>

        {/* Value + Unit Display */}
        <div className="flex flex-col items-end min-w-[50px]">
          <div className="text-xs font-bold text-gray-200 tabular-nums">
            {formattedValue}
          </div>
          {unit && (
            <div className="text-[9px] text-gray-500 font-mono">
              {unit}
            </div>
          )}
        </div>
      </div>

      {/* Range Labels */}
      <div className="flex justify-between text-[9px] text-gray-600 px-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>

      {/* Status hints (only on mobile) */}
      {isTouchDevice && !isDragging && (
        <div className="text-[8px] text-gray-600 text-center">
          Hold for fine-tuning
        </div>
      )}
    </div>
  );
};

export default TouchSlider;
