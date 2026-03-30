const TimeTable = require('../../Model/Time Table Management/TimeTableModel');
// const twilio = require('twilio'); // Uncomment when keys are available
// const admin = require('firebase-admin'); // Uncomment when keys are available

/**
 * Foundation for sending Scheduled Reminders via Twilio/Firebase
 */
exports.processScheduledReminders = async () => {
  try {
    console.log('[NotificationService] Processing scheduled reminders...');
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));
    const todayEnd = new Date(now.setHours(23,59,59,999));

    // Find timetables that have pending blocks scheduled for today
    const timetables = await TimeTable.find({
      "generatedSchedule": {
        $elemMatch: {
          date: { $gte: todayStart, $lte: todayEnd },
          status: 'Pending'
        }
      }
    }).populate('user'); 

    for (let table of timetables) {
      const pendingToday = table.generatedSchedule.filter(block => 
        new Date(block.date) >= todayStart && 
        new Date(block.date) <= todayEnd && 
        block.status === 'Pending'
      );

      if (pendingToday.length > 0) {
        const message = `Reminder: You have ${pendingToday.length} study blocks pending today for ${table.examName}. Stay focused!`;
        
        // Mock Sending Logic
        console.log(`[NotificationService] Sending to User ${table.user} -> ${message}`);

        /*
        // --- Firebase Push Notification Example ---
        if (table.user.deviceToken) {
           await admin.messaging().send({
             token: table.user.deviceToken,
             notification: { title: 'Study Reminder', body: message }
           });
        }

        // --- Twilio SMS Example ---
        if (table.user.phoneNumber) {
           const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
           await client.messages.create({
             body: message,
             from: process.env.TWILIO_PHONE,
             to: table.user.phoneNumber
           });
        }
        */
      }
    }

  } catch (err) {
    console.error('[NotificationService] Error processing reminders:', err);
  }
};
