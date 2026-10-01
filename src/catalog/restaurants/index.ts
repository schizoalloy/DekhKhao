/**
 * Restaurant registry. To onboard a restaurant: add `<slug>.json` next to this file
 * and one line below. See README → "Adding a restaurant".
 */
import type { Restaurant } from "../types";
import demo from "./demo.json";

export const restaurantRecords: Restaurant[] = [demo as Restaurant];
