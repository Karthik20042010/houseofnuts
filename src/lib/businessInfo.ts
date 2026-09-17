export interface StoreSettings {
  freeShippingThreshold: number;
  defaultShippingFee: number;
  welcomeDiscountPercent: number;
  currencySymbol: string;
  upiId: string;
  upiName: string;
}

export const STORE_SETTINGS_KEY = "hon_store_settings_v1";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  freeShippingThreshold: 1500,
  defaultShippingFee: 49,
  welcomeDiscountPercent: 10,
  currencySymbol: "₹",
  upiId: "863932789@okbizaxis",
  upiName: "HouseOfNuts",
};

export const BUSINESS_INFO = {
  name: "House of Nuts",
  proprietor: "Karthikeya J",
  address: "10-155/2, KK Street, Gandhi Road, Proddatur, 516360",
  mobiles: ["96525 26920", "7995526067"],
  fssai: "20125233000495",
  whatsappNumber: "919652526920", // E.164 without +
  upiId: DEFAULT_STORE_SETTINGS.upiId,
  upiName: DEFAULT_STORE_SETTINGS.upiName,
  supportEmail: "support@houseofnuts.store",
};

export function getStoreSettings(): StoreSettings {
  try {
    const saved = localStorage.getItem(STORE_SETTINGS_KEY);
    if (saved) return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
  } catch {
    // fallback to defaults
  }
  return DEFAULT_STORE_SETTINGS;
}

export function saveStoreSettings(settings: Partial<StoreSettings>): StoreSettings {
  const current = getStoreSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}
