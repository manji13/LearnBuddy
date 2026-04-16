# ✅ ResourceFinder Complete Testing Checklist

## 🎯 Pre-Testing Setup

- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Logged in to LearnBuddy (see token in localStorage)
- [ ] YOUTUBE_API_KEY set in `.env`
- [ ] Browser console open (F12)
- [ ] Network tab visible for API calls

---

## 🔍 Core Functionality Tests

### Test 1: Page Loads Correctly
**What to Check:**
- [ ] ResourceFinder page loads without errors
- [ ] "Find Your Perfect Tutorial 🎓" header visible
- [ ] Popular topics show as buttons (React, JavaScript, etc.)
- [ ] Search box is visible and focusable
- [ ] No red error messages in console

**Expected**: Clean page, ready to search

---

### Test 2: Basic Search
**Steps:**
1. Type "React" in search box
2. Click search button (blue)
3. Wait 2-3 seconds

**What to Check:**
- [ ] Results appear (should show 20 videos)
- [ ] Each video has: Title, Thumbnail, Channel, Views
- [ ] Skill badge visible (🟢/🟡/🔴)
- [ ] Duration shown (e.g., ⏱️ 15 min)
- [ ] No errors in console

**Expected**: 20 videos with full metadata

---

### Test 3: Multiple Searches
**Steps:**
1. Clear search, type "Python"
2. Click search
3. Wait 2-3 seconds
4. Then search "JavaScript"
5. Wait 2-3 seconds

**What to Check:**
- [ ] Each search returns different results
- [ ] Previous results replaced
- [ ] No duplicate videos between searches
- [ ] All 20 videos load each time

**Expected**: Fresh results for each query

---

### Test 4: Search History Appears
**Steps:**
1. After 2-3 searches
2. Look at left sidebar (or scroll down on mobile)

**What to Check:**
- [ ] Recent searches listed
- [ ] Searches appear in order (newest first)
- [ ] Can click history item to re-search
- [ ] Time stamps shown (e.g., "5 min ago")

**Expected**: History sidebar populated with searches

---

## 🎚️ Advanced Filtering Tests

### Test 5: Filter by Skill Level - Beginner
**Steps:**
1. Search any topic (e.g., "React")
2. Click "Show Filters" 🎚️
3. Select "🟢 Beginner" under Skill Level
4. Observe results

**What to Check:**
- [ ] Videos filtered to beginner only
- [ ] All visible videos have 🟢 badge
- [ ] Result count updates (should be fewer)
- [ ] Can still see all original count in "1 of 20"

**Expected**: Only beginner videos shown

---

### Test 6: Filter by Skill Level - Advanced
**Steps:**
1. Continue with same search
2. Change filter to "🔴 Advanced"

**What to Check:**
- [ ] Results update immediately
- [ ] Only advanced videos shown
- [ ] 🔴 badges only
- [ ] Different video count

**Expected**: Only advanced videos shown

---

### Test 7: Filter by Duration
**Steps:**
1. Search a topic
2. Click "Show Filters" 🎚️
3. Select "Short (< 10 min)" under Duration

**What to Check:**
- [ ] Videos shown are <= 10 minutes
- [ ] Result count decreases
- [ ] Duration badges reflect filter (e.g., ⏱️ 5 min shown, ⏱️ 25 min not shown)

**Expected**: Only short videos shown

---

### Test 8: Combine Multiple Filters
**Steps:**
1. Search topic
2. Filter: Skill = "🟡 Intermediate"
3. Filter: Duration = "Medium (10-30 min)"

**What to Check:**
- [ ] Both filters apply together
- [ ] Only medium-duration intermediate videos shown
- [ ] Result count very small (correctly filtered)
- [ ] Can remove one filter independently

**Expected**: Both filters work together

---

### Test 9: Clear All Filters
**Steps:**
1. Apply multiple filters
2. Click "Clear Filters" or remove each individually

**What to Check:**
- [ ] All 20 results return
- [ ] Filters reset to default
- [ ] No lag when clearing

**Expected**: Filters cleared, full results shown

---

## 📊 Sorting Tests

### Test 10: Sort by Relevance (Default)
**Steps:**
1. Search "React"
2. Observe video order

**What to Check:**
- [ ] Results ordered by YouTube relevance algorithm
- [ ] Most relevant first
- [ ] Each video has clickable link

**Expected**: Videos in relevance order

---

### Test 11: Sort by Skill (Ascending)
**Steps:**
1. Click sort dropdown
2. Select "Skill Level: Beginner → Advanced"

**What to Check:**
- [ ] 🟢 videos appear first
- [ ] 🟡 videos in middle
- [ ] 🔴 videos last
- [ ] Results re-ordered instantly

**Expected**: Beginner to Advanced order

---

