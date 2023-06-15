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

async function shopStatus() {
  const shop_schedule = JSON.parse(await fs.readFile("./SHOP_SCHEDULE.json"));
  const today = moment().format("ddd");
  const time = moment();
  const open = moment(shop_schedule[0].open, "hh:mm A");
  const close = moment(shop_schedule[0].close, "hh:mm A");
  const validDay = shop_schedule.find((dayOfWeek) => dayOfWeek.day === today);

  const isvalidTime = validTime(time, open, close);
  return { validDay, isvalidTime };
}

shopStatus()
  .then((data) => {
    if (data.validDay && data.isvalidTime) {
      console.log("Shop is open !");
    } else {
      console.log("Shop is closed !");
    }
  })
  .catch((err) => console.log(err));
