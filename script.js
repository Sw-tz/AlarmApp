let alarmTime = null;
let alarmTimeout = null;
let snoozeTimeout = null;
let snoozeEndTime = null;
let snoozeInterval = null;

document.getElementById('setAlarm').addEventListener('click', () => {
    const inputTime = document.getElementById('alarmTime').value;
    if (!inputTime) {
        alert("時刻を設定してください！");
        return;
    }

    // 時刻を「HH:MM:SS」形式でパース
    const [hours, minutes, seconds] = inputTime.split(':');

    // 型の確認とエラーハンドリング
    if (!hours || !minutes || !seconds) {
        alert("時刻の形式が正しくありません。");
        return;
    }

    // 現在の日付を基に時刻を設定（年、月、日を現在のものに設定）
    const currentTime = new Date();
    alarmTime = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDate(),
        parseInt(hours),   // 文字列を整数に変換
        parseInt(minutes), // 文字列を整数に変換
        parseInt(seconds)  // 文字列を整数に変換
    );

    // 現在時刻を過ぎている場合、翌日に設定
    if (alarmTime.getTime() <= currentTime.getTime()) {
        alarmTime.setDate(alarmTime.getDate() + 1); // 翌日に設定
    }

    // スヌーズの設定を取得
    snoozeInterval = parseInt(document.getElementById('snoozeInterval').value) || 5; // デフォルト値 5分
    const snoozeEndTimeStr = document.getElementById('snoozeEndTime').value;
    if (snoozeEndTimeStr) {
        const [snoozeEndHours, snoozeEndMinutes] = snoozeEndTimeStr.split(':');
        snoozeEndTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), snoozeEndHours, snoozeEndMinutes);
    }

    // アラームまでの時間を計算
    const timeToAlarm = alarmTime.getTime() - currentTime.getTime();

    document.getElementById('status').textContent = `アラームを ${alarmTime.toLocaleString()} にセットしました！`;

    // 古いアラームをキャンセルして、新しいアラームをセット
    clearTimeout(alarmTimeout);
    alarmTimeout = setTimeout(() => {
        alert("アラームが鳴りました！");
        playAlarmSound();
        document.getElementById('stopAlarm').disabled = false;
        document.getElementById('snoozeAlarm').disabled = false;
    }, timeToAlarm);
});


// アラーム音を再生する関数
function playAlarmSound() {
    const alarmSound = document.getElementById('alarmSound');
    alarmSound.play();
}

// アラーム停止ボタン
document.getElementById('stopAlarm').addEventListener('click', () => {
    const alarmSound = document.getElementById('alarmSound');
    alarmSound.pause();
    alarmSound.currentTime = 0; // 音を最初に戻す
    document.getElementById('status').textContent = "アラームは停止しました。";
    document.getElementById('stopAlarm').disabled = true;
    document.getElementById('snoozeAlarm').disabled = true;
});

// スヌーズ機能
document.getElementById('snoozeAlarm').addEventListener('click', () => {
    const currentTime = new Date();

    // スヌーズの終了時間を過ぎている場合はスヌーズを停止
    if (snoozeEndTime && currentTime >= snoozeEndTime) {
        alert("スヌーズ機能が終了しました。");
        return;
    }

    const timeToSnooze = snoozeInterval * 60000; // スヌーズ間隔をミリ秒に変換

    // 新しいアラームをスヌーズの時間後に設定
    clearTimeout(snoozeTimeout);
    snoozeTimeout = setTimeout(() => {
        alert("スヌーズアラームが鳴りました！");
        playAlarmSound();
        document.getElementById('stopAlarm').disabled = false;
        document.getElementById('snoozeAlarm').disabled = false;
    }, timeToSnooze);

    document.getElementById('status').textContent = `スヌーズ：${snoozeInterval}分後に再設定しました。`;
});

// 天気情報を取得する関数
function fetchWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeatherData);
    } else {
        alert("位置情報の取得ができません");
    }
}

// 位置情報をもとに天気情報を取得
function getWeatherData(position) {
    const apiKey = "YOUR_API_KEY"; "1534bd56626df4b167a4432eec070ae7" // ここにOpenWeatherMapのAPIキーを設定
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const weather = data.weather[0].description;
            const temperature = data.main.temp;
            const weatherInfo = `天気: ${weather}, 気温: ${temperature}°C`;
            displayWeatherInfo(weatherInfo);
        })
        .catch(error => console.error("天気情報の取得に失敗しました:", error));
}

// 天気情報を表示する
function displayWeatherInfo(weatherInfo) {
    // 天気情報を表示する<div>に内容を追加
    document.getElementById('weatherInfo').textContent = weatherInfo;
}