### Test 12: Sort by Duration (Ascending)
**Steps:**
1. Click sort dropdown
2. Select "Duration: Short → Long"

**What to Check:**
- [ ] Shortest videos first (⏱️ 5 min)
- [ ] Longest videos last (⏱️ 60+ min)
- [ ] Durations increase down list

**Expected**: Shortest to longest order

---

## ⭐ Bookmark Tests

### Test 13: Bookmark a Video
**Steps:**
1. Search any topic
2. Hover over a video
3. Click ☆ (star icon)

**What to Check:**
- [ ] Star fills to ⭐
- [ ] No error messages
- [ ] Video confirms bookmarked (visual feedback)

**Expected**: Star becomes filled/highlighted

---

### Test 14: Unbookmark a Video
**Steps:**
1. Click the filled ⭐
2. Observe change

**What to Check:**
- [ ] Star returns to ☆ (empty)
- [ ] Bookmark removed
- [ ] Instant feedback

**Expected**: Star becomes empty

---

### Test 15: Bookmarks Persist After Reload
**Steps:**
1. Bookmark 3-4 videos
2. Note which ones are bookmarked (filled ⭐)
3. Refresh page (Ctrl+R)
4. Come back to same search

**What to Check:**
- [ ] Same videos still show ⭐
- [ ] Bookmarks survived page reload
- [ ] localStorage check: should have `bookmarks_{userId}` key

**Expected**: Bookmarks persist across sessions

---

### Test 16: View Bookmarks (if implemented)
**Steps:**
1. Look for "Bookmarks" section/tab

**What to Check:**
- [ ] Can filter to show bookmarked videos only
- [ ] See only ⭐ videos
- [ ] Can remove from bookmarks here

**Expected**: Bookmarked videos viewable

---

## 🔗 Related Topics Tests

### Test 17: Related Topics Appear
**Steps:**
1. Search "React"
2. Look below results for suggested topics

**What to Check:**
- [ ] Related topics shown (e.g., "JavaScript", "Hooks", etc.)
- [ ] Topics are relevant to search
- [ ] Displayed as clickable buttons/links

**Expected**: Relevant topic suggestions shown

---

### Test 18: Click Related Topic
**Steps:**
1. See related topics below results
2. Click one (e.g., "JavaScript")

**What to Check:**
- [ ] Auto-searches that topic
- [ ] Results update
- [ ] Search box updates with new topic
- [ ] History records new search

**Expected**: New search triggered for related topic

---

## 📱 Mobile Responsiveness Tests

### Test 19: Mobile Layout
**Steps:**
1. Press F12 (DevTools)
2. Click device toggle (📱)
3. Select iPhone 14 or similar

**What to Check:**
- [ ] Search box visible
- [ ] Videos stack vertically (single column)
- [ ] No horizontal scroll needed
- [ ] Hamburger menu (☰) appears for filters
- [ ] Touch-friendly tap targets

**Expected**: Single column mobile layout

---

### Test 20: Mobile Search
**Steps:**
1. While in mobile view, search a topic
2. Select a filter
3. Try sorting

**What to Check:**
- [ ] All functionality works on mobile
- [ ] No layout breaks
- [ ] Readable text sizes
- [ ] Touch interactions work

**Expected**: Full functionality on mobile

---

## 🎯 Edge Cases & Error Handling

### Test 21: Empty Search
**Steps:**
1. Don't type anything
2. Click search

**What to Check:**
- [ ] Shows error or warning message
- [ ] OR defaults to popular topics
- [ ] No crashes

**Expected**: Graceful handling (error message or defaults)

---

### Test 22: Logged Out User
**Steps:**
1. Sign out
2. Try accessing ResourceFinder directly (/finder)

**What to Check:**
- [ ] Redirected to login OR
- [ ] Shows "Please log in" message
- [ ] Can't make API calls without auth

**Expected**: Protected route enforced

---

### Test 23: Network Error (Simulate Offline)
**Steps:**
1. Devtools → Network → Offline
2. Try searching

**What to Check:**
- [ ] Error message shown (not blank page)
- [ ] User knows what happened
- [ ] App recovers when back online

**Expected**: Clear error handling

---

### Test 24: API Quota Exceeded
**Steps:**
1. If you see 403 error
2. Check error message

**What to Check:**
- [ ] Message explains YouTube API quota used
- [ ] User knows to retry later
- [ ] Clear error (not generic "failed")

**Expected**: Specific quota error message

---

### Test 25: Very Long Search Query
**Steps:**
1. Type very long query: "Java programming language tutorial beginner advanced intermediate"
2. Search

**What to Check:**
- [ ] Works without crashing
- [ ] Returns relevant results
- [ ] No UI breaks with long query

**Expected**: Handles long queries gracefully

---

## 🔄 Workflow Tests (End-to-End)

