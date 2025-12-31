# Flaticon Icons Setup

This directory is for storing Flaticon SVG icons used in the admin panel.

## How to Add Flaticon Icons

1. **Download icons from Flaticon:**
   - Go to https://www.flaticon.com
   - Search for the icon you need
   - Download as SVG format
   - Make sure to follow Flaticon's licensing requirements

2. **Save icons to this directory:**
   - Save each icon with a descriptive filename
   - Example: `folder.svg`, `shopping-cart.svg`, `chef-hat.svg`, etc.

3. **Update icon paths in `app/admin/icons.tsx`:**
   - Open `app/admin/icons.tsx`
   - Update the path for each icon you've added
   - Example: `folder: "/icons/flaticon/folder.svg"`

## Required Icons

Based on the current setup, you need the following icons:

- `folder.svg` - Categories
- `layer-group.svg` - Table types
- `table.svg` - Tables
- `utensils.svg` - Menu items
- `shopping-cart.svg` - Orders
- `clipboard-list.svg` - Sales
- `ruler.svg` - Units
- `box.svg` - Products
- `dollar-sign.svg` - Expenses
- `users.svg` - Users
- `store.svg` - Shop info
- `chef-hat.svg` - Chef
- `truck.svg` - Delivery
- `book.svg` - View menu
- `sign-out.svg` - Logout

## Notes

- Icons should be SVG format for best quality and scalability
- Make sure icons are optimized (remove unnecessary metadata)
- Icons will automatically inherit the color classes applied in the admin page
- The FlaticonIcon component handles loading and rendering of SVG files

