/**
 * Debug script to investigate battery drain time issue
 * Run this in the browser console on the DeviceDetails page
 */

(function debugBatteryDrain() {
  console.log("🔍 Debugging Battery Drain Time Issue");
  console.log("=====================================\n");

  // Instructions
  console.log("📋 Instructions:");
  console.log("1. Open React DevTools");
  console.log("2. Find the DeviceDetails component");
  console.log("3. Copy the 'packets' array from the component state");
  console.log("4. Run: window.debugPackets = [paste packets here]");
  console.log("5. Then run this script again\n");

  if (typeof window.debugPackets === 'undefined') {
    console.log("⚠️  No packets data found. Please set window.debugPackets first.");
    console.log("\nExample:");
    console.log("window.debugPackets = [/* paste packets array */];");
    return;
  }

  const packets = window.debugPackets;
  
  console.log("📊 Packet Analysis:");
  console.log("Total packets:", packets.length);
  
  // Check packet types
  const packetTypes = {};
  packets.forEach(p => {
    const type = p.packetType || 'unknown';
    packetTypes[type] = (packetTypes[type] || 0) + 1;
  });
  console.log("Packet types:", packetTypes);
  
  // Filter normal packets
  const normalPackets = packets.filter(
    (p) => p.packetType === "N" || p.packetType === "PACKET_N"
  );
  console.log("Normal packets:", normalPackets.length);
  
  if (normalPackets.length === 0) {
    console.log("❌ No normal packets found!");
    return;
  }
  
  // Check first normal packet
  console.log("\n📦 First Normal Packet:");
  const first = normalPackets[0];
  console.log("Battery:", first.battery);
  console.log("deviceRawTimestamp:", first.deviceRawTimestamp);
  console.log("deviceTimestamp:", first.deviceTimestamp);
  console.log("deviceTimestampDate:", first.deviceTimestampDate);
  console.log("Full packet:", first);
  
  // Look for 100% battery
  console.log("\n🔋 Searching for 100% battery packets...");
  let found100 = false;
  
  for (let i = 0; i < normalPackets.length; i++) {
    const p = normalPackets[i];
    const batteryStr = String(p.battery || "").replace(/[^\d]/g, "");
    const batteryNum = Number(batteryStr);
    
    if (batteryNum === 100) {
      found100 = true;
      console.log(`✅ Found 100% at index ${i}:`);
      console.log("   Battery:", p.battery);
      console.log("   deviceRawTimestamp:", p.deviceRawTimestamp);
      console.log("   deviceTimestamp:", p.deviceTimestamp);
      console.log("   Full packet:", p);
      break;
    }
  }
  
  if (!found100) {
    console.log("❌ No 100% battery record found");
    console.log("   This would cause 'No 100% record' to display");
  }
  
  // Check current battery
  const currentBatteryStr = String(first.battery || "").replace(/[^\d]/g, "");
  const currentBattery = Number(currentBatteryStr);
  console.log("\n📊 Current Battery:", currentBattery);
  
  if (currentBattery === 100) {
    console.log("⚠️  Current battery is 100%, this would show '-'");
  }
  
  // Test timestamp parsing
  console.log("\n⏰ Testing Timestamp Parsing:");
  
  function testTimestamp(packet, label) {
    console.log(`\n${label}:`);
    
    if (!packet) {
      console.log("  ❌ Packet is null/undefined");
      return null;
    }
    
    console.log("  deviceRawTimestamp:", packet.deviceRawTimestamp);
    console.log("  deviceTimestamp:", packet.deviceTimestamp);
    
    let timestamp = packet.deviceRawTimestamp;
    console.log("  Using deviceRawTimestamp:", timestamp);
    
    if (!timestamp) {
      timestamp = packet.deviceTimestamp;
      console.log("  Fallback to deviceTimestamp:", timestamp);
    }
    
    if (!timestamp) {
      console.log("  ❌ No timestamp available");
      return null;
    }
    
    const date = new Date(timestamp);
    console.log("  Parsed date:", date);
    console.log("  Valid:", !isNaN(date.getTime()));
    
    return date;
  }
  
  const currentTime = testTimestamp(first, "Current Packet");
  
  if (found100) {
    const fullBatteryPacket = normalPackets.find(p => {
      const b = Number(String(p.battery || "").replace(/[^\d]/g, ""));
      return b === 100;
    });
    const fullTime = testTimestamp(fullBatteryPacket, "100% Battery Packet");
    
    if (currentTime && fullTime) {
      const elapsedMs = currentTime - fullTime;
      console.log("\n⏱️  Time Calculation:");
      console.log("  Elapsed ms:", elapsedMs);
      console.log("  Elapsed hours:", (elapsedMs / (1000 * 60 * 60)).toFixed(2));
      console.log("  Elapsed minutes:", Math.round(elapsedMs / (1000 * 60)));
      
      if (elapsedMs < 0) {
        console.log("  ❌ Negative time difference! This would show '-'");
      } else {
        const elapsedHours = elapsedMs / (1000 * 60 * 60);
        if (elapsedHours >= 1) {
          console.log("  ✅ Result:", elapsedHours.toFixed(1) + "h");
        } else {
          const elapsedMinutes = Math.round(elapsedMs / (1000 * 60));
          console.log("  ✅ Result:", elapsedMinutes + "m");
        }
      }
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("🎯 Summary:");
  console.log("=".repeat(50));
  
  if (normalPackets.length === 0) {
    console.log("❌ Issue: No normal packets found");
  } else if (!found100) {
    console.log("⚠️  Expected: 'No 100% record'");
  } else if (currentBattery === 100) {
    console.log("⚠️  Expected: '-' (current battery is 100%)");
  } else if (!currentTime) {
    console.log("❌ Issue: Cannot parse current timestamp");
  } else {
    console.log("✅ Should display a time value");
  }
})();
