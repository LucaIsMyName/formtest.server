# Browser Automation Fix - Payment Method Handling

## Problem Summary
The test runner is not correctly switching payment methods and filling payment-specific fields because:
1. Payment method switching doesn't wait for dynamic forms to appear
2. Credit card fields are Stripe iframes (cannot be filled directly)
3. Field selectors are too generic and may match wrong fields
4. No visibility checks before filling payment-specific fields

---

## Implementation Checklist

### Phase 1: Add Payment Form Visibility Waiting
- [x] Add `waitForPaymentFormVisibility()` method
- [x] Add `logPaymentFormState()` for debugging
- [x] Update `handlePaymentMethod()` to wait for form visibility
- [ ] Test: Run test with SEPA payment method

### Phase 2: Fix SEPA Field Filling
- [x] Update `fillSepaFields()` with specific selectors
- [x] Add visibility check for `#bankAccountForm`
- [x] Use container-scoped selectors (`#bankAccountForm #payment_bank_account_owner`)
- [x] Add `tryFillFieldWithVisibilityCheck()` helper method
- [ ] Test: Run test with SEPA, verify fields are filled

### Phase 3: Fix Credit Card Handling (Stripe Iframes)
- [x] Update `fillCreditCardFields()` to handle Stripe iframes
- [x] Fill only `#payment_credit_card_owner` (regular input)
- [x] Log warning that card number/CVV/expiry are Stripe iframes
- [x] Detect Stripe iframes and log appropriately
- [ ] Test: Run test with credit card, verify card holder is filled

### Phase 4: Fix EPS Bank Selection
- [x] Update `fillEpsFields()` with visibility check
- [x] Use container-scoped selectors
- [x] Ensure bank dropdown is properly selected
- [ ] Test: Run test with EPS, verify bank is selected

### Phase 5: Write Unit Tests
- [ ] Create `__tests__/runner.test.ts` for payment method handling
- [ ] Test payment form visibility detection
- [ ] Test field selector specificity

### Phase 6: Build & Integration Test
- [ ] Run `npm run build`
- [ ] Manual test with real form (diakonie.at/spenden/meine-spende)
- [ ] Verify all payment methods work correctly

---

## Current Progress

### Phases 1-4: Code Implementation ✅ COMPLETE

**Changes made to `runner.js`**:
1. Added `logPaymentFormState()` - logs visibility of all payment forms
2. Added `waitForPaymentFormVisibility()` - waits for correct form after payment selection
3. Updated `handlePaymentMethod()` - now waits for form visibility before filling
4. Updated `fillSepaFields()` - container-scoped selectors, visibility checks
5. Updated `fillCreditCardFields()` - handles Stripe iframes, fills only card holder
6. Updated `fillEpsFields()` - container-scoped selectors, visibility checks
7. Added `tryFillFieldWithVisibilityCheck()` - fills only visible fields

### Additional Fixes (Dec 3, 2025):

**Problem**: Test was getting stuck on `#payment_company_name` (hidden field) for 5 minutes

**Root Cause**: 
- `fillField()` was trying to fill ALL detected fields including hidden ones
- Playwright's default timeout is 300000ms (5 min) waiting for element to become visible
- `cleanup()` was calling `this.page.close()` but `this.page` was a Frame (from iframe), not a Page

**Fixes Applied**:
1. **`fillField()`** - Added visibility check before filling, skip hidden fields
2. **`fillField()`** - Added editability check, skip disabled/readonly fields  
3. **`fillField()`** - Added 5s timeout to prevent getting stuck
4. **`fillFormFields()`** - Added skip patterns for fields already handled elsewhere
5. **`fillFormFields()`** - Skip radio/checkbox inputs (they need click, not fill)
6. **`cleanup()`** - Check if `this.page.close` is a function before calling (Frames don't have close())

### Fix: Success URL Detection & Field Mapping Override (Dec 3, 2025)

**Problem 1**: Test marked as FAILURE even though donation went through
- Redirect URL was `diakonie.at` but wasn't detected as success
- Root cause: `waitForSuccessRedirect()` was using `this.page` (iframe) instead of `this.mainPage`
- After form submission, the main page redirects but the iframe context is gone

**Problem 2**: User-defined field mappings were being overwritten
- `applyFieldMappings()` filled fields with user values
- Then `fillFormFields()` came and overwrote them with faker data

**Fixes Applied**:
1. **`waitForSuccessRedirect()`** - Now uses `this.mainPage` for URL detection
2. **`applyFieldMappings()`** - Tracks filled selectors in `this.filledByMapping` Set
3. **`fillFormFields()`** - Skips fields already in `filledByMapping`
4. **`runFormTest()`** - Resets `filledByMapping` at start of each test

### Next Step: Manual Test

---

## Notes
- Form URL: https://www.diakonie.at/spenden/meine-spende
- Blueprint: `/blueprint/form-example.html`
- Runner file: `/src/main/testRunner/runner.js`

## Key Learnings
- FundraisingBox uses Stripe Elements for credit card fields (iframes)
- Payment forms are shown/hidden dynamically via JavaScript
- Must wait for form visibility before attempting to fill fields
- Container-scoped selectors prevent filling wrong fields
