// Copyright 2015 Alex Ryan
// (Don't judge how awful this JavaScript looks, it was compiled
// from much prettier TypeScript. TS is awesome!)
/// <reference path="spin.d.ts" />
/// <reference path="moment.d.ts" />
var spinner = new Spinner();
function activateSpinner() {
    var target = document.getElementById("content");
    spinner.spin(target);
}
function deactivateSpinner() {
    var target = document.getElementById("content");
    spinner.stop();
}
function isFriday() {
    var day = (new Date()).getDay();
    return (day == 5);
}
function isWeekend() {
    var day = (new Date()).getDay();
    return ((day == 6) || (day == 0));
}
var Meal;
(function (Meal) {
    Meal[Meal["Breakfast"] = 0] = "Breakfast";
    Meal[Meal["Lunch"] = 1] = "Lunch";
    Meal[Meal["Dinner"] = 2] = "Dinner";
    Meal[Meal["None"] = 3] = "None";
})(Meal || (Meal = {}));
;
function calculateCurrentMealInfo() {
    var now = new Date();
    var breakfastStart = new Date();
    var breakfastEnd = new Date();
    var lunchStart = new Date();
    var lunchEnd = new Date();
    var dinnerStart = new Date();
    var dinnerEnd = new Date();
    breakfastStart.setHours(9, 0);
    breakfastEnd.setHours(10, 0);
    lunchStart.setHours(12, 30);
    lunchEnd.setHours(13, 30);
    dinnerStart.setHours(18, 30);
    dinnerEnd.setHours(19, 15);
    if (isWeekend()) {
        return { meal: Meal.None,
            time: now,
            isNow: false };
    }
    if (now < breakfastStart) {
        return { meal: Meal.Breakfast,
            time: breakfastStart,
            isNow: false };
    }
    if ((now > breakfastStart) && (now < breakfastEnd)) {
        return { meal: Meal.Breakfast,
            time: breakfastEnd,
            isNow: true };
    }
    if ((now > breakfastEnd) && (now < lunchStart)) {
        return { meal: Meal.Lunch,
            time: lunchStart,
            isNow: false };
    }
    if ((now > lunchStart) && (now < lunchEnd)) {
        return { meal: Meal.Lunch,
            time: lunchEnd,
            isNow: true };
    }
    if (!isFriday()) {
        if ((now > lunchEnd) && (now < dinnerStart)) {
            return { meal: Meal.Dinner,
                time: dinnerStart,
                isNow: false };
        }
        if ((now > dinnerStart) && (now < dinnerEnd)) {
            return { meal: Meal.Dinner,
                time: dinnerEnd,
                isNow: true };
        }
    }
    return { meal: Meal.None,
        time: now,
        isNow: false };
}
function drawWhichMeal() {
    var currentMealInfo = calculateCurrentMealInfo();
    var meal = currentMealInfo.meal;
    var time = currentMealInfo.time;
    var isNow = currentMealInfo.isNow;
    var pre = "";
    var body = "";
    var post = "";
    if (isNow) {
        pre = "Currently serving ";
        post = " until ";
    }
    else {
        pre = "Next up: ";
        post = " at ";
    }
    post += moment(time).format("h:mm") + ".";
    switch (meal) {
        case Meal.Breakfast:
            body = "breakfast";
            document.getElementById("breakfastTimes").style.color = "green";
            break;
        case Meal.Lunch:
            body = "lunch";
            document.getElementById("lunchTimes").style.color = "green";
            break;
        case Meal.Dinner:
            body = "dinner";
            document.getElementById("dinnerTimes").style.color = "green";
            break;
    }
    if (meal == Meal.None) {
        var output = "Go out to eat!";
    }
    else {
        var output = pre + body + post;
    }
    document.getElementById("currentMeal").innerHTML = output;
}
function getDataThenDrawMenu() {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://script.googleusercontent.com/macros/echo?user_content_key=Iku4CGe5_WThh3oF_DFezWYZqBYYyMa2X-_k0aBu1ezY5Zqn8FkeBsLLnZ_RAEcjp15gwNXhr4CrAYSND1cR1Z-1eM6AxOKTm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnIbU15bzVjjRaqbric4FZjE7WJ5W35p2GFD85ZmQw1fkdMJBJiowdatKu-hQNta20TOmbnRGq-tk&lib=MzeUlzvZKqWHbDHnqVaX7dqRxvVkFdhbQ";
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            deactivateSpinner();
            drawMenu(JSON.parse(xmlhttp.responseText));
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    activateSpinner();
}
function drawMenu(menuData) {
    var meal = calculateCurrentMealInfo().meal;
    switch (meal) {
        case Meal.Breakfast:
            var breakfastMenuData = menuData.slice(4, 12);
            breakfastMenuData.forEach(function (item) {
                addRowFromArray(item, "menuItems");
            });
            break;
        case Meal.Lunch:
            var lunchMenuData = menuData.slice(13, 25);
            lunchMenuData.forEach(function (item) {
                addRowFromArray(item, "menuItems");
            });
            break;
        case Meal.Dinner:
            var dinnerMenuData = menuData.slice(26, 38);
            dinnerMenuData.forEach(function (item) {
                addRowFromArray(item, "menuItems");
            });
            break;
    }
}
function addRowFromArray(keyValue, tableName) {
    addRow(keyValue[0], keyValue[1], tableName);
}
function addRow(key, value, tableName) {
    var rowelem = document.createElement("tr");
    var keyelem = document.createElement("td");
    var valueelem = document.createElement("td");
    var keytext = document.createTextNode(key + ": ");
    var valuetext = document.createTextNode(value);
    keyelem.appendChild(keytext);
    valueelem.appendChild(valuetext);
    rowelem.appendChild(keyelem);
    rowelem.appendChild(valueelem);
    document.getElementById(tableName).appendChild(rowelem);
}
window.onload = function () {
    getDataThenDrawMenu();
    drawWhichMeal();
};
