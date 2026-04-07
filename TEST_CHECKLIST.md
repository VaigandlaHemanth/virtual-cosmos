# Test Checklist - Verify All Fixes

## Before Testing
1. Make sure backend is running: `cd backend && npm run dev`
2. Make sure frontend is running: `cd frontend && npm run dev`
3. Open browser to http://localhost:5173

## Test 1: Double Messages Fix ✅
**Steps:**
1. Open Tab 1 → Enter username "Alice" → Join
2. Open Tab 2 → Enter username "Bob" → Join
3. Move Alice close to Bob (within the white circle)
4. Wait for chat panel to appear on both tabs
5. In Alice's tab, type "Hello" and send
6. Check BOTH tabs

**Expected Result:**
- ✅ Message "Hello" appears ONCE in Alice's tab
- ✅ Message "Hello" appears ONCE in Bob's tab
- ❌ NO duplicate messages

**If you see duplicates:** Take a screenshot and let me know

---

## Test 2: Chat History Persistence ✅
**Steps:**
1. Continue from Test 1 (Alice and Bob are connected)
2. Send 3-4 messages back and forth
3. Move Alice AWAY from Bob (outside the white circle)
4. Wait 2 seconds
5. Move Alice BACK close to Bob (inside the white circle)
6. Check the chat panel

**Expected Result:**
- ✅ Chat panel disappears when out of range
- ✅ Chat panel reappears when back in range
- ✅ ALL previous messages are still visible
- ✅ No messages were lost

**Bonus Test:**
1. Refresh the page (F5)
2. Enter same username and join
3. Move close to the other user
4. **Expected:** Old messages are still there!

---

## Test 3: Click User to Focus Chat ✅
**Steps:**
1. Continue from Test 2 (Alice and Bob are connected)
2. In Alice's tab, click on the canvas to move around
3. Look at the left sidebar - Bob should have a GREEN dot (connected)
4. Click on Bob's name in the left sidebar
5. Watch what happens

**Expected Result:**
- ✅ Page smoothly scrolls to the chat panel
- ✅ Chat input field is focused (cursor blinking)
- ✅ You can immediately start typing
- ✅ Bob's name has a hover effect (blue background)

**Try clicking a user with GRAY dot:**
- ❌ Nothing should happen (they're out of range)
- ✅ Tooltip shows "Out of range"

---

## Test 4: Expanded Canvas ✅
**Steps:**
1. Open a fresh tab → Enter username "Test" → Join
2. Look at the canvas size
3. Press WASD keys to move around
4. Try to reach the edges

**Expected Result:**
- ✅ Canvas is noticeably LARGER than before (1200x800 instead of 800x600)
- ✅ More space to move around
- ✅ User spawns in the center
- ✅ Can move further in all directions

---

## Test 5: Three-User Scenario (Your Observation)
**Steps:**
1. Open Tab 1 → Username "User1" → Join
2. Open Tab 2 → Username "User2" → Join  
3. Open Tab 3 → Username "User3" → Join
4. Position them so:
   - User1 is close to User2 (connected)
   - User2 is close to User3 (connected)
   - User1 is FAR from User3 (not connected)
5. Send messages from each user

**Expected Result:**
- ✅ User1 can chat with User2
- ✅ User2 can chat with User3
- ✅ User2 can see BOTH conversations
- ✅ User1 CANNOT see User3's messages (correct!)
- ✅ User3 CANNOT see User1's messages (correct!)
- ✅ This is working as designed - proximity-based chat

---

## Quick Visual Checks

### Left Sidebar (ConnectionStatus)
- [ ] Shows all online users
- [ ] Green dot = in proximity (can chat)
- [ ] Gray dot = out of range
- [ ] Hover over connected user shows blue background
- [ ] Cursor changes to pointer on connected users
- [ ] Tooltip shows "Click to focus chat" or "Out of range"

### Canvas (CosmosWorld)
- [ ] Larger canvas (1200x800)
- [ ] Your avatar is GREEN with white circle
- [ ] Other users are GRAY
- [ ] WASD keys work smoothly
- [ ] Position updates in real-time
- [ ] Debug overlay shows correct info

### Chat Panel (ChatPanel)
- [ ] Only appears when someone is in proximity
- [ ] Shows "X Nearby" count
- [ ] Messages appear once (no duplicates)
- [ ] Messages persist when going out/in range
- [ ] Input field works
- [ ] Send button works
- [ ] Auto-scrolls to latest message

---

## Common Issues and Solutions

### Issue: Messages still appearing twice
**Solution:** 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage: F12 → Console → Type: `localStorage.clear()`
3. Refresh page (F5)

### Issue: Chat history not persisting
**Solution:**
1. Check browser console (F12) for errors
2. Make sure localStorage is enabled
3. Try in a different browser

### Issue: Click user doesn't focus chat
**Solution:**
1. Make sure the user has a GREEN dot (connected)
2. Gray dot users are not clickable
3. Check browser console for errors

### Issue: Canvas is still small
**Solution:**
1. Hard refresh: Ctrl+F5
2. Clear cache and reload
3. Check if frontend dev server restarted

---

## Success Criteria

All tests should pass with ✅. If any test fails:
1. Note which test failed
2. Take a screenshot if possible
3. Check browser console (F12) for errors
4. Let me know the exact behavior you're seeing

---

## What to Report

If everything works:
- ✅ "All tests passed!"

If something doesn't work:
- ❌ "Test X failed: [describe what you see]"
- Screenshot of the issue
- Browser console errors (if any)

---

## Next Steps After Testing

Once all tests pass, you can:
1. Remove debug logging (if desired)
2. Remove debug overlay (if desired)
3. Add more features (see FIXES_APPLIED_V2.md for ideas)
4. Deploy to production

Enjoy your working Virtual Cosmos app! 🚀
