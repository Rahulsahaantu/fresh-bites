"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
}

export default function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
}: QuantitySelectorProps) {
  const buttonSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-sm w-8" : "text-base w-10";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onDecrement}
        className={`${buttonSize} flex items-center justify-center rounded-full border border-gray-200 hover:border-primary-color hover:bg-primary-color/5 transition-all duration-200 active:scale-90`}
        aria-label="Decrease quantity"
      >
        <Minus className={`${iconSize} text-gray-600`} />
      </button>
      <span className={`${textSize} text-center font-semibold text-gray-900`}>
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        className={`${buttonSize} flex items-center justify-center rounded-full bg-primary-color text-white hover:bg-primary-color-dark transition-all duration-200 active:scale-90`}
        aria-label="Increase quantity"
      >
        <Plus className={`${iconSize}`} />
      </button>
    </div>
  );
}
