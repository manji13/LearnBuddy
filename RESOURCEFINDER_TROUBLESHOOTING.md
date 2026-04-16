# 🔧 ResourceFinder - Troubleshooting Guide

## ✅ Checklist Before Testing

### Backend Setup
- [ ] `.env` file has `YOUTUBE_API_KEY` set
- [ ] MongoDB connection string in `.env`
- [ ] Node server running on port 5000
- [ ] Backend dependencies installed (`npm install`)

### Frontend Setup
- [ ] Frontend running on port 5173 (Vite)
- [ ] User is logged in (token in localStorage)
- [ ] Browser console open to check errors

---

## 🚨 Common Issues & Fixes

### Issue 1: "Please sign in to access Resource Finder"
**Cause**: No authentication token in localStorage

**Solution**:
1. Go to login page first
2. Sign in with valid credentials
3. Verify `token` exists in localStorage (F12 → Application → LocalStorage)
4. Navigate to ResourceFinder page

**Debug**:
```javascript
// Check in browser console
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('userId'));
```

---

### Issue 2: Search Button Disabled (Greyed Out)
**Cause**: Empty search query or still loading

**Solution**:
1. Type a topic in the search box (e.g., "React")
2. Button should turn blue and enable
3. Click to search

**Debug**:
```javascript
// Check query value
const query = document.querySelector('input[placeholder*="Search"]').value;
console.log('Query:', query);
```

---

### Issue 3: Search Returns "No videos found"
**Cause**: YouTube API key invalid or quota exceeded

**Possible Solutions**:
1. **Check API Key in `.env`**:
   ```
   YOUTUBE_API_KEY=AIzaSyDY9TB9bnHPo1-wrU8ofcBnfrwo5vbK_Kc
   ```

2. **Check if API is enabled** in Google Cloud Console:
   - Go to https://console.cloud.google.com/
   - Project: LearnBuddy (or your project)
   - APIs & Services → Enabled APIs
   - Verify "YouTube Data API v3" is enabled

3. **Check API Quota**:
   - Google Console → YouTube Data API v3 → Quotas
   - Verify you have quota remaining (default: 10,000 units/day)

4. **Try a different search term**:
   - Try "Python" instead of "xyzabc123"

---

### Issue 4: Network Error / 401 Unauthorized
**Cause**: Token expired or invalid auth header

**Solution**:
1. Log out (clear localStorage)
2. Sign in again to get fresh token
3. Try ResourceFinder again

**Debug**:
```javascript
// Check token format
const token = localStorage.getItem('token');
console.log('Token starts with Bearer:', token?.substring(0, 50));

// Check if token includes "ey" (typical JWT start)
console.log('Is JWT:', token?.startsWith('ey'));
```

---

### Issue 5: Backend Error in Console
Check Node.js console output:

**Common Errors**:
```
MongoDB Connection Error:
  → Check MONGO_URI is correct
  → Check internet connection (for MongoDB Atlas)

YouTube API Error:
  → Check YOUTUBE_API_KEY is correct
  → Check API quota

Auth Middleware Error:
  → Check JWT_SECRET matches
  → Verify token is being sent correctly
```

---

## 🧪 Step-by-Step Test

### Test 1: Verify Backend is Working
```bash
# Check if server is running
curl http://localhost:5000

# Expected: "LearnBuddy API is running..."
```

### Test 2: Verify Authentication
```bash
# Get your token from localStorage in browser console
const token = localStorage.getItem('token');
console.log(token);

# Then test API call
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:5000/api/resources/history
```

### Test 3: Test YouTube API Directly
```bash
# Test YouTube API (replace YOUR_API_KEY)
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=react&maxResults=5&key=YOUR_API_KEY_HERE"

# You should get JSON response with videos
```

### Test 4: Full Search Flow
1. **Frontend**: Open ResourceFinder page
2. **Frontend**: Type "React" in search box
3. **Backend**: Watch terminal for logs
4. **Expected Backend Output**:
   ```
   Searching for: React
   Found: 20 videos
   Detected skill levels...
   ```
5. **Frontend**: Should show 20 video results with badges

---

## 📊 Expected Responses

### Successful Search Response
```json
{
  "success": true,
  "data": [
    {
      "title": "React Hooks Tutorial",
      "description": "Learn React Hooks...",
      "videoId": "dQw4w9WgXcQ",
      "thumbnail": "https://...",
      "skillLevel": "beginner",
      "duration": 900,
      "channel": "Traversy Media",
      "publishedAt": "2024-01-15T...",
      "resourceType": "video"
    }
  ],
  "relatedTopics": ["JavaScript", "Hooks", "JSX"],
  "totalResults": 20
}
```

### Error Response
```json
{
  "success": false,
  "message": "YouTube API error. Check your API key or try again later."
}
```

---

## 🔍 Browser Console Debugging

### Check if Token Exists
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('UserId:', localStorage.getItem('userId'));
```

### Monitor Network Requests
1. Open DevTools (F12)
2. Go to "Network" tab
3. Type in search box
4. Click search
5. Look for:
   - Request to `http://localhost:5000/api/resources/search`
   - Check headers for `Authorization: Bearer ...`
   - Check response for video data

### Check for Errors
```javascript
// In browser console, set error listener
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled rejection:', event.reason);
});
```

---

## 🚀 Quick Fix Checklist

- [ ] Backend running on 5000
- [ ] MongoDB connected
- [ ] User logged in (has token)
- [ ] YOUTUBE_API_KEY set in .env
- [ ] YouTube API v3 enabled in Google Console
- [ ] Search query is not empty
- [ ] No network errors in console
- [ ] Tokens are valid (not expired)

---

## 🛠️ Reset Everything

### Clear All Data
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Restart Backend
```bash
# Terminal
Ctrl+C  # Stop server
npm start  # Restart
```

### Restart MongoDB
```bash
# Verify MongoDB is running (MongoDB Atlas online or local)
# Check connection string in .env
```

---

## 📞 Debug Mode

Add this to frontend code for verbose logging:

```javascript
// Add to ResourceFinder.jsx at the top of handleSearch
const handleSearch = async (e) => {
  e.preventDefault();
  const trimmedQuery = query.trim();
  
  console.log('🔍 Search initiated:', trimmedQuery);
  console.log('📦 Token:', token?.substring(0, 20) + '...');
  console.log('👤 UserId:', userId);
  console.log('🔗 Endpoint:', 'http://localhost:5000/api/resources/search');
  
  // ... rest of function
};
```

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Search loads 20 videos ~2-3 seconds
2. ✅ Each video has 🟢/🟡/🔴 skill level badge
3. ✅ Duration shown as ⏱️ 15 min format
4. ✅ Related topics appear below results
5. ✅ Can bookmark with ⭐
6. ✅ Can filter by skill level
7. ✅ No red error messages
8. ✅ Network tab shows 200 OK response

---

## 📝 Support

If still having issues:
1. Check all items in "Quick Fix Checklist"
2. Review browser console for error messages
3. Check backend terminal for logs
4. Verify .env has all required keys
5. Restart both frontend and backend

