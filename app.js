const fs = require("fs/promises");
const moment = require("moment");

function validTime(time, open, close) {
  if (
    moment(time, "hh:mm A").isBetween(
      moment(open, "hh:mm A"),
      moment(close, "hh:mm A")
    )
  ) {
    return true;
  }
}

function closedWithin(currentTime, closingTime) {
  const amOrPMOfCurrentTime = currentTime.format("A");

  if (amOrPMOfCurrentTime === "AM") {
    return closingTime.format("hh") - currentTime.format("hh") + 12;
  } else {
    return closingTime.format("hh") - currentTime.format("hh");
  }
}

async function shopStatus() {
  const shop_schedule = JSON.parse(await fs.readFile("./SHOP_SCHEDULE.json"));
  const today = moment().format("ddd");
  const currentTime = moment();
  const opening = moment(shop_schedule[0].open, "hh:mm A");
  const closingTime = moment(shop_schedule[0].close, "hh:mm A");

  const validDay = shop_schedule.find((dayOfWeek) => dayOfWeek.day === today);
  const isvalidTime = validTime(currentTime, opening, closingTime);
  const closingHours = closedWithin(currentTime, closingTime);

  return { validDay, isvalidTime, closingHours };
}

shopStatus()
  .then((data) => {
    if (data.validDay && data.isvalidTime) {
      console.log("data", data);
      console.log(
        `Shop is open and it will be closed within ${data.closingHours} Hrs`
      );
    } else {
      console.log("data", data);
      console.log("Shop is closed !");
    }
  })
  .catch((err) => console.log(err));
