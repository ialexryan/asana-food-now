// Copyright 2015 Alex Ryan
// (Don't judge how awful this JavaScript looks, it was compiled
// from much prettier TypeScript. TS is awesome!)

/// <reference path="3rdparty_definitions/spin.d.ts" />
/// <reference path="3rdparty_definitions/moment.d.ts" />

var spinner = new Spinner();

function activateSpinner(): void {
    var target = document.getElementById("content");
    spinner.spin(target);
}

function deactivateSpinner(): void {
    var target = document.getElementById("content");
    spinner.stop();
}

function isFriday(): boolean {
    return (moment().day() == 5);
}

function isWeekend(): boolean {
    var day: number = moment().day();
    return ((day == 6) || (day == 0));
}

enum Meal {Breakfast, Lunch, Dinner, None};

// This function returns the next meal, whether it is currently happening,
// and its start or end time, as appropriate.
function calculateCurrentMealInfo(): {meal: Meal,
                                      time: Moment,
                                      isNow: boolean} {
    var now = moment();

    var breakfastStart = moment("9:00", "h:mm");
    var breakfastEnd = moment("10:00", "h:mm");

    var lunchStart = moment("12:30", "h:mm");
    var lunchEnd = moment("13:30", "h:mm");

    var dinnerStart = moment("18:30", "h:mm");
    var dinnerEnd = moment("19:15", "h:mm");

    if (isWeekend()) {
        return {meal: Meal.None,
                time: now,
                isNow: false};
    }
    if (now.isBefore(breakfastStart)) {
        return {meal: Meal.Breakfast,
                time: breakfastStart,
                isNow: false};
    }
    if (now.isBetween(breakfastStart, breakfastEnd)) {
        return {meal: Meal.Breakfast,
                time: breakfastEnd,
                isNow: true};
    }
    if (now.isBetween(breakfastEnd, lunchStart)) {
        return {meal: Meal.Lunch,
                time: lunchStart,
                isNow: false};
    }
    if (now.isBetween(lunchStart, lunchEnd)) {
        return {meal: Meal.Lunch,
                time: lunchEnd,
                isNow: true};
    }
    // Dinner isn't served on Fridays
    if (!isFriday()) {
        if (now.isBetween(lunchEnd, dinnerStart)) {
            return {meal: Meal.Dinner,
                    time: dinnerStart,
                    isNow: false};
        }
        if (now.isBetween(dinnerStart, dinnerEnd)) {
            return {meal: Meal.Dinner,
                    time: dinnerEnd,
                    isNow: true};
        }
    }
    return {meal: Meal.None,
            time: now,
            isNow: false};
}


function drawWhichMeal(): void {
    var currentMealInfo = calculateCurrentMealInfo();
    var meal: Meal = currentMealInfo.meal;
    var time: Moment = currentMealInfo.time;
    var isNow: boolean = currentMealInfo.isNow;
    var pre: string = "";
    var body: string = "";
    var post: string = "";

    if (isNow) {
        pre = "Currently serving ";
        post = " until ";
    } else {
        pre = "Next up: ";
        post = " at ";
    }
    post += time.format("h:mm") + ".";

    switch(meal) {
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


    var output = "";
    if (meal == Meal.None) {
        output = "Go out to eat!";
    } else {
        output = pre + body + post;
    }

    document.getElementById("currentMeal").innerHTML = output;
}


function getDataThenDrawMenu(): void {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://script.googleusercontent.com/macros/echo?user_content_key=Iku4CGe5_WThh3oF_DFezWYZqBYYyMa2X-_k0aBu1ezY5Zqn8FkeBsLLnZ_RAEcjp15gwNXhr4CrAYSND1cR1Z-1eM6AxOKTm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnIbU15bzVjjRaqbric4FZjE7WJ5W35p2GFD85ZmQw1fkdMJBJiowdatKu-hQNta20TOmbnRGq-tk&lib=MzeUlzvZKqWHbDHnqVaX7dqRxvVkFdhbQ";

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            deactivateSpinner();
            drawMenu(JSON.parse(xmlhttp.responseText));
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    activateSpinner();
}

function drawMenu(menuData: string[][]): void {
    var meal: Meal = calculateCurrentMealInfo().meal;
    switch(meal) {
        case Meal.Breakfast:
            var breakfastMenuData = menuData.slice(4, 12);
            breakfastMenuData.forEach(function (item: string[]){
                addRowFromArray(item, "menuItems");
            })
            break;
        case Meal.Lunch:
            var lunchMenuData = menuData.slice(13, 25);
            lunchMenuData.forEach(function (item: string[]){
                addRowFromArray(item, "menuItems");
            })
            break;
        case Meal.Dinner:
            var dinnerMenuData = menuData.slice(26, 38);
            dinnerMenuData.forEach(function (item: string[]){
                addRowFromArray(item, "menuItems");
            })
            break;
    }
}

function addRowFromArray(keyValue: string[], tableName: string): void {
    addRow(keyValue[0], keyValue[1], tableName);
}

function addRow(key: string, value: string, tableName: string): void {
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



/* This is the "main" function of sorts, it gets called when the page loads.
   It sets the places list and time to refresh every 5 seconds. */
window.onload = function() {
    if (bowser.safari) {
        var menuHeader: HTMLElement = document.getElementById("menuHeader");
        menuHeader.parentNode.removeChild(menuHeader);
    } else {
        var menuHeader: HTMLElement = document.getElementById("safariWarning");
        menuHeader.parentNode.removeChild(menuHeader);
        getDataThenDrawMenu();
    }
    drawWhichMeal();
}
