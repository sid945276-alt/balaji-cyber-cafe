const form = document.getElementById("applyForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const msg = document.getElementById("formMsg");
    if (msg) msg.textContent = "आवेदन भेजा जा रहा है...";

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        body: new FormData(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "आवेदन भेजने में समस्या हुई।");
      }

      if (msg) {
        msg.className = "success";
        msg.innerHTML =
          "आवेदन सफलतापूर्वक भेज दिया गया।<br>" +
          "आपकी Request ID: <strong>" +
          data.requestId +
          "</strong><br>इसे संभालकर रखें।";
      }

      form.reset();

    } catch (err) {
      if (msg) {
        msg.className = "error";
        msg.textContent = err.message;
      }
    }
  });
}

async function track() {
  const input = document.getElementById("trackId");
  const out = document.getElementById("trackResult");

  if (!input || !out) return;

  const id = input.value.trim();

  if (!id) {
    out.textContent = "Request ID डालें।";
    return;
  }

  try {
    const res = await fetch(
      "/api/track/" + encodeURIComponent(id)
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Request नहीं मिली।");
    }

    out.innerHTML = `
      <div class="success">
        <strong>${data.service}</strong><br>
        नाम: ${data.name}<br>
        स्थिति: <strong>${data.status}</strong><br>
        भुगतान: ${data.payment_status}<br>
        Request ID: ${data.request_id}
      </div>
    `;

  } catch (err) {
    out.innerHTML =
      `<div class="error">${err.message}</div>`;
  }
          }
