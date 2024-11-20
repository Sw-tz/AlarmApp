let alarmTime = null;
let alarmTimeout = null;
let snoozeTimeout = null;
let snoozeEndTime = null;
let snoozeInterval = null;

// ページロード時にlocalStorageから設定を読み込む
window.addEventListener('load', () => {
    const savedAlarmTime = localStorage.getItem('alarmTime');
    const savedSnoozeInterval = localStorage.getItem('snoozeInterval');
    const savedSnoozeEndTime = localStorage.getItem('snoozeEndTime');

    if (savedAlarmTime) {
        document.getElementById('alarmTime').value = savedAlarmTime;
        // アラームを再設定
        setAlarm(savedAlarmTime);
    }

    if (savedSnoozeInterval) {
        document.getElementById('snoozeInterval').value = savedSnoozeInterval;
    }

    if (savedSnoozeEndTime) {
        document.getElementById('snoozeEndTime').value = savedSnoozeEndTime;
    }
});

// アラーム時刻の設定
document.getElementById('setAlarm').addEventListener('click', () => {
    const inputTime = document.getElementById('alarmTime').value;
    if (!inputTime) {
        alert("時刻を設定してください！");
        return;
    }

    // 時刻を「HH:MM」形式でパース（秒を廃止）
    const timeParts = inputTime.split(':');
    const hours = timeParts[0];
    const minutes = timeParts[1];

    // 型の確認とエラーハンドリング
    if (!hours || !minutes || isNaN(hours) || isNaN(minutes)) {
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
        parseInt(minutes)  // 文字列を整数に変換
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
        playAlarmSound();
        document.getElementById('status').textContent = "アラームが鳴りました！";        
        document.getElementById('stopAlarm').disabled = false;
        document.getElementById('snoozeAlarm').disabled = false;
    }, timeToAlarm);

    // localStorageにアラーム時刻とスヌーズ設定を保存
    localStorage.setItem('alarmTime', inputTime);
    localStorage.setItem('snoozeInterval', snoozeInterval);
    if (snoozeEndTime) {
        localStorage.setItem('snoozeEndTime', snoozeEndTime.toLocaleTimeString());
    }
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
let snoozeEnabled = true;  // スヌーズ機能の状態（初期は有効）

// スヌーズ機能を切り替えるボタン
document.getElementById('toggleSnooze').addEventListener('click', () => {
    snoozeEnabled = !snoozeEnabled;  // スヌーズの有効/無効を切り替え

    // ボタンのテキストを変更
    if (snoozeEnabled) {
        document.getElementById('toggleSnooze').textContent = "スヌーズ機能を無効";
    } else {
        document.getElementById('toggleSnooze').textContent = "スヌーズ機能を有効";
    }

    // スヌーズを無効にした場合、スヌーズボタンを無効化
    if (!snoozeEnabled) {
        document.getElementById('snoozeAlarm').disabled = true;
    } else {
        document.getElementById('snoozeAlarm').disabled = false;
    }
});

// スヌーズ機能の処理
document.getElementById('snoozeAlarm').addEventListener('click', () => {
    if (!snoozeEnabled) {
        alert("スヌーズ機能は無効になっています。");
        return;  // スヌーズが無効の場合は処理を終了
    }

    const currentTime = new Date();
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
        navigator.geolocation.getCurrentPosition(getWeatherData, (error) => {
            // 位置情報が取得できなかった場合、デフォルトで東京の天気を表示する
            console.error("位置情報取得エラー: ", error);
            fetchWeatherForDefaultLocation();
        });
    } else {
        fetchWeatherForDefaultLocation();
    }
    
}

// 位置情報をもとに天気情報を取得
function getWeatherData(position) {
    const apiKey = "1534bd56626df4b167a4432eec070ae7" // ここにOpenWeatherMapのAPIキーを設定
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

function fetchWeatherForDefaultLocation() {
    const defaultLat = 34.8258; // 藤枝市の緯度
    const defaultLon = 138.2632; // 藤枝市の経度
    const apiKey = "1534bd56626df4b167a4432eec070ae7" // ここにOpenWeatherMapのAPIキーを設定
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${defaultLat}&lon=${defaultLon}&appid=${apiKey}&units=metric&lang=ja`;

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
    document.getElementById('weatherInfo').textContent = weatherInfo;
}
