# 🚀 ResourceFinder Quick Start Guide

## ⚡ Get It Working in 2 Minutes

### Step 1: Verify Backend is Running
```bash
# Check if server running on 5000
curl http://localhost:5000

# Expected output:
# LearnBuddy API is running...
```

If you get an error, start the backend:
```bash
cd backend
npm install  # if not done
npm start
```

---

### Step 2: Check YouTube API Key
```bash
# Verify .env file has API key
cat backend/.env | grep YOUTUBE_API_KEY

# Should show:
# YOUTUBE_API_KEY=AIzaSyDY9TB9bnHPo1-wrU8ofcBnfrwo5vbK_Kc
```

If missing, ask DevOps for the key.

---

### Step 3: Log In
1. Open http://localhost:5173 (frontend)
2. Click Sign In
3. Enter credentials
4. Verify token appears in browser storage:
   ```javascript
   // F12 → Console
   console.log(localStorage.getItem('token'))
   ```

---

### Step 4: Open ResourceFinder
1. Click "Resource Finder" in navbar (or go to `/finder`)
2. You should see the welcome screen with "Find Your Perfect Tutorial"
3. Popular topics show as buttons

---

### Step 5: Search for Videos
1. Type "React" in search box
2. Click search button (should turn blue)
3. Wait 2-3 seconds for results
4. See 20 videos with skill badges 🟢🟡🔴

---

## ✅ Success Indicators

When working correctly, you'll see:

1. **Search Results** - 20 videos appear
2. **Skill Badges** - 🟢 Beginner, 🟡 Intermediate, 🔴 Advanced
3. **Duration** - ⏱️ 15 min format
4. **Channel Name** - Author of video
5. **Related Topics** - "JavaScript", "Hooks" buttons appear
6. **No Errors** - Red error messages gone

---

## 🐛 If Search Fails

### Check Errors in Console
```javascript
// F12 → Console
// Look for red errors

// Common patterns:
// "401 Unauthorized" → Sign in again
// "403 Forbidden" → API key invalid or quota exceeded
// "404 Not found" → Server not running
```

### Most Common Fix
```javascript
// 1. Clear everything
localStorage.clear()

// 2. Reload page
location.reload()

// 3. Sign in again
// 4. Try searching again
```

---

## 🔧 Debug Mode

Enable verbose logging:

```javascript
// F12 → Console
// Paste this:
window.DEBUG_RESOURCEFINDER = true;

// Then try searching
// Should see detailed logs
```

---

## 📞 Quick Diagnostics

Run this in browser console:

```javascript
const diagnostics = {
  token: !!localStorage.getItem('token'),
  userId: !!localStorage.getItem('userId'),
  serverUrl: 'http://localhost:5000',
  frontendUrl: 'http://localhost:5173'
};
console.table(diagnostics);
```

All should show `true` (except URLs which show the addresses).

---

## 🎯 Test All Features

### Test 1: Search 
```
Type: "Python"
Click Search
Expected: 20 videos with 🟢🟡🔴 badges
```

### Test 2: Filter by Beginner
```
1. Click "Show Filters" 🎚️
2. Skill Level: Select "🟢 Beginner"
3. Expected: Fewer videos, all "beginner" level
```

### Test 3: Related Topics
```
1. Do a search
2. Look below results
3. See "JavaScript", "Hooks" buttons
4. Click one
5. Auto-searches that topic
```

### Test 4: Bookmark
```
1. See a video you like
2. Click ☆ (star)
3. Changes to ⭐
4. Refresh page
5. ⭐ still there (persisted)
```

---

## 🚀 Performance Tips

- First search: ~3 seconds (API call)
- Subsequent searches: ~2 seconds
- Filtering: <100ms (instant)
- Bookmarking: <50ms (instant)

---

## 📱 Mobile Testing

Works on mobile if:
1. ✅ Logged in
2. ✅ Can search
3. ✅ See hamburger menu ☰
4. ✅ Single column layout
5. ✅ Filters work

---

## 🎓 Learning Path Example

**Beginner's Journey**:
1. Search "JavaScript"
2. Filter 🟢 Beginner
3. Filter ⏱️ Short (< 10 min)
4. Start with easiest videos
5. Bookmark favorites ⭐
6. Progress to Intermediate/Advanced

---

## 💡 Pro Tips

1. **Search Variations** - "React" vs "React JS" vs "React Tutorial" give different results
2. **Beginner Filter** - Use for learning new topics from scratch
3. **Duration Filter** - Short for quick reference, Long for deep learning
4. **Related Topics** - Click to explore related subjects
5. **Save Bookmarks** - Build your learning library ⭐

---

## ❌ If All Else Fails

### Nuclear Reset
```bash
# Terminal 1: Stop backend
Ctrl+C

# Terminal 2: Clear browser
# F12 → Application → LocalStorage → Clear All

# Terminal 1: Restart backend
npm start

# Browser: Refresh Page
Cmd/Ctrl + Shift + R  # Hard refresh

# Login again & try ResourceFinder
```

---

## 📊 What's New in Phase 2

✅ **20 Videos** (was 5)  
✅ **Smart Skill Detection** - Auto-labels videos  
✅ **Better Filtering** - Filter works perfectly  
✅ **Related Topics** - Contextual suggestions  
✅ **Duration Display** - Shows in minutes  
✅ **Channel Names** - See video creator  
✅ **Color Coded Badges** - Quick skill level identification

---

## 📞 Support

**Still broken?**
1. Open browser console (F12)
2. Search for a topic
3. Copy error message
4. Share error message + screenshot

---

**Last Updated**: April 16, 2026
**Status**: ✅ Production Ready

