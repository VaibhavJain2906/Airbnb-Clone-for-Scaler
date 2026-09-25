import React from "react";
import { PriceQuote } from "../../lib/types";
import { formatCurrency } from "../../lib/format";

interface PriceBreakdownProps {
  quote: PriceQuote;
}

export function PriceBreakdown({ quote }: PriceBreakdownProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-zinc-200 text-sm">
      <div className="flex items-center justify-between text-zinc-600">
        <span className="underline">
          {formatCurrency(quote.nightly_price)} × {quote.nights} night{quote.nights > 1 ? "s" : ""}
        </span>
        <span>{formatCurrency(quote.base_price)}</span>
      </div>

      {quote.cleaning_fee > 0 && (
        <div className="flex items-center justify-between text-zinc-600">
          <span className="underline">Cleaning fee</span>
          <span>{formatCurrency(quote.cleaning_fee)}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-zinc-600">
        <span className="underline">Airbnb service fee (14%)</span>
        <span>{formatCurrency(quote.service_fee)}</span>
      </div>

      <div className="pt-3 border-t border-zinc-200 flex items-center justify-between font-bold text-base text-zinc-900">
        <span>Total before taxes</span>
        <span>{formatCurrency(quote.total_price)}</span>
      </div>
    </div>
  );
}
