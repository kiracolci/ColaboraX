/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as chats from "../chats.js";
import type * as companies from "../companies.js";
import type * as companyExchanges from "../companyExchanges.js";
import type * as employeeActions from "../employeeActions.js";
import type * as employees from "../employees.js";
import type * as exchanges from "../exchanges.js";
import type * as http from "../http.js";
import type * as jobSwaps from "../jobSwaps.js";
import type * as notifications from "../notifications.js";
import type * as router from "../router.js";
import type * as userPreferences from "../userPreferences.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  chats: typeof chats;
  companies: typeof companies;
  companyExchanges: typeof companyExchanges;
  employeeActions: typeof employeeActions;
  employees: typeof employees;
  exchanges: typeof exchanges;
  http: typeof http;
  jobSwaps: typeof jobSwaps;
  notifications: typeof notifications;
  router: typeof router;
  userPreferences: typeof userPreferences;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
