const TimeTable = require('../../Model/Time Table Management/TimeTableModel');

const formatTime = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.floor(totalMinutes % 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const ampmHour = (h % 12 === 0 ? 12 : h % 12);
  const mm = m < 10 ? '0' + m : m;
  return `${ampmHour}:${mm} ${ampm}`;
};

// Generate a new Time Table (V2)
exports.generateTimeTable = async (req, res) => {
  try {
    const {
      userId, examName, examDate, hoursPerDay, availableSlots,
      energyLevel, studyPreference, subjects, prioritizeDifficult,
      scheduleType, unavailableDays, unavailableTimeSlots, minBreakDuration
    } = req.body;

    if (!userId || !examName || !examDate || !hoursPerDay || !subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const examTargetDate = new Date(examDate);
    const today = new Date();
    
    // Validate dates
    const timeDiff = examTargetDate.getTime() - today.getTime();
    const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (daysUntilExam <= 0) return res.status(400).json({ message: 'Exam date must be in the future' });
    if (daysUntilExam > 31) return res.status(400).json({ message: 'Exam date cannot be more than 1 month away' });

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Calculate available study days
    const studyDays = [];
    for (let i = 0; i < daysUntilExam; i++) {
      const iterDate = new Date(currentDate);
      iterDate.setDate(currentDate.getDate() + i);
      const dayName = iterDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (!unavailableDays || !unavailableDays.includes(dayName)) {
        studyDays.push({ date: iterDate, dayName });
      }
    }

    if (studyDays.length === 0) return res.status(400).json({ message: 'No available study days before exam' });

    // Weight subjects based on proficiency
    let totalWeight = 0;
    const weightedSubjects = subjects.map(sub => {
      let weight = 1;
      if (prioritizeDifficult) {
        if (sub.proficiency === 'Weak') weight = 2.0;
        else if (sub.proficiency === 'Strong') weight = 0.5;
      }
      totalWeight += weight;
      return { ...sub, weight };
    });

    const totalAvailableHours = studyDays.length * hoursPerDay;
    const subjectAllocations = weightedSubjects.map(sub => ({
      name: sub.name,
      proficiency: sub.proficiency,
      allocatedHours: (sub.weight / totalWeight) * totalAvailableHours,
      assignedHours: 0
    }));

    const generatedSchedule = [];

    for (const day of studyDays) {
      let hoursLeftInDay = hoursPerDay;
      let lastSubjectAssigned = null;
      
      // Start clock based on preference (Morning=9am, Afternoon=1pm, Night=7pm, Mixed=9am)
      let currentMinutes = 9 * 60; 
      if (studyPreference === 'Afternoon') currentMinutes = 13 * 60;
      if (studyPreference === 'Night') currentMinutes = 19 * 60;
      
      const todayBusy = (unavailableTimeSlots || []).filter(slot => slot.day === day.dayName);

      while (hoursLeftInDay > 0) {
        let subjectsNeedingHours = subjectAllocations.filter(s => s.assignedHours < s.allocatedHours);
        
        // Force Interleaving
        if (subjectsNeedingHours.length > 1 && lastSubjectAssigned) {
          const others = subjectsNeedingHours.filter(s => s.name !== lastSubjectAssigned.name);
          if (others.length > 0) subjectsNeedingHours = others;
        }

        let selectedSubject;
        if (subjectsNeedingHours.length > 0) {
          selectedSubject = subjectsNeedingHours.reduce((a, b) => 
            (a.allocatedHours - a.assignedHours) > (b.allocatedHours - b.assignedHours) ? a : b
          );
        } else {
          selectedSubject = subjectAllocations.reduce((a, b) => a.assignedHours < b.assignedHours ? a : b);
        }

        let maxBlockSize = energyLevel === 'High' ? 2 : (energyLevel === 'Low' ? 1 : 1.5);
        if (selectedSubject.proficiency === 'Weak' && energyLevel !== 'High') {
          maxBlockSize = Math.min(maxBlockSize, 1); 
        }

        const needed = selectedSubject.allocatedHours - selectedSubject.assignedHours;
        const blockDurationHours = Math.min(maxBlockSize, hoursLeftInDay, needed > 0 ? needed : hoursLeftInDay);
        
        if (blockDurationHours <= 0) break;

        let blockMins = blockDurationHours * 60;

        // Collision Check Algorithm
        let tryingToPlace = true;
        while (tryingToPlace) {
          let collision = false;
          let latestBusyEnd = 0;
          for (const busy of todayBusy) {
            const [h1, m1] = busy.startTime.split(':').map(Number);
            const [h2, m2] = busy.endTime.split(':').map(Number);
            const busyStart = h1 * 60 + m1;
            const busyEnd = h2 * 60 + m2;
            
            if (currentMinutes < busyEnd && (currentMinutes + blockMins) > busyStart) {
              collision = true;
              if (busyEnd > latestBusyEnd) latestBusyEnd = busyEnd;
            }
          }
          if (collision) {
             currentMinutes = latestBusyEnd;
          } else {
             tryingToPlace = false;
          }
        }

        const formattedTimeSlot = `${formatTime(currentMinutes)} - ${formatTime(currentMinutes + blockMins)}`;

        generatedSchedule.push({
          date: day.date,
          dayName: day.dayName,
          timeSlot: formattedTimeSlot,
          subject: selectedSubject.name,
          durationHours: Number(blockDurationHours.toFixed(2)),
          status: 'Pending'
        });

        currentMinutes += blockMins;
        selectedSubject.assignedHours += blockDurationHours;
        hoursLeftInDay -= blockDurationHours;
        lastSubjectAssigned = selectedSubject;

        // Insert explicit Break Block
        if (hoursLeftInDay > 0 && minBreakDuration > 0) {
          const breakMins = minBreakDuration;
          const breakDurationHours = Number((minBreakDuration / 60).toFixed(2));
          
          if (hoursLeftInDay >= breakDurationHours) {
            // Collision check for the break
            tryingToPlace = true;
            let breakCollisionFixed = false;
            while (tryingToPlace) {
              let collision = false;
              let latestBusyEnd = 0;
              for (const busy of todayBusy) {
                const [h1, m1] = busy.startTime.split(':').map(Number);
                const [h2, m2] = busy.endTime.split(':').map(Number);
                const busyStart = h1 * 60 + m1;
                const busyEnd = h2 * 60 + m2;
                
                if (currentMinutes < busyEnd && (currentMinutes + breakMins) > busyStart) {
                  collision = true;
                  if (busyEnd > latestBusyEnd) latestBusyEnd = busyEnd;
                }
              }
              if (collision) {
                currentMinutes = latestBusyEnd;
                breakCollisionFixed = true; // if we bumped it to after a break, maybe they don't need this explicit break since they just finished a large busy chunk. But let's just keep it for simplicity or skip it.
              } else {
                tryingToPlace = false;
              }
            }

            const breakSlot = `${formatTime(currentMinutes)} - ${formatTime(currentMinutes + breakMins)}`;
            
            generatedSchedule.push({
              date: day.date,
              dayName: day.dayName,
              timeSlot: breakSlot,
              subject: 'Break ☕',
              durationHours: breakDurationHours,
              status: 'Completed'
            });
            
            currentMinutes += breakMins;
            hoursLeftInDay -= breakDurationHours;
          }
        }
      }
    }

    const newTimeTable = new TimeTable({
      user: userId, examName, examDate: examTargetDate, hoursPerDay,
      availableSlots, energyLevel, studyPreference, subjects, prioritizeDifficult,
      scheduleType, unavailableDays, unavailableTimeSlots, minBreakDuration, generatedSchedule
    });

    const savedTable = await newTimeTable.save();
    return res.status(201).json(savedTable);

  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUserTimeTables = async (req, res) => {
  try {
    const { userId } = req.params;
    const timetables = await TimeTable.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteTimeTable = async (req, res) => {
  try {
    const { id } = req.params;
    await TimeTable.findByIdAndDelete(id);
    res.status(200).json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update block status (Completed/Pending)
exports.updateBlockStatus = async (req, res) => {
  try {
    const { id, blockId } = req.params;
    const { status } = req.body;
    
    // Ignore updates to break blocks
    const timeTableCheck = await TimeTable.findOne({ _id: id, "generatedSchedule._id": blockId });
    if (timeTableCheck) {
      const block = timeTableCheck.generatedSchedule.id(blockId);
      if (block && block.subject.includes('Break')) {
          return res.status(200).json(timeTableCheck);
      }
    }

    const timeTable = await TimeTable.findOneAndUpdate(
      { _id: id, "generatedSchedule._id": blockId },
      { $set: { "generatedSchedule.$.status": status } },
      { new: true }
    );
    
    if (!timeTable) return res.status(404).json({ message: 'Block not found' });
    res.status(200).json(timeTable);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Recalculate Missed Days
exports.recalculateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const timeTable = await TimeTable.findById(id);
    if (!timeTable) return res.status(404).json({ message: 'Timetable not found' });

    let missedHours = 0;
    const now = new Date();
    
    timeTable.generatedSchedule.forEach(block => {
      if (!block.subject.includes('Break') && block.status === 'Pending' && new Date(block.date) < new Date(now.setHours(0,0,0,0))) {
        missedHours += block.durationHours;
        block.status = 'Completed'; 
      }
    });

    if (missedHours > 0) {
      const futureBlocks = timeTable.generatedSchedule.filter(block => 
        !block.subject.includes('Break') && new Date(block.date) >= new Date(now.setHours(0,0,0,0))
      );

      if (futureBlocks.length > 0) {
        const additionPerBlock = missedHours / futureBlocks.length;
        futureBlocks.forEach(block => {
          block.durationHours = Number((block.durationHours + additionPerBlock).toFixed(2));
        });
      }
    }
    
    await timeTable.save();
    res.status(200).json(timeTable);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Export to ICS
exports.exportToICS = async (req, res) => {
  try {
    const { id } = req.params;
    const timeTable = await TimeTable.findById(id);
    if (!timeTable) return res.status(404).json({ message: 'Timetable not found' });

    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LearnBuddy//TimeTable Gen//EN\r\n";
    
    timeTable.generatedSchedule.forEach((block, index) => {
      const startDate = new Date(block.date);
      // Attempt to parse HH:MM PM from timeSlot if available
      let startH = 9;
      let startM = 0;
      if (block.timeSlot && block.timeSlot.includes(' - ')) {
         const firstTimeStr = block.timeSlot.split(' - ')[0]; // e.g. "4:00 PM"
         const tMatch = firstTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
         if (tMatch) {
            let h = parseInt(tMatch[1]);
            const m = parseInt(tMatch[2]);
            const ampm = tMatch[3].toUpperCase();
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            startH = h;
            startM = m;
         }
      }
      startDate.setHours(startH, startM, 0, 0); 
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + (block.durationHours * 60));

      const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += `UID:lb-block-${id}-${index}@learnbuddy.com\r\n`;
      icsContent += `DTSTAMP:${formatICSDate(new Date())}\r\n`;
      icsContent += `DTSTART:${formatICSDate(startDate)}\r\n`;
      icsContent += `DTEND:${formatICSDate(endDate)}\r\n`;
      icsContent += `SUMMARY:Study ${block.subject} (${timeTable.examName})\r\n`;
      icsContent += "END:VEVENT\r\n";
    });

    icsContent += "END:VCALENDAR\r\n";

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="timetable-${id}.ics"`);
    res.send(icsContent);

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
