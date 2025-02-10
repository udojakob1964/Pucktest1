async function connectPuckJS() {
    try {
        console.log("🔍 Suche nach Puck.js...");
        document.getElementById("status").innerText = "🟡 Suche nach Puck.js...";

        // 1️⃣ Bluetooth-Gerät suchen
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "Puck.js" }],
            optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] // Nordic UART Service UUID
        });

        console.log(`✅ Gefunden: ${device.name}`);
        document.getElementById("status").innerText = `🟢 Verbunden mit ${device.name}`;

        // 2️⃣ Verbindung herstellen
        const server = await device.gatt.connect();
        console.log("🔗 Verbindung hergestellt!");

        // 3️⃣ UART Service abrufen
        const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');

        // 4️⃣ RX-Charakteristik (Datenempfang) abrufen
        const characteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

        // 5️⃣ Benachrichtigungen aktivieren
        await characteristic.startNotifications();
        console.log("📡 Benachrichtigungen aktiviert!");

        // 6️⃣ Event-Listener für Button-Events hinzufügen
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
            let value = new TextDecoder().decode(event.target.value);
            console.log(`🔹 Empfangene Daten: ${value}`);

            if (value.includes("BTN_DOWN")) {
                console.log("⬇️ Button wurde gedrückt!");
                document.getElementById("status").innerText = "🟠 Button gedrückt!";
            } else if (value.includes("BTN_UP")) {
                console.log("⬆️ Button wurde losgelassen!");
                document.getElementById("status").innerText = "🟢 Verbunden, Button losgelassen!";
            }
        });

        // 7️⃣ TX-Charakteristik (Daten senden) abrufen
        const txCharacteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');

        // 8️⃣ Korrigierter Befehl für Puck.js
        // const command = "setWatch(function(e) {Bluetooth.println(e.state ? 'BTN_DOWN' : 'BTN_UP');}, BTN, {edge:'both', debounce:50, repeat:true});\n";
        // !!!! Command lässt sich irgendwie nicht auf den Puck übertragen. 
        // => Als workaround: Einfach die Konsole (https://www.espruino.com/ide/) öffnen, verbinden, command pasten und ins RAM schreiben....
        // 9️⃣ Befehl an Puck.js senden
        //await txCharacteristic.writeValueWithoutResponse(new TextEncoder().encode(command));
        // console.log("🎯 Button-Event-Listener auf Puck.js aktiviert!"); 

        // 🔟 Event, wenn die Verbindung getrennt wird
        device.addEventListener('gattserverdisconnected', () => {
            console.log("❌ Verbindung getrennt!");
            document.getElementById("status").innerText = "🔴 Verbindung getrennt!";
        });

    } catch (error) {
        console.error("❌ Fehler:", error);
        document.getElementById("status").innerText = "❌ Fehler bei der Verbindung!";
    }
}

// 🔘 Verbindung mit Button starten
document.querySelector("#connectButton").addEventListener("click", connectPuckJS);
