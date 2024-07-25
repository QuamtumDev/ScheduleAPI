const express = require('express');
const moment = require("moment-timezone");
const schedule = require('./schedule.json');
app = express();

app.get('/', (req, res) => {
    res.json(schedule)
})

function getCurrentDayAndTime() {
    const now = moment().tz("Asia/Bangkok");
    const day = now.format("dddd");
    //const time = parseInt(now.format("HHmm"), 10);
    // const day = 'Monday'
     const time = parseInt(`0935`, 10);
    return { day, time };
}

function getCurrentPeriod() {
    const { day, time } = getCurrentDayAndTime();
  
    console.log(`day: ${day}, time: ${time}`);
  
    if (schedule.hasOwnProperty(day)) {
      const currentSchedule = schedule[day];
      for (const period of currentSchedule) {
        const startTime = parseInt(period.start.replace(":", ""), 10);
        const endTime = parseInt(period.end.replace(":", ""), 10);
  
        if (time >= startTime && time < endTime) {
          return period;
        }
      }
      return { message: "No class found" };
    } else {
      return { message: "No schedule available for today" };
    }
  }

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
      }
    next();
});

  app.get("/now", (req, res) => {
    res.json(getCurrentPeriod());
  });

  app.get('/next', (req, res) => {
    try {
        const { day } = getCurrentDayAndTime();
        const currentPeriod = getCurrentPeriod();

        if (!currentPeriod || !currentPeriod.period) {
            res.json({ message: 'No current class found' });
            return;
        }

        const nextPeriod = schedule[day].find(
            (current) => current.period === currentPeriod.period + 1
        );

        if (nextPeriod) {
            res.json(nextPeriod);
        } else {
            res.json({ message: 'No next class found' });
        }
    } catch (error) {
        console.error('Error at /next endpoint:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  
  module.exports = app;

  // Start the server if not in Vercel environment
  if (require.main === module) {
    const port = 1111;
    app.listen(port, () => {
      console.log('Server : localhost');
      console.log(`Server is running on port ${port}`);
    });
  }