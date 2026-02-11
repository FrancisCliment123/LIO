import Purchases, {
    CustomerInfo,
    PurchasesOffering,
    PurchasesPackage,
    LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Keys
const REVENUECAT_CONFIG = {
    apiKey: 'appl_LlDboPGefpZSbZOKkljatyYBjvu',
    entitlementId: 'Lio +', // Premium entitlement identifier
};

// Product IDs (must match App Store Connect and RevenueCat exactly)
export const PRODUCT_IDS = {
    monthly: 'com.cisfran.lio.monthly1',
    annual: 'com.cisfran.lio.annual1',
} as const;

// Subscription Status Interface
export interface SubscriptionStatus {
    isPremium: boolean;
    productIdentifier?: string;
    expirationDate?: string;
    willRenew: boolean;
    isLifetime: boolean;
}

// Initialize RevenueCat SDK
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
    try {
        // Configure SDK with debug logging in development
        if (__DEV__) {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        // Configure the SDK
        await Purchases.configure({
            apiKey: REVENUECAT_CONFIG.apiKey,
        });

        // Identify the user if userId is provided
        if (userId) {
            await Purchases.logIn(userId);
        }

        console.log('✅ RevenueCat initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize RevenueCat:', error);
        throw error;
    }
};

// Get current customer info
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return customerInfo;
    } catch (error) {
        console.error('Failed to get customer info:', error);
        return null;
    }
};

// Check if user has premium access
export const checkPremiumStatus = async (): Promise<SubscriptionStatus> => {
    try {
        // 🧪 DEV MODE: Bypass premium check for testing
        // TODO: Set to false before production release
        const DEV_MODE_PREMIUM = true;

        if (__DEV__ && DEV_MODE_PREMIUM) {
            console.log('🧪 DEV MODE: Premium access granted for testing');
            return {
                isPremium: true,
                productIdentifier: 'dev-mode',
                willRenew: false,
                isLifetime: true,
            };
        }

        const customerInfo = await Purchases.getCustomerInfo();
        const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId];

        if (entitlement) {
            const isLifetime = entitlement.productIdentifier === PRODUCT_IDS.annual;

            return {
                isPremium: true,
                productIdentifier: entitlement.productIdentifier,
                expirationDate: entitlement.expirationDate,
                willRenew: entitlement.willRenew,
                isLifetime,
            };
        }

        return {
            isPremium: false,
            willRenew: false,
            isLifetime: false,
        };
    } catch (error) {
        console.error('Failed to check premium status:', error);
        return {
            isPremium: false,
            willRenew: false,
            isLifetime: false,
        };
    }
};

// Get available offerings
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
        const offerings = await Purchases.getOfferings();
        return offerings.current;
    } catch (error) {
        console.error('Failed to get offerings:', error);
        return null;
    }
};

// Purchase a package
export const purchasePackage = async (
    packageToPurchase: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
    try {
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

        // Check if the purchase unlocked premium
        const isPremium = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId] !== undefined;

        if (isPremium) {
            console.log('🎉 Purchase successful! Premium unlocked.');
            return { success: true, customerInfo };
        }

        return {
            success: false,
            error: 'Purchase completed but premium not unlocked',
        };
    } catch (error: any) {
        console.error('Purchase failed:', error);

        // Handle user cancellation
        if (error.userCancelled) {
            return { success: false, error: 'Purchase cancelled' };
        }

        return {
            success: false,
            error: error.message || 'Purchase failed',
        };
    }
};

// Restore purchases
export const restorePurchases = async (): Promise<{
    success: boolean;
    isPremium: boolean;
    error?: string;
}> => {
    try {
        const customerInfo = await Purchases.restorePurchases();
        const isPremium = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId] !== undefined;

        if (isPremium) {
            console.log('🎉 Purchases restored! Premium access restored.');
        } else {
            console.log('No premium purchases to restore');
        }

        return { success: true, isPremium };
    } catch (error: any) {
        console.error('Failed to restore purchases:', error);
        return {
            success: false,
            isPremium: false,
            error: error.message || 'Failed to restore purchases',
        };
    }
};

// Set up customer info update listener
export const setupCustomerInfoListener = (
    callback: (customerInfo: CustomerInfo) => void
): (() => void) => {
    const listener = Purchases.addCustomerInfoUpdateListener(callback);

    // Return cleanup function
    return () => {
        // RevenueCat doesn't have an explicit remove listener, 
        // but the listener is cleaned up when component unmounts
    };
};

// Identify user (useful after login or signup)
export const identifyUser = async (userId: string, userName?: string): Promise<void> => {
    try {
        await Purchases.logIn(userId);

        // Set user attributes
        if (userName) {
            await Purchases.setDisplayName(userName);
        }

        console.log(`✅ User identified: ${userId}`);
    } catch (error) {
        console.error('Failed to identify user:', error);
    }
};

// Log out user (clear their identity)
export const logoutUser = async (): Promise<void> => {
    try {
        await Purchases.logOut();
        console.log('✅ User logged out from RevenueCat');
    } catch (error) {
        console.error('Failed to logout user:', error);
    }
};

// Get formatted product info
export const getProductInfo = (pkg: PurchasesPackage) => {
    const product = pkg.product;

    return {
        identifier: product.identifier,
        title: product.title,
        description: product.description,
        price: product.priceString,
        currencyCode: product.currencyCode,
        introPrice: product.introPrice?.priceString,
    };
};