### Test 26: Complete User Journey
**Scenario: New user learning React**

1. Search "React beginner" ✓
2. Filter to 🟢 Beginner ✓
3. Filter to Short duration ✓
4. Bookmark 3 interesting videos ✓
5. Click related topic "Hooks" ✓
6. See Hooks videos ✓
7. Sort by Duration ✓
8. Refresh page ✓
9. Bookmarks still there ✓
10. Search history shows both searches ✓

**Expected**: All steps work smoothly

---

### Test 27: Learning Path Journey
**Scenario: Progress through skill levels**

1. Search "Python" ✓
2. Filter 🟢 Beginner, Sort Short → Long ✓
3. Bookmark 5 beginner videos ✓
4. Change filter to 🟡 Intermediate ✓
5. Bookmark 5 intermediate videos ✓
6. Change filter to 🔴 Advanced ✓
7. Sort by Relevance ✓
8. Bookmark 5 advanced videos ✓
9. Return to search, verify all 15 bookmarks ✓

**Expected**: User can build learning path

---

## 📊 Performance Tests

### Test 28: Search Speed
**What to Measure:**
- [ ] First search: ~3 seconds (acceptable)
- [ ] Second search: ~2-3 seconds
- [ ] No loading spinner stuck

**Tool**: DevTools → Network tab → Note timings

**Expected**: <5 seconds per search

---

### Test 29: Filter Speed
**What to Measure:**
- [ ] Applying filter: <200ms (instant)
- [ ] Changing filter: <200ms
- [ ] No lag

**Tool**: DevTools → Performance tab

**Expected**: Instant filter response

---

### Test 30: Bookmark Speed
**What to Measure:**
- [ ] Clicking star: Instant visual feedback
- [ ] No loading spinner
- [ ] <50ms response

**Expected**: Instant bookmark toggle

---

## 🐛 Debug Log Analysis

### Test 31: Console Logs (Debug Mode)
**Steps:**
1. Open Console (F12)
2. Search for "React"
3. Check for these logs:

**Expected Output**:
```
🔍 Searching for: "React" (userId: user123)
✅ Found 20 videos
```

**What to Check:**
- [ ] 🔍 log appears when searching
- [ ] ✅ log confirms videos found
- [ ] No ❌ errors
- [ ] No ⚠️ warnings

**Expected**: Clean console logs

---

### Test 32: Network Tab Analysis
**Steps:**
1. Open DevTools → Network tab
2. Search for "JavaScript"
3. Find the API call to `/api/resources/search`

**Expected Response**:
```json
{
  "success": true,
  "data": [20 videos],
  "relatedTopics": ["..."],
  "totalResults": 1000000
}
```

**What to Check:**
- [ ] Status: 200 (not 404, 403, 401)
- [ ] Response has 20 videos
- [ ] Each video has: title, thumbnail, channel, duration, skillLevel
- [ ] relatedTopics array present

**Expected**: Valid JSON response with all fields

---

## 📋 Summary Scoring

**Scoring Guide:**
- ✅ All 32 tests pass = **PRODUCTION READY** 🚀
- ✅ 28-31 tests pass = **Ready with minor issues** 
- ✅ 24-27 tests pass = **Needs fixes before release**
- ✅ <24 tests pass = **Major issues - not ready**

---

## 🎯 Priority Test Path (15 minutes)

If short on time, test these critical items:
1. ✅ Page loads (Test 1)
2. ✅ Basic search (Test 2)
3. ✅ Filter by skill (Test 5)
4. ✅ Sort works (Test 10)
5. ✅ Bookmark works (Test 13)
6. ✅ Bookmarks persist (Test 15)
7. ✅ Related topics (Test 17)
8. ✅ Mobile layout (Test 19)
9. ✅ End-to-end journey (Test 26)
10. ✅ Console logs clean (Test 31)

**Result**: 10-15 minutes, covers 80% of functionality

---

## 📝 Notes During Testing

Use this space to record issues:

```
Issue 1: [Description]
- Status: [Pass/Fail]
- Expected: [What should happen]
- Actual: [What happened]
- Severity: [Critical/High/Medium/Low]
- Action: [Fix/Defer/Investigate]

Issue 2: ...
```

---

## 🚀 Next Steps After Testing

**If All Pass:**
- [ ] Deploy to production
- [ ] Mark as v2.0 (major feature update)
- [ ] Update user documentation

**If Some Fail:**
- [ ] Document each failure
- [ ] Prioritize by severity
- [ ] Schedule fixes
- [ ] Re-test after fixes

---

**Testing Date**: _______________  
**Tester Name**: _______________  
**Result**: ⭐⭐⭐⭐⭐ (Rate 1-5 stars)  
**Status**: ✅ PASS / ❌ FAIL / ⚠️ NEEDS FIXES

