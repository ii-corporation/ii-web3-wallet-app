import { useState, useCallback } from "react";

/**
 * Hook for managing bottom sheet state
 *
 * Provides a consistent pattern for handling bottom sheet visibility
 * and the selected item that the sheet displays.
 *
 * @example
 * // Basic usage
 * const { isVisible, selectedItem, open, close } = useBottomSheet<GiftCard>();
 *
 * // Open with item
 * const handleCardPress = (card: GiftCard) => open(card);
 *
 * // In JSX
 * <GiftCardDetailsSheet
 *   visible={isVisible}
 *   onClose={close}
 *   giftCard={selectedItem}
 * />
 *
 * @example
 * // With callback on close
 * const { isVisible, selectedItem, open, close } = useBottomSheet<Stake>();
 *
 * const handleClaim = () => {
 *   // Do something with selectedItem
 *   console.log("Claiming:", selectedItem?.name);
 *   close();
 * };
 */
export function useBottomSheet<T>() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const open = useCallback((item: T) => {
    setSelectedItem(item);
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    // Keep selectedItem for animation purposes
    // It will be replaced on next open
  }, []);

  const reset = useCallback(() => {
    setIsVisible(false);
    setSelectedItem(null);
  }, []);

  return {
    isVisible,
    selectedItem,
    open,
    close,
    reset,
    // Convenience setters for more control
    setVisible: setIsVisible,
    setItem: setSelectedItem,
  };
}

/**
 * Hook for managing multiple bottom sheets
 *
 * Useful when a page has multiple different bottom sheets
 * that should only show one at a time.
 *
 * @example
 * const sheets = useMultipleBottomSheets(["details", "confirm", "success"] as const);
 *
 * // Open specific sheet
 * sheets.open("details", itemData);
 *
 * // Check which is active
 * if (sheets.activeSheet === "confirm") { ... }
 */
export function useMultipleBottomSheets<T extends string, D = unknown>(sheetKeys: readonly T[]) {
  const [activeSheet, setActiveSheet] = useState<T | null>(null);
  const [sheetData, setSheetData] = useState<D | null>(null);

  const open = useCallback((sheet: T, data?: D) => {
    setSheetData(data ?? null);
    setActiveSheet(sheet);
  }, []);

  const close = useCallback(() => {
    setActiveSheet(null);
  }, []);

  const reset = useCallback(() => {
    setActiveSheet(null);
    setSheetData(null);
  }, []);

  const isActive = useCallback((sheet: T) => activeSheet === sheet, [activeSheet]);

  return {
    activeSheet,
    sheetData,
    open,
    close,
    reset,
    isActive,
  };
}
