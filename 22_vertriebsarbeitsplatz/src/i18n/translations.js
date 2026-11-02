/**
 * Central translations for DE/EN.
 * Access via useTranslation() hook → t('key')
 *
 * Split into thematic modules for maintainability:
 * - translations-common.js:   Global/Header, Tabs, Landing Page, Months, Weekdays
 * - translations-overview.js: Overview tabs (My Day, Leads, Kunden, Revenue, Storno, etc.)
 * - translations-detail.js:   Detail page tabs (Performance, WpHG, Engagement, Familie, etc.)
 */

import translationsCommon from './translations-common';
import translationsOverview from './translations-overview';
import translationsDetail from './translations-detail';

const translations = {
  ...translationsCommon,
  ...translationsOverview,
  ...translationsDetail,
};

export default translations;
