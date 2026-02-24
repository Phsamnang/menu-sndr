# Mobile Orders Page - Testing Checklist

## Floating Cart Button
- [ ] Button appears in bottom-right on mobile
- [ ] Button is hidden on desktop (lg+ screens)
- [ ] Shows correct item count
- [ ] Shows subtotal in Khmer Riel format
- [ ] Button hides when bottom sheet is open
- [ ] Button reappears when bottom sheet closes
- [ ] Animates/pulses when items are added
- [ ] Tap opens bottom sheet

## Cart Bottom Sheet
- [ ] Slides up from bottom smoothly
- [ ] Drag handle visible at top
- [ ] Swipe down closes the sheet
- [ ] Tap on backdrop closes the sheet
- [ ] X button closes the sheet
- [ ] Content doesn't scroll body behind it
- [ ] All cart controls visible and working:
  - [ ] Customer name input
  - [ ] Discount type selector
  - [ ] Discount amount input
  - [ ] Payment method dropdown
  - [ ] Complete order button
  - [ ] Print button
  - [ ] Payment button

## Menu Item Cards
- [ ] Cards display correctly on mobile (2-column grid on phones)
- [ ] +/- quantity buttons work
- [ ] Direct number input works
- [ ] Green checkmark animation plays on add
- [ ] Toast notification shows on add
- [ ] Card pulses with green ring on add
- [ ] Price displays in Khmer Riel
- [ ] Add button is disabled when price is 0

## Category Filters
- [ ] Sticky at top while scrolling menu
- [ ] Scrollable horizontally on mobile
- [ ] "All" category works
- [ ] Individual categories filter correctly
- [ ] Active category highlighted
- [ ] Filters persist on mobile

## Search Functionality
- [ ] Search input focused and easy to type
- [ ] Clear button appears when text entered
- [ ] Clear button removes all text
- [ ] Search filters menu items
- [ ] Real-time filtering as you type

## Remove Item from Cart
- [ ] Delete button is visible in cart
- [ ] Toast shows confirmation message
- [ ] Item is removed correctly
- [ ] Cannot remove completed order items
- [ ] Cannot remove cooked+served items

## Toast Notifications
- [ ] Appear at top of screen
- [ ] Auto-dismiss after appropriate time
- [ ] Success toasts for: add item, remove item
- [ ] Error toasts for: cannot add, cannot remove
- [ ] Text is readable on all screen sizes

## Responsive Breakpoints
Test on the following screen sizes:
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPhone 14+ (430px)
- [ ] Samsung Galaxy S20 (360px)
- [ ] Samsung Galaxy S21 (400px)
- [ ] iPad Mini (768px)
- [ ] iPad Air (820px)
- [ ] Desktop (1024px+)

## Touch/Mobile Interactions
- [ ] All buttons have min 44px height/width
- [ ] No accidental double-taps
- [ ] Tap response is immediate
- [ ] Swipe gestures work smoothly
- [ ] No scrolling lag
- [ ] Animations run smoothly (no jank)

## Desktop Compatibility
- [ ] Floating button hidden on desktop
- [ ] Bottom sheet hidden on desktop
- [ ] Sidebar shows on right side (lg+)
- [ ] Full-width menu on left
- [ ] All controls functional
- [ ] No layout breaks

## Accessibility
- [ ] All buttons have proper ARIA labels
- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Touch targets are large enough (44px+)
- [ ] Focus indicators are visible
- [ ] Screen readers can navigate

## Performance
- [ ] Page loads quickly
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks on repeated opens/closes
- [ ] Smooth scrolling in menu
- [ ] Bottom sheet opens instantly
- [ ] No lag when adding items

## Edge Cases
- [ ] Adding items when cart is empty
- [ ] Adding items when cart is full
- [ ] Switching between menu and cart
- [ ] Large item names don't break layout
- [ ] Very long customer names fit
- [ ] Large discount amounts display correctly
- [ ] Order completed state blocks additions
- [ ] Network errors show appropriate messages

## Browser Testing
- [ ] Safari on iOS
- [ ] Chrome on iOS
- [ ] Chrome on Android
- [ ] Firefox on Android
- [ ] Samsung Internet
- [ ] Safari on macOS
- [ ] Chrome on Desktop
- [ ] Firefox on Desktop

## Sign-Off
- [ ] Developer: _________________ Date: _______
- [ ] QA: _________________ Date: _______
- [ ] Product: _________________ Date: _______
