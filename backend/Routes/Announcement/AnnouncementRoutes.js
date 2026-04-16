const express = require("express");
const router = express.Router();
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../../Controller/Announcement/AnnouncementController");

// No middleware — no req.user needed anywhere
router.route("/").get(getAllAnnouncements).post(createAnnouncement);
router.route("/:id").get(getAnnouncementById).put(updateAnnouncement).delete(deleteAnnouncement);

module.exports = router;





//("../../Controller/Announcement/AnnouncementController");