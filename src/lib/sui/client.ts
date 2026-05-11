import { isValidSuiAddress } from "@mysten/sui/utils";

export function validateSuiAddress(address: string) {
  const normalized = address.trim();

  if (!normalized) {
    return {
      isValid: false,
      message: "Enter a Sui address to start analysis.",
    };
  }

  if (!isValidSuiAddress(normalized)) {
    return {
      isValid: false,
      message: "This does not look like a valid Sui wallet address.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}
