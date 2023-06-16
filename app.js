const fs = require("fs/promises");
const moment = require("moment");

const testingDate = "2023-06-18T02:44:51+05:30";

function validTime(time, open, close) {
  if (moment(time).isBetween(moment(open), moment(close))) {
    return true;
  }
  return false;
}

function timing(currentTime, witchTime) {
  const amOrPMOfCurrentTime = currentTime.format("A");
  const amOrPMOfwitchTime = witchTime.format("A");

  if (
    amOrPMOfCurrentTime === amOrPMOfwitchTime &&
    currentTime.format("hh") !== "12"
  ) {
    return witchTime.format("hh") - currentTime.format("hh");
  } else {
    return witchTime.format("hh") - currentTime.format("hh") + 12;
  }
}

async function notOpenOnTheseDays(shop_schedule) {
  let extraHours = 0;
  for (let i = 0; i < 6; i++) {
    let dayOfWeek = moment().add(i, "days");

    let valid = shop_schedule.find(
      (Week) => Week.day === dayOfWeek.format("ddd")
    );
    if (valid) {
      return extraHours;
    } else {
      extraHours += 24;
    }
  }
}

async function shopStatus() {
  const shop_schedule = JSON.parse(await fs.readFile("./SHOP_SCHEDULE.json"));
  const today = moment().format("ddd");
  const currentTime = moment();

  const testDate = `${currentTime.year()}-${
    currentTime.month() + 1
  }-${currentTime.date()}`;

  const openingTime = moment(
    `${testDate} ${shop_schedule[0].open}`,
    "YYYY-MM-DD HH:mm A"
  );

  const closingTime = moment(
    `${testDate} ${shop_schedule[0].close}`,
    "YYYY-MM-DD HH:mm A"
  );

  const isValidDay = shop_schedule.find((dayOfWeek) => dayOfWeek.day === today);
  const isvalidTime = validTime(currentTime, openingTime, closingTime);

  let extraHours;
  if (!isvalidTime && isValidDay) {
    extraHours = await notOpenOnTheseDays(shop_schedule);
  } else {
    extraHours =
      (await notOpenOnTheseDays(shop_schedule)) -
      moment().startOf("day").fromNow().split(" ")[0] -
      5;
  }

  let getHours;
  if (isValidDay && isvalidTime) {
    getHours = timing(currentTime, closingTime) + extraHours;
  } else {
    getHours = timing(currentTime, openingTime) + extraHours;
  }
  return { isValidDay, isvalidTime, getHours };
}

shopStatus()
  .then((data) => {
    let closingDetails;
    for (let i = 1; i < 7; ++i) {
      let couter1 = 24 * i;
      let couter2 = 24 * (i + 1);

      if (couter1 < data.getHours < couter2 && data.getHours - couter1 > 0) {
        closingDetails = `${i} Day(s) and ${data.getHours - couter1}`;
      } else if (data.getHours < 24) {
        closingDetails = `${data.getHours}`;
      }
    }
    if (data.isValidDay && data.isvalidTime) {
      console.log(
        `Shop is open and it will be closed within ${data.getHours} Hrs`
      );
    } else if (!data.isValidDay || !data.isvalidTime) {
      console.log(
        `Shop is closed  and it will be open after ${closingDetails} Hrs`
      );
    }
  })
  .catch((err) => console.log(err));
